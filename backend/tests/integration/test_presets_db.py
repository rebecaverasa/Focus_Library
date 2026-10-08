"""Presets service + routes against a real Postgres."""

import uuid

import pytest
from sqlalchemy import func, select, text
from sqlalchemy.exc import IntegrityError

from app.models import Preset
from app.models.preset import SOUND_IDS
from app.services import presets as svc

pytestmark = [pytest.mark.integration, pytest.mark.anyio]

LEVELS = {"pages": 34, "rain": 66, "clock": 24, "whispers": 0, "fire": 0, "keys": 0}


def data(name="Rainy", **levels):
    return {"name": name, **LEVELS, **levels}


async def test_create_roundtrips_levels(db, make_client):
    cid = await make_client()
    p = await svc.create_preset(db, cid, data())
    assert isinstance(p.id, uuid.UUID) and p.created_at is not None
    assert {s: getattr(p, s) for s in SOUND_IDS} == LEVELS


async def test_list_is_isolated_per_client_and_ordered_by_creation(db, make_client):
    a, b = await make_client(), await make_client()
    for name in ("zeta", "alpha", "mid"):
        await svc.create_preset(db, a, data(name))
    await svc.create_preset(db, b, data("other"))
    assert [p.name for p in await svc.list_presets(db, a)] == ["zeta", "alpha", "mid"]
    assert [p.name for p in await svc.list_presets(db, b)] == ["other"]


async def test_update_partial_keeps_other_levels(db, make_client):
    cid = await make_client()
    p = await svc.create_preset(db, cid, data())
    renamed = await svc.update_preset(db, cid, p.id, {"name": "Quiet"})
    assert renamed.name == "Quiet" and renamed.rain == 66
    tuned = await svc.update_preset(db, cid, p.id, {"fire": 100})
    assert (tuned.name, tuned.fire, tuned.rain) == ("Quiet", 100, 66)


async def test_other_clients_preset_is_untouchable(db, make_client):
    a, b = await make_client(), await make_client()
    p = await svc.create_preset(db, a, data())
    assert await svc.update_preset(db, b, p.id, {"name": "hacked"}) is None
    assert await svc.delete_preset(db, b, p.id) is False
    assert await svc.update_preset(db, a, uuid.uuid4(), {"name": "x"}) is None
    assert (await svc.list_presets(db, a))[0].name == "Rainy"


async def test_delete_removes_once(db, make_client):
    cid = await make_client()
    p = await svc.create_preset(db, cid, data())
    assert await svc.delete_preset(db, cid, p.id) is True
    assert await svc.delete_preset(db, cid, p.id) is False
    assert await svc.list_presets(db, cid) == []


async def test_deleting_the_client_cascades_to_presets(db, make_client):
    a, b = await make_client(), await make_client()
    await svc.create_preset(db, a, data("gone"))
    await svc.create_preset(db, b, data("kept"))
    await db.execute(text("DELETE FROM clients WHERE id = :id"), {"id": a})
    await db.commit()
    assert await db.scalar(select(func.count()).select_from(Preset)) == 1


@pytest.mark.parametrize("sound", SOUND_IDS)
@pytest.mark.parametrize("value", [-1, 101])
async def test_levels_outside_0_100_are_rejected_by_the_database(db, make_client, sound, value):
    cid = await make_client()
    db.add(Preset(client_id=cid, name="bad", **{sound: value}))
    with pytest.raises(IntegrityError, match=f"{sound}_range"):
        await db.commit()
    await db.rollback()


@pytest.mark.parametrize("value", [0, 100])
async def test_level_bounds_are_accepted(db, make_client, value):
    cid = await make_client()
    p = await svc.create_preset(db, cid, data(**dict.fromkeys(SOUND_IDS, value)))
    assert all(getattr(p, s) == value for s in SOUND_IDS)


async def test_http_flow_with_isolation_between_clients(http, auth):
    a, b = uuid.uuid4(), uuid.uuid4()
    created = await http.post("/presets", json=data(" Rainy "), headers=auth(a))
    assert created.status_code == 201
    pid = created.json()["id"]
    assert created.json()["name"] == "Rainy"

    assert [p["id"] for p in (await http.get("/presets", headers=auth(a))).json()] == [pid]
    assert (await http.get("/presets", headers=auth(b))).json() == []
    other = await http.patch(f"/presets/{pid}", json={"rain": 1}, headers=auth(b))
    assert other.status_code == 404
    assert (await http.delete(f"/presets/{pid}", headers=auth(b))).status_code == 404

    patched = await http.patch(f"/presets/{pid}", json={"rain": 10}, headers=auth(a))
    assert patched.json()["rain"] == 10 and patched.json()["pages"] == 34
    too_high = await http.patch(f"/presets/{pid}", json={"rain": 101}, headers=auth(a))
    assert too_high.status_code == 422
    assert (await http.delete(f"/presets/{pid}", headers=auth(a))).status_code == 204
    assert (await http.delete(f"/presets/{pid}", headers=auth(a))).status_code == 404

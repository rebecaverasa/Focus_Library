"""Tasks service + routes against a real Postgres (the route tests elsewhere use a fake)."""

import datetime
import uuid

import pytest
from sqlalchemy import func, select, text
from sqlalchemy.exc import IntegrityError

from app.models import Client, Task
from app.services import tasks as svc

pytestmark = [pytest.mark.integration, pytest.mark.anyio]

D = datetime.date


async def test_create_loads_server_defaults(db, make_client):
    cid = await make_client()
    task = await svc.create_task(db, cid, "read", D(2026, 10, 8))
    assert isinstance(task.id, uuid.UUID)
    assert (task.done, task.mins) == (False, 0)
    assert task.created_at is not None and task.updated_at is not None


async def test_list_filters_by_client_and_date(db, make_client):
    a, b = await make_client(), await make_client()
    await svc.create_task(db, a, "a-today", D(2026, 10, 8))
    await svc.create_task(db, a, "a-tomorrow", D(2026, 10, 9))
    await svc.create_task(db, b, "b-today", D(2026, 10, 8))
    assert [t.title for t in await svc.list_tasks_by_date(db, a, D(2026, 10, 8))] == ["a-today"]
    assert [t.title for t in await svc.list_tasks_by_date(db, b, D(2026, 10, 8))] == ["b-today"]
    assert await svc.list_tasks_by_date(db, a, D(2026, 10, 10)) == []


async def test_list_is_ordered_by_creation_not_title(db, make_client):
    cid = await make_client()
    for title in ("zebra", "apple", "mango"):
        await svc.create_task(db, cid, title, D(2026, 10, 8))  # one commit each => distinct now()
    titles = [t.title for t in await svc.list_tasks_by_date(db, cid, D(2026, 10, 8))]
    assert titles == ["zebra", "apple", "mango"]


async def test_count_per_day_groups_and_only_returns_days_with_notes(db, make_client):
    cid = await make_client()
    for day in (D(2026, 10, 3), D(2026, 10, 3), D(2026, 10, 3), D(2026, 10, 20)):
        await svc.create_task(db, cid, "n", day)
    rows = await svc.count_tasks_per_day(db, cid, D(2026, 10, 1), D(2026, 11, 1))
    assert rows == [(D(2026, 10, 3), 3), (D(2026, 10, 20), 1)]


async def test_count_per_day_month_boundaries_are_half_open(db, make_client):
    cid = await make_client()
    for day in (D(2026, 9, 30), D(2026, 10, 1), D(2026, 10, 31), D(2026, 11, 1)):
        await svc.create_task(db, cid, "n", day)
    rows = await svc.count_tasks_per_day(db, cid, D(2026, 10, 1), D(2026, 11, 1))
    assert rows == [(D(2026, 10, 1), 1), (D(2026, 10, 31), 1)]


async def test_count_per_day_ignores_other_clients(db, make_client):
    a, b = await make_client(), await make_client()
    await svc.create_task(db, a, "n", D(2026, 10, 5))
    await svc.create_task(db, b, "n", D(2026, 10, 5))
    await svc.create_task(db, b, "n", D(2026, 10, 5))
    rows = await svc.count_tasks_per_day(db, a, D(2026, 10, 1), D(2026, 11, 1))
    assert rows == [(D(2026, 10, 5), 1)]


async def test_update_partial_changes_only_given_fields(db, make_client):
    cid = await make_client()
    task = await svc.create_task(db, cid, "old", D(2026, 10, 8))
    before = task.updated_at
    updated = await svc.update_task(db, cid, task.id, {"done": True})
    assert (updated.title, updated.date, updated.done, updated.mins) == (
        "old",
        D(2026, 10, 8),
        True,
        0,
    )
    moved = await svc.update_task(db, cid, task.id, {"date": D(2026, 10, 9), "title": "new"})
    assert (moved.title, moved.date, moved.done) == ("new", D(2026, 10, 9), True)
    assert moved.created_at == task.created_at
    assert moved.updated_at >= before


async def test_update_and_delete_of_another_clients_task_do_nothing(db, make_client):
    a, b = await make_client(), await make_client()
    task = await svc.create_task(db, a, "mine", D(2026, 10, 8))
    assert await svc.update_task(db, b, task.id, {"title": "hacked"}) is None
    assert await svc.delete_task(db, b, task.id) is False
    assert await svc.update_task(db, a, uuid.uuid4(), {"done": True}) is None
    still = (await svc.list_tasks_by_date(db, a, D(2026, 10, 8)))[0]
    assert still.title == "mine"


async def test_delete_removes_once(db, make_client):
    cid = await make_client()
    task = await svc.create_task(db, cid, "x", D(2026, 10, 8))
    assert await svc.delete_task(db, cid, task.id) is True
    assert await svc.delete_task(db, cid, task.id) is False
    assert await svc.list_tasks_by_date(db, cid, D(2026, 10, 8)) == []


async def test_deleting_the_client_cascades_to_tasks(db, make_client):
    a, b = await make_client(), await make_client()
    await svc.create_task(db, a, "gone", D(2026, 10, 8))
    await svc.create_task(db, b, "kept", D(2026, 10, 8))
    await db.execute(text("DELETE FROM clients WHERE id = :id"), {"id": a})
    await db.commit()
    assert await db.scalar(select(func.count()).select_from(Task)) == 1
    assert await db.scalar(select(func.count()).select_from(Client)) == 1


async def test_negative_mins_is_rejected_by_the_database(db, make_client):
    cid = await make_client()
    db.add(Task(client_id=cid, title="x", date=D(2026, 10, 8), mins=-1))
    with pytest.raises(IntegrityError, match="mins_non_negative"):
        await db.commit()
    await db.rollback()


async def test_task_requires_an_existing_client(db):
    db.add(Task(client_id=uuid.uuid4(), title="x", date=D(2026, 10, 8)))
    with pytest.raises(IntegrityError):
        await db.commit()
    await db.rollback()


# End to end through the HTTP layer (real get_client upsert, real SQL).


async def test_http_flow_with_isolation_between_clients(http, auth):
    a, b = uuid.uuid4(), uuid.uuid4()
    payload = {"title": " read ", "date": "2026-10-08"}
    created = await http.post("/tasks", json=payload, headers=auth(a))
    assert created.status_code == 201
    body = created.json()
    assert (body["title"], body["done"], body["mins"]) == ("read", False, 0)
    tid = body["id"]

    listed = await http.get("/tasks", params={"date": "2026-10-08"}, headers=auth(a))
    assert [t["id"] for t in listed.json()] == [tid]
    assert (await http.get("/tasks", params={"date": "2026-10-08"}, headers=auth(b))).json() == []

    # Another client gets 404 (not 403) on someone else's task.
    other = await http.patch(f"/tasks/{tid}", json={"done": True}, headers=auth(b))
    assert other.status_code == 404
    assert (await http.delete(f"/tasks/{tid}", headers=auth(b))).status_code == 404

    patched = await http.patch(f"/tasks/{tid}", json={"done": True}, headers=auth(a))
    assert patched.status_code == 200 and patched.json()["done"] is True
    assert (await http.delete(f"/tasks/{tid}", headers=auth(a))).status_code == 204
    assert (await http.delete(f"/tasks/{tid}", headers=auth(a))).status_code == 404


async def test_http_days_handles_december_to_january(http, auth):
    cid = uuid.uuid4()
    for day in ("2026-11-30", "2026-12-01", "2026-12-31", "2026-12-31", "2027-01-01"):
        r = await http.post("/tasks", json={"title": "n", "date": day}, headers=auth(cid))
        assert r.status_code == 201
    dec = await http.get("/tasks/days", params={"month": "2026-12"}, headers=auth(cid))
    assert dec.json() == [
        {"date": "2026-12-01", "count": 1},
        {"date": "2026-12-31", "count": 2},
    ]
    jan = await http.get("/tasks/days", params={"month": "2027-01"}, headers=auth(cid))
    assert jan.json() == [{"date": "2027-01-01", "count": 1}]
    empty = await http.get("/tasks/days", params={"month": "2027-02"}, headers=auth(cid))
    assert empty.json() == []

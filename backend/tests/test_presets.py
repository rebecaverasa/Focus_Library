import datetime
import uuid

import pytest
from fastapi.testclient import TestClient

from app.api import deps
from app.db.session import get_db
from app.main import app
from app.models.client import Client
from app.models.preset import Preset
from app.services import presets as presets_service

SOUNDS = ("pages", "rain", "clock", "whispers", "fire", "keys")
LEVELS = {"pages": 34, "rain": 66, "clock": 24, "whispers": 0, "fire": 0, "keys": 0}


class FakePresetStore:
    """In-memory stand-in for the presets service (and the client upsert), no database."""

    def __init__(self) -> None:
        self.presets: list[Preset] = []
        self.clock = datetime.datetime(2026, 10, 1, tzinfo=datetime.timezone.utc)

    async def upsert_client(self, db, client_id):
        return Client(id=client_id)

    def _tick(self):
        self.clock += datetime.timedelta(seconds=1)
        return self.clock

    async def list_presets(self, db, client_id):
        found = [p for p in self.presets if p.client_id == client_id]
        return sorted(found, key=lambda p: (p.created_at, p.id))

    async def create_preset(self, db, client_id, data):
        now = self._tick()
        preset = Preset(
            id=uuid.uuid4(), client_id=client_id, created_at=now, updated_at=now, **data
        )
        self.presets.append(preset)
        return preset

    def _owned(self, client_id, preset_id):
        return next(
            (p for p in self.presets if p.id == preset_id and p.client_id == client_id), None
        )

    async def update_preset(self, db, client_id, preset_id, changes):
        preset = self._owned(client_id, preset_id)
        if preset is None:
            return None
        for field, value in changes.items():
            setattr(preset, field, value)
        preset.updated_at = self._tick()
        return preset

    async def delete_preset(self, db, client_id, preset_id):
        preset = self._owned(client_id, preset_id)
        if preset is None:
            return False
        self.presets.remove(preset)
        return True


@pytest.fixture
def store(monkeypatch):
    fake = FakePresetStore()
    monkeypatch.setattr(deps, "upsert_client", fake.upsert_client)
    for name in ("list_presets", "create_preset", "update_preset", "delete_preset"):
        monkeypatch.setattr(presets_service, name, getattr(fake, name))
    return fake


@pytest.fixture
def api(store):
    async def no_db():
        yield None

    app.dependency_overrides[get_db] = no_db
    yield TestClient(app)
    app.dependency_overrides.clear()


@pytest.fixture
def headers():
    return {"X-Client-Id": str(uuid.uuid4())}


def make(api, headers, name="Rainy Reading Room", levels=None):
    payload = {"name": name, **(levels or LEVELS)}
    response = api.post("/presets", json=payload, headers=headers)
    assert response.status_code == 201
    return response.json()


def test_missing_header_returns_400_on_every_route(api):
    pid = uuid.uuid4()
    calls = [
        api.get("/presets"),
        api.post("/presets", json={"name": "x", **LEVELS}),
        api.patch(f"/presets/{pid}", json={"rain": 1}),
        api.delete(f"/presets/{pid}"),
    ]
    assert [r.status_code for r in calls] == [400] * 4


def test_create_returns_201_with_preset_read(api, headers):
    response = api.post(
        "/presets", json={"name": "  Rainy Reading Room  ", **LEVELS}, headers=headers
    )

    assert response.status_code == 201
    body = response.json()
    assert body["name"] == "Rainy Reading Room"
    assert {s: body[s] for s in SOUNDS} == LEVELS
    assert set(body) == {"id", "name", *SOUNDS}


def test_create_accepts_boundaries(api, headers):
    levels = {"pages": 0, "rain": 100, "clock": 0, "whispers": 100, "fire": 0, "keys": 100}

    body = make(api, headers, name="a" * 60, levels=levels)

    assert body["name"] == "a" * 60
    assert {s: body[s] for s in SOUNDS} == levels


@pytest.mark.parametrize(
    "payload",
    [
        {"name": "", **LEVELS},
        {"name": "   ", **LEVELS},
        {"name": "a" * 61, **LEVELS},
        {"name": None, **LEVELS},
        LEVELS,
        {"name": "ok", **{**LEVELS, "rain": 101}},
        {"name": "ok", **{**LEVELS, "rain": -1}},
        {"name": "ok", **{**LEVELS, "rain": "loud"}},
        {"name": "ok", **{k: v for k, v in LEVELS.items() if k != "keys"}},
        {"name": "ok", **LEVELS, "client_id": str(uuid.uuid4())},
        {"name": "ok", **LEVELS, "thunder": 10},
    ],
)
def test_create_validation_returns_422(api, headers, payload):
    assert api.post("/presets", json=payload, headers=headers).status_code == 422


def test_list_returns_own_presets_in_creation_order(api, headers):
    first = make(api, headers, name="first")
    make(api, {"X-Client-Id": str(uuid.uuid4())}, name="not mine")
    second = make(api, headers, name="second")

    response = api.get("/presets", headers=headers)

    assert response.status_code == 200
    assert [p["id"] for p in response.json()] == [first["id"], second["id"]]


def test_empty_list(api, headers):
    assert api.get("/presets", headers=headers).json() == []


def test_patch_is_partial(api, headers):
    preset = make(api, headers)

    response = api.patch(f"/presets/{preset['id']}", json={"fire": 80}, headers=headers)

    assert response.status_code == 200
    body = response.json()
    assert body["fire"] == 80
    assert body["name"] == preset["name"]
    assert body["rain"] == preset["rain"]


def test_patch_renames_trimmed_and_can_zero_a_level(api, headers):
    preset = make(api, headers)

    response = api.patch(
        f"/presets/{preset['id']}", json={"name": " Night ", "rain": 0}, headers=headers
    )

    assert response.json()["name"] == "Night"
    assert response.json()["rain"] == 0
    assert api.get("/presets", headers=headers).json()[0]["name"] == "Night"


@pytest.mark.parametrize(
    "payload",
    [
        {},
        {"name": None},
        {"rain": None},
        {"name": "   "},
        {"name": "a" * 61},
        {"rain": 101},
        {"rain": -1},
        {"rain": "x"},
        {"client_id": str(uuid.uuid4())},
        {"rain": 5, "thunder": 1},
    ],
)
def test_patch_invalid_payload_returns_422(api, headers, payload):
    preset = make(api, headers)

    response = api.patch(f"/presets/{preset['id']}", json=payload, headers=headers)

    assert response.status_code == 422


def test_patch_other_clients_or_missing_preset_returns_404(api, headers):
    preset = make(api, headers)
    stranger = {"X-Client-Id": str(uuid.uuid4())}

    other = api.patch(f"/presets/{preset['id']}", json={"rain": 1}, headers=stranger)
    missing = api.patch(f"/presets/{uuid.uuid4()}", json={"rain": 1}, headers=headers)

    assert other.status_code == 404
    assert missing.status_code == 404
    assert api.get("/presets", headers=headers).json()[0]["rain"] == LEVELS["rain"]


def test_delete_returns_204_and_removes_the_preset(api, headers):
    preset = make(api, headers)

    response = api.delete(f"/presets/{preset['id']}", headers=headers)

    assert response.status_code == 204
    assert response.content == b""
    assert api.get("/presets", headers=headers).json() == []
    assert api.delete(f"/presets/{preset['id']}", headers=headers).status_code == 404


def test_delete_other_clients_preset_returns_404_and_keeps_it(api, headers):
    preset = make(api, headers)
    stranger = {"X-Client-Id": str(uuid.uuid4())}

    assert api.delete(f"/presets/{preset['id']}", headers=stranger).status_code == 404
    assert len(api.get("/presets", headers=headers).json()) == 1


def test_preset_id_must_be_a_uuid(api, headers):
    assert api.patch("/presets/abc", json={"rain": 1}, headers=headers).status_code == 422
    assert api.delete("/presets/abc", headers=headers).status_code == 422

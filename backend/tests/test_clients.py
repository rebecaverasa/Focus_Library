import uuid
from datetime import datetime, timedelta, timezone

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.dialects import postgresql

from app.api import deps
from app.db.session import get_db
from app.main import app
from app.models.client import Client
from app.services.clients import build_upsert_client_statement


class FakeClientStore:
    """In-memory stand-in for the Postgres upsert, so the tests don't need a database."""

    def __init__(self) -> None:
        self.clients: dict[uuid.UUID, Client] = {}
        self.calls = 0

    async def upsert(self, db, client_id: uuid.UUID) -> Client:
        self.calls += 1
        now = datetime.now(timezone.utc) + timedelta(seconds=self.calls)
        client = self.clients.get(client_id)
        if client is None:
            client = Client(id=client_id, created_at=now, updated_at=now, last_seen_at=now)
            self.clients[client_id] = client
        else:
            client.last_seen_at = now
        return client


@pytest.fixture
def store(monkeypatch):
    fake = FakeClientStore()
    monkeypatch.setattr(deps, "upsert_client", fake.upsert)
    return fake


@pytest.fixture
def api(store):
    async def no_db():
        yield None

    app.dependency_overrides[get_db] = no_db
    yield TestClient(app)
    app.dependency_overrides.clear()


def test_missing_header_returns_400(api, store):
    response = api.get("/clients/me")

    assert response.status_code == 400
    assert "X-Client-Id" in response.json()["detail"]
    assert store.calls == 0


@pytest.mark.parametrize("value", ["not-a-uuid", "123", " "])
def test_invalid_header_returns_400(api, store, value):
    response = api.get("/clients/me", headers={"X-Client-Id": value})

    assert response.status_code == 400
    assert store.calls == 0


def test_first_call_creates_the_client(api, store):
    client_id = uuid.uuid4()

    response = api.get("/clients/me", headers={"X-Client-Id": str(client_id)})

    assert response.status_code == 200
    body = response.json()
    assert body["id"] == str(client_id)
    assert set(body) == {"id", "created_at", "last_seen_at"}
    assert list(store.clients) == [client_id]


def test_second_call_reuses_the_client_and_bumps_last_seen(api, store):
    headers = {"X-Client-Id": str(uuid.uuid4())}

    first = api.get("/clients/me", headers=headers).json()
    second = api.get("/clients/me", headers=headers).json()

    assert len(store.clients) == 1
    assert second["id"] == first["id"]
    assert second["created_at"] == first["created_at"]
    assert second["last_seen_at"] > first["last_seen_at"]


def test_header_is_case_insensitive_and_accepts_uppercase_uuid(api, store):
    client_id = uuid.uuid4()

    response = api.get("/clients/me", headers={"x-client-id": str(client_id).upper()})

    assert response.status_code == 200
    assert response.json()["id"] == str(client_id)


def test_cors_preflight_allows_the_client_id_header(api):
    response = api.options(
        "/clients/me",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "GET",
            "Access-Control-Request-Headers": "x-client-id",
        },
    )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:5173"
    assert "x-client-id" in response.headers["access-control-allow-headers"].lower()


def test_upsert_statement_is_an_insert_on_conflict_that_bumps_last_seen():
    sql = str(build_upsert_client_statement(uuid.uuid4()).compile(dialect=postgresql.dialect()))

    assert sql.startswith("INSERT INTO clients")
    assert "ON CONFLICT (id) DO UPDATE SET last_seen_at = now()" in sql
    assert "RETURNING" in sql


def test_client_model_table():
    columns = Client.__table__.c

    assert Client.__tablename__ == "clients"
    assert columns.id.primary_key
    assert {"created_at", "updated_at", "last_seen_at"} <= set(columns.keys())

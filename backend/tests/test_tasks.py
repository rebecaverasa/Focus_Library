import datetime
import uuid

import pytest
from fastapi.testclient import TestClient

from app.api import deps
from app.db.session import get_db
from app.main import app
from app.models.client import Client
from app.models.task import Task
from app.services import tasks as tasks_service


class FakeTaskStore:
    """In-memory stand-in for the tasks service (and the client upsert), no database."""

    def __init__(self) -> None:
        self.tasks: list[Task] = []
        self.clock = datetime.datetime(2026, 10, 1, tzinfo=datetime.timezone.utc)

    async def upsert_client(self, db, client_id):
        return Client(id=client_id)

    def _tick(self):
        self.clock += datetime.timedelta(seconds=1)
        return self.clock

    async def list_tasks_by_date(self, db, client_id, day):
        found = [t for t in self.tasks if t.client_id == client_id and t.date == day]
        return sorted(found, key=lambda t: (t.created_at, t.id))

    async def count_tasks_per_day(self, db, client_id, first, next_first):
        counts: dict[datetime.date, int] = {}
        for t in self.tasks:
            if t.client_id == client_id and first <= t.date < next_first:
                counts[t.date] = counts.get(t.date, 0) + 1
        return sorted(counts.items())

    async def create_task(self, db, client_id, title, day):
        now = self._tick()
        task = Task(
            id=uuid.uuid4(),
            client_id=client_id,
            title=title,
            date=day,
            done=False,
            mins=0,
            created_at=now,
            updated_at=now,
        )
        self.tasks.append(task)
        return task

    def _owned(self, client_id, task_id):
        return next((t for t in self.tasks if t.id == task_id and t.client_id == client_id), None)

    async def update_task(self, db, client_id, task_id, changes):
        task = self._owned(client_id, task_id)
        if task is None:
            return None
        for field, value in changes.items():
            setattr(task, field, value)
        task.updated_at = self._tick()
        return task

    async def delete_task(self, db, client_id, task_id):
        task = self._owned(client_id, task_id)
        if task is None:
            return False
        self.tasks.remove(task)
        return True


@pytest.fixture
def store(monkeypatch):
    fake = FakeTaskStore()
    monkeypatch.setattr(deps, "upsert_client", fake.upsert_client)
    for name in (
        "list_tasks_by_date",
        "count_tasks_per_day",
        "create_task",
        "update_task",
        "delete_task",
    ):
        monkeypatch.setattr(tasks_service, name, getattr(fake, name))
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


def make(api, headers, title="Read chapter 3", date="2026-10-07"):
    response = api.post("/tasks", json={"title": title, "date": date}, headers=headers)
    assert response.status_code == 201
    return response.json()


def test_missing_header_returns_400_on_every_route(api):
    tid = uuid.uuid4()
    calls = [
        api.get("/tasks", params={"date": "2026-10-07"}),
        api.get("/tasks/days", params={"month": "2026-10"}),
        api.post("/tasks", json={"title": "x", "date": "2026-10-07"}),
        api.patch(f"/tasks/{tid}", json={"done": True}),
        api.delete(f"/tasks/{tid}"),
    ]
    assert [r.status_code for r in calls] == [400] * 5


def test_create_returns_201_with_task_read(api, headers):
    response = api.post(
        "/tasks", json={"title": "  Read chapter 3  ", "date": "2026-10-07"}, headers=headers
    )

    assert response.status_code == 201
    body = response.json()
    assert body["title"] == "Read chapter 3"
    assert body["date"] == "2026-10-07"
    assert body["done"] is False
    assert body["mins"] == 0
    assert set(body) == {"id", "title", "date", "done", "mins", "created_at", "updated_at"}


@pytest.mark.parametrize(
    "payload",
    [
        {"title": "", "date": "2026-10-07"},
        {"title": "    ", "date": "2026-10-07"},
        {"title": "a" * 201, "date": "2026-10-07"},
        {"title": "ok", "date": "not-a-date"},
        {"title": "ok", "date": "2026-02-30"},
        {"title": "ok"},
        {"date": "2026-10-07"},
        {"title": None, "date": "2026-10-07"},
    ],
)
def test_create_validation_returns_422(api, headers, payload):
    assert api.post("/tasks", json=payload, headers=headers).status_code == 422


def test_create_accepts_title_of_exactly_200_chars(api, headers):
    assert make(api, headers, title="a" * 200)["title"] == "a" * 200


def test_list_requires_a_valid_date(api, headers):
    assert api.get("/tasks", headers=headers).status_code == 422
    assert api.get("/tasks", params={"date": "nope"}, headers=headers).status_code == 422


def test_list_returns_only_that_day_in_creation_order(api, headers):
    first = make(api, headers, title="first")
    make(api, headers, title="other day", date="2026-10-08")
    second = make(api, headers, title="second")

    response = api.get("/tasks", params={"date": "2026-10-07"}, headers=headers)

    assert response.status_code == 200
    assert [t["id"] for t in response.json()] == [first["id"], second["id"]]


def test_list_only_returns_the_clients_own_tasks(api, headers):
    mine = make(api, headers)
    other = {"X-Client-Id": str(uuid.uuid4())}
    make(api, other, title="not mine")

    body = api.get("/tasks", params={"date": "2026-10-07"}, headers=headers).json()

    assert [t["id"] for t in body] == [mine["id"]]


def test_empty_day_returns_empty_list(api, headers):
    response = api.get("/tasks", params={"date": "2026-10-07"}, headers=headers)

    assert response.status_code == 200
    assert response.json() == []


def test_patch_is_partial(api, headers):
    task = make(api, headers)

    response = api.patch(f"/tasks/{task['id']}", json={"done": True}, headers=headers)

    assert response.status_code == 200
    body = response.json()
    assert body["done"] is True
    assert body["title"] == task["title"]
    assert body["date"] == task["date"]


def test_patch_title_is_trimmed_and_date_moves_the_task(api, headers):
    task = make(api, headers)

    response = api.patch(
        f"/tasks/{task['id']}", json={"title": " New ", "date": "2026-10-09"}, headers=headers
    )

    assert response.json()["title"] == "New"
    assert response.json()["date"] == "2026-10-09"
    assert api.get("/tasks", params={"date": "2026-10-07"}, headers=headers).json() == []


@pytest.mark.parametrize(
    "payload",
    [
        {},
        {"title": None},
        {"done": None},
        {"date": None},
        {"title": "   "},
        {"title": "a" * 201},
        {"date": "bad"},
        {"mins": 5},
        {"mins": -1},
        {"done": True, "client_id": str(uuid.uuid4())},
    ],
)
def test_patch_invalid_payload_returns_422(api, headers, payload):
    task = make(api, headers)

    response = api.patch(f"/tasks/{task['id']}", json=payload, headers=headers)

    assert response.status_code == 422


def test_patch_other_clients_or_missing_task_returns_404(api, headers):
    task = make(api, headers)
    stranger = {"X-Client-Id": str(uuid.uuid4())}

    other = api.patch(f"/tasks/{task['id']}", json={"done": True}, headers=stranger)
    missing = api.patch(f"/tasks/{uuid.uuid4()}", json={"done": True}, headers=headers)

    assert other.status_code == 404
    assert missing.status_code == 404
    unchanged = api.get("/tasks", params={"date": "2026-10-07"}, headers=headers).json()
    assert unchanged[0]["done"] is False


def test_delete_returns_204_and_removes_the_task(api, headers):
    task = make(api, headers)

    response = api.delete(f"/tasks/{task['id']}", headers=headers)

    assert response.status_code == 204
    assert response.content == b""
    assert api.get("/tasks", params={"date": "2026-10-07"}, headers=headers).json() == []
    assert api.delete(f"/tasks/{task['id']}", headers=headers).status_code == 404


def test_delete_other_clients_task_returns_404_and_keeps_it(api, headers):
    task = make(api, headers)
    stranger = {"X-Client-Id": str(uuid.uuid4())}

    assert api.delete(f"/tasks/{task['id']}", headers=stranger).status_code == 404
    assert len(api.get("/tasks", params={"date": "2026-10-07"}, headers=headers).json()) == 1


def test_task_id_must_be_a_uuid(api, headers):
    assert api.patch("/tasks/abc", json={"done": True}, headers=headers).status_code == 422
    assert api.delete("/tasks/abc", headers=headers).status_code == 422


def test_days_counts_notes_of_the_month_only_for_this_client(api, headers):
    make(api, headers, date="2026-10-07")
    make(api, headers, date="2026-10-07")
    make(api, headers, date="2026-10-31")
    make(api, headers, date="2026-11-01")
    make(api, headers, date="2026-09-30")
    make(api, {"X-Client-Id": str(uuid.uuid4())}, date="2026-10-15")

    response = api.get("/tasks/days", params={"month": "2026-10"}, headers=headers)

    assert response.status_code == 200
    assert response.json() == [
        {"date": "2026-10-07", "count": 2},
        {"date": "2026-10-31", "count": 1},
    ]


def test_days_december_rolls_over_the_year(api, headers):
    make(api, headers, date="2026-12-31")
    make(api, headers, date="2027-01-01")

    body = api.get("/tasks/days", params={"month": "2026-12"}, headers=headers).json()

    assert body == [{"date": "2026-12-31", "count": 1}]


@pytest.mark.parametrize("month", ["2026-13", "2026-00", "2026-1", "202610", "abc"])
def test_days_rejects_invalid_month(api, headers, month):
    assert api.get("/tasks/days", params={"month": month}, headers=headers).status_code == 422
    assert api.get("/tasks/days", headers=headers).status_code == 422


@pytest.mark.parametrize("method", ["GET", "POST", "PATCH", "DELETE"])
def test_cors_preflight_allows_task_methods(api, method):
    response = api.options(
        f"/tasks/{uuid.uuid4()}",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": method,
            "Access-Control-Request-Headers": "x-client-id,content-type",
        },
    )

    assert response.status_code == 200
    assert method in response.headers["access-control-allow-methods"]

import datetime
import uuid

import pytest
from pydantic import ValidationError
from sqlalchemy import CheckConstraint, Date, ForeignKeyConstraint, Integer, String
from sqlalchemy.dialects.postgresql import UUID

from app.models import Task
from app.schemas.task import TaskRead

table = Task.__table__


def test_table_name_and_columns():
    assert table.name == "tasks"
    assert set(table.c.keys()) == {
        "id",
        "created_at",
        "updated_at",
        "client_id",
        "title",
        "date",
        "done",
        "mins",
    }


def test_column_types_and_nullability():
    assert isinstance(table.c.client_id.type, UUID)
    assert isinstance(table.c.title.type, String) and table.c.title.type.length == 200
    assert isinstance(table.c.date.type, Date)
    assert isinstance(table.c.mins.type, Integer)
    assert all(
        not table.c[name].nullable for name in ("client_id", "title", "date", "done", "mins")
    )


def test_defaults_are_set_by_the_database():
    assert str(table.c.done.server_default.arg) == "false"
    assert str(table.c.mins.server_default.arg) == "0"


def test_client_fk_cascades():
    fk = next(c for c in table.constraints if isinstance(c, ForeignKeyConstraint))

    assert [e.target_fullname for e in fk.elements] == ["clients.id"]
    assert fk.ondelete == "CASCADE"
    assert fk.name == "fk_tasks_client_id_clients"


def test_index_by_client_and_date():
    index = next(i for i in table.indexes if i.name == "ix_tasks_client_id_date")

    assert [c.name for c in index.columns] == ["client_id", "date"]


def test_mins_check_constraint():
    check = next(c for c in table.constraints if isinstance(c, CheckConstraint))

    assert check.name == "ck_tasks_mins_non_negative"
    assert str(check.sqltext) == "mins >= 0"


def test_task_read_serializes_from_attributes():
    now = datetime.datetime.now(datetime.timezone.utc)
    task = Task(id=uuid.uuid4(), title="Read", date=datetime.date(2026, 10, 7), done=False, mins=0)
    task.created_at = task.updated_at = now

    data = TaskRead.model_validate(task).model_dump()

    assert data["title"] == "Read" and data["date"] == datetime.date(2026, 10, 7)
    assert "client_id" not in data


def test_task_read_rejects_invalid_date():
    with pytest.raises(ValidationError):
        TaskRead.model_validate(
            {
                "id": uuid.uuid4(),
                "title": "x",
                "date": "not-a-date",
                "done": False,
                "mins": 0,
                "created_at": datetime.datetime.now(),
                "updated_at": datetime.datetime.now(),
            }
        )

import datetime
import uuid
from typing import Annotated

from pydantic import BaseModel, BeforeValidator, ConfigDict, Field, model_validator

from app.models.task import TASK_TITLE_MAX_LENGTH


class TaskRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    date: datetime.date
    done: bool
    mins: int
    created_at: datetime.datetime
    updated_at: datetime.datetime


def _strip(value):
    # Trim before the length checks so "   " is rejected and padding doesn't eat the limit.
    return value.strip() if isinstance(value, str) else value


TaskTitle = Annotated[
    str, BeforeValidator(_strip), Field(min_length=1, max_length=TASK_TITLE_MAX_LENGTH)
]


class TaskCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: TaskTitle
    date: datetime.date


class TaskUpdate(BaseModel):
    """Partial update. `mins` is deliberately not editable: only focus sessions (BE-19) log
    minutes, so the client can't rewrite them. Unknown fields are a 422, not silently dropped."""

    model_config = ConfigDict(extra="forbid")

    title: TaskTitle | None = None
    done: bool | None = None
    # Lets a note move to another day.
    date: datetime.date | None = None

    @model_validator(mode="after")
    def _at_least_one_real_value(self):
        # An empty body is almost surely a client bug, and null would violate NOT NULL.
        if not self.model_fields_set:
            raise ValueError("Send at least one of: title, done, date.")
        if any(getattr(self, name) is None for name in self.model_fields_set):
            raise ValueError("title, done and date cannot be null.")
        return self


class TaskDayCount(BaseModel):
    date: datetime.date
    count: int

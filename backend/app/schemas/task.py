import datetime
import uuid

from pydantic import BaseModel, ConfigDict


class TaskRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    date: datetime.date
    done: bool
    mins: int
    created_at: datetime.datetime
    updated_at: datetime.datetime

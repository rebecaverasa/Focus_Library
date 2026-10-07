import datetime
import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import CurrentClient
from app.db.session import get_db
from app.schemas.task import TaskCreate, TaskDayCount, TaskRead, TaskUpdate
from app.services import tasks as tasks_service

router = APIRouter(prefix="/tasks", tags=["tasks"])

DB = Annotated[AsyncSession, Depends(get_db)]

_NOT_FOUND = HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found.")


@router.get("", response_model=list[TaskRead])
async def list_tasks(
    client: CurrentClient, db: DB, date: Annotated[datetime.date, Query()]
) -> list[TaskRead]:
    tasks = await tasks_service.list_tasks_by_date(db, client.id, date)
    return [TaskRead.model_validate(t) for t in tasks]


# Declared before the /{task_id} routes so "days" is never read as an id.
@router.get("/days", response_model=list[TaskDayCount])
async def count_tasks_per_day(
    client: CurrentClient,
    db: DB,
    month: Annotated[str, Query(pattern=r"^\d{4}-(0[1-9]|1[0-2])$", examples=["2026-10"])],
) -> list[TaskDayCount]:
    """Note count per day of a month (YYYY-MM): the day picker's dots. Days without notes
    are omitted."""
    year, mon = (int(part) for part in month.split("-"))
    first = datetime.date(year, mon, 1)
    next_first = datetime.date(year + (mon == 12), mon % 12 + 1, 1)
    rows = await tasks_service.count_tasks_per_day(db, client.id, first, next_first)
    return [TaskDayCount(date=day, count=count) for day, count in rows]


@router.post("", response_model=TaskRead, status_code=status.HTTP_201_CREATED)
async def create_task(body: TaskCreate, client: CurrentClient, db: DB) -> TaskRead:
    task = await tasks_service.create_task(db, client.id, body.title, body.date)
    return TaskRead.model_validate(task)


@router.patch("/{task_id}", response_model=TaskRead)
async def update_task(
    task_id: uuid.UUID, body: TaskUpdate, client: CurrentClient, db: DB
) -> TaskRead:
    task = await tasks_service.update_task(
        db, client.id, task_id, body.model_dump(exclude_unset=True)
    )
    if task is None:
        raise _NOT_FOUND
    return TaskRead.model_validate(task)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(task_id: uuid.UUID, client: CurrentClient, db: DB) -> Response:
    if not await tasks_service.delete_task(db, client.id, task_id):
        raise _NOT_FOUND
    return Response(status_code=status.HTTP_204_NO_CONTENT)

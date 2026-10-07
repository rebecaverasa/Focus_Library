import datetime
import uuid

from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.task import Task

# Every query filters by client_id: a task of another client is indistinguishable from a
# missing one (callers answer 404), so existence never leaks.


async def list_tasks_by_date(db: AsyncSession, client_id: uuid.UUID, day: datetime.date):
    result = await db.execute(
        select(Task)
        .where(Task.client_id == client_id, Task.date == day)
        .order_by(Task.created_at, Task.id)
    )
    return list(result.scalars())


async def count_tasks_per_day(
    db: AsyncSession, client_id: uuid.UUID, first: datetime.date, next_first: datetime.date
):
    """Notes per day in [first, next_first), for the day picker dots, in one grouped query."""
    result = await db.execute(
        select(Task.date, func.count())
        .where(Task.client_id == client_id, Task.date >= first, Task.date < next_first)
        .group_by(Task.date)
        .order_by(Task.date)
    )
    return [(day, count) for day, count in result.all()]


async def create_task(db: AsyncSession, client_id: uuid.UUID, title: str, day: datetime.date):
    task = Task(client_id=client_id, title=title, date=day)
    db.add(task)
    await db.commit()
    await db.refresh(task)  # loads server defaults (id, done, mins, timestamps)
    return task


async def _get_owned(db: AsyncSession, client_id: uuid.UUID, task_id: uuid.UUID):
    result = await db.execute(select(Task).where(Task.id == task_id, Task.client_id == client_id))
    return result.scalar_one_or_none()


async def update_task(db: AsyncSession, client_id: uuid.UUID, task_id: uuid.UUID, changes: dict):
    """Apply the given fields; returns None if the task isn't the client's."""
    task = await _get_owned(db, client_id, task_id)
    if task is None:
        return None
    for field, value in changes.items():
        setattr(task, field, value)
    await db.commit()
    await db.refresh(task)  # updated_at is set by the database
    return task


async def delete_task(db: AsyncSession, client_id: uuid.UUID, task_id: uuid.UUID) -> bool:
    result = await db.execute(
        delete(Task).where(Task.id == task_id, Task.client_id == client_id).returning(Task.id)
    )
    deleted = result.first() is not None
    await db.commit()
    return deleted

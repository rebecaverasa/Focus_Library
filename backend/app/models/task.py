import datetime
import uuid

from sqlalchemy import Boolean, CheckConstraint, Date, ForeignKey, Index, Integer, String, false
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.db.mixins import TimestampMixin, UUIDPrimaryKeyMixin

TASK_TITLE_MAX_LENGTH = 200


class Task(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """A note/task of one day, owned by an anonymous client.

    Not persisted on purpose: "active/In focus" (it lives in the timer, client state) and
    the "25m estimate" (derived from the default focus duration). The list is ordered by
    created_at, which matches the insertion order the UI shows, so no position column.
    """

    __tablename__ = "tasks"
    __table_args__ = (
        CheckConstraint("mins >= 0", name="mins_non_negative"),
        # Serves "tasks of a day" and "notes per day of a month"; its leading client_id
        # also covers lookups by client alone.
        Index("ix_tasks_client_id_date", "client_id", "date"),
    )

    client_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("clients.id", ondelete="CASCADE")
    )
    title: Mapped[str] = mapped_column(String(TASK_TITLE_MAX_LENGTH))
    # The calendar day the note belongs to (not a timestamp, so no timezone ambiguity).
    date: Mapped[datetime.date] = mapped_column(Date)
    done: Mapped[bool] = mapped_column(Boolean, server_default=false())
    # Focus minutes logged on this task; FocusSession (BE-18/19) adds to it.
    mins: Mapped[int] = mapped_column(Integer, server_default="0")

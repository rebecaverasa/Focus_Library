import uuid

from sqlalchemy import CheckConstraint, ForeignKey, Index, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.db.mixins import TimestampMixin, UUIDPrimaryKeyMixin

PRESET_NAME_MAX_LENGTH = 60
# Fixed sound ids, same as frontend/src/audio/sounds.ts.
SOUND_IDS = ("pages", "rain", "clock", "whispers", "fire", "keys")
LEVEL_MIN = 0
LEVEL_MAX = 100


class Preset(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """A saved ambience scene: a name plus one 0-100 level per fixed sound, owned by a client.

    One integer column per sound (instead of JSONB): the set of sounds is fixed and small, so
    each level gets a real NOT NULL + CHECK range enforced by the database, with no
    app-side validation of a free-form document. Adding a sound later is a simple migration.
    """

    __tablename__ = "presets"
    __table_args__ = (
        *(
            CheckConstraint(f"{s} >= {LEVEL_MIN} AND {s} <= {LEVEL_MAX}", name=f"{s}_range")
            for s in SOUND_IDS
        ),
        Index("ix_presets_client_id", "client_id"),
    )

    client_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("clients.id", ondelete="CASCADE")
    )
    name: Mapped[str] = mapped_column(String(PRESET_NAME_MAX_LENGTH))
    pages: Mapped[int] = mapped_column(Integer, server_default="0")
    rain: Mapped[int] = mapped_column(Integer, server_default="0")
    clock: Mapped[int] = mapped_column(Integer, server_default="0")
    whispers: Mapped[int] = mapped_column(Integer, server_default="0")
    fire: Mapped[int] = mapped_column(Integer, server_default="0")
    keys: Mapped[int] = mapped_column(Integer, server_default="0")

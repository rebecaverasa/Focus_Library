from sqlalchemy import UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.db.mixins import TimestampMixin, UUIDPrimaryKeyMixin


class _SchemaCheckModel(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "_schema_check_model"
    __table_args__ = (UniqueConstraint("slug"),)

    slug: Mapped[str] = mapped_column()


def test_uuid_primary_key_mixin_adds_a_uuid_primary_key():
    column = _SchemaCheckModel.__table__.c.id

    assert column.primary_key
    assert isinstance(column.type, UUID)


def test_timestamp_mixin_adds_created_and_updated_at():
    columns = _SchemaCheckModel.__table__.c

    assert "created_at" in columns
    assert "updated_at" in columns


def test_naming_convention_names_the_unique_constraint():
    table = _SchemaCheckModel.__table__
    constraint = next(iter(table.constraints - {table.primary_key}))

    assert constraint.name == "uq__schema_check_model_slug"

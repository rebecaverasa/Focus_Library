from sqlalchemy import MetaData
from sqlalchemy.orm import DeclarativeBase

# Without this, Alembic autogenerate names constraints/indexes after whatever Postgres
# picks by default, which differs across runs/DBs and makes migrations hard to
# downgrade/rename later. This is the naming scheme recommended by both the SQLAlchemy
# and Alembic docs.
NAMING_CONVENTION = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}


class Base(DeclarativeBase):
    """Base class every ORM model inherits from, so Alembic autogenerate can see them."""

    metadata = MetaData(naming_convention=NAMING_CONVENTION)

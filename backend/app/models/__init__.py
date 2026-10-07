"""Every model is imported here so `Base.metadata` is complete wherever this package is
imported (Alembic autogenerate relies on it)."""

from app.models.client import Client

__all__ = ["Client"]

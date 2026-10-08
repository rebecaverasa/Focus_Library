"""Every model is imported here so `Base.metadata` is complete wherever this package is
imported (Alembic autogenerate relies on it)."""

from app.models.client import Client
from app.models.preset import Preset
from app.models.task import Task

__all__ = ["Client", "Preset", "Task"]

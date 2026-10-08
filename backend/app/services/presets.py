import uuid

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.preset import Preset

# Every query filters by client_id: a preset of another client is indistinguishable from a
# missing one (callers answer 404), so existence never leaks.


async def list_presets(db: AsyncSession, client_id: uuid.UUID):
    result = await db.execute(
        select(Preset).where(Preset.client_id == client_id).order_by(Preset.created_at, Preset.id)
    )
    return list(result.scalars())


async def create_preset(db: AsyncSession, client_id: uuid.UUID, data: dict):
    preset = Preset(client_id=client_id, **data)
    db.add(preset)
    await db.commit()
    await db.refresh(preset)  # loads server defaults (id, timestamps)
    return preset


async def update_preset(
    db: AsyncSession, client_id: uuid.UUID, preset_id: uuid.UUID, changes: dict
):
    """Apply the given fields; returns None if the preset isn't the client's."""
    result = await db.execute(
        select(Preset).where(Preset.id == preset_id, Preset.client_id == client_id)
    )
    preset = result.scalar_one_or_none()
    if preset is None:
        return None
    for field, value in changes.items():
        setattr(preset, field, value)
    await db.commit()
    await db.refresh(preset)  # updated_at is set by the database
    return preset


async def delete_preset(db: AsyncSession, client_id: uuid.UUID, preset_id: uuid.UUID) -> bool:
    result = await db.execute(
        delete(Preset)
        .where(Preset.id == preset_id, Preset.client_id == client_id)
        .returning(Preset.id)
    )
    deleted = result.first() is not None
    await db.commit()
    return deleted

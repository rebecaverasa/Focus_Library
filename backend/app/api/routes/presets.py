import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import CurrentClient
from app.db.session import get_db
from app.schemas.preset import PresetCreate, PresetRead, PresetUpdate
from app.services import presets as presets_service

router = APIRouter(prefix="/presets", tags=["presets"])

DB = Annotated[AsyncSession, Depends(get_db)]

_NOT_FOUND = HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Preset not found.")


@router.get("", response_model=list[PresetRead])
async def list_presets(client: CurrentClient, db: DB) -> list[PresetRead]:
    presets = await presets_service.list_presets(db, client.id)
    return [PresetRead.model_validate(p) for p in presets]


@router.post("", response_model=PresetRead, status_code=status.HTTP_201_CREATED)
async def create_preset(body: PresetCreate, client: CurrentClient, db: DB) -> PresetRead:
    preset = await presets_service.create_preset(db, client.id, body.model_dump())
    return PresetRead.model_validate(preset)


@router.patch("/{preset_id}", response_model=PresetRead)
async def update_preset(
    preset_id: uuid.UUID, body: PresetUpdate, client: CurrentClient, db: DB
) -> PresetRead:
    preset = await presets_service.update_preset(
        db, client.id, preset_id, body.model_dump(exclude_unset=True)
    )
    if preset is None:
        raise _NOT_FOUND
    return PresetRead.model_validate(preset)


@router.delete("/{preset_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_preset(preset_id: uuid.UUID, client: CurrentClient, db: DB) -> Response:
    if not await presets_service.delete_preset(db, client.id, preset_id):
        raise _NOT_FOUND
    return Response(status_code=status.HTTP_204_NO_CONTENT)

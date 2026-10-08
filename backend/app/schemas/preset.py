import uuid
from typing import Annotated

from pydantic import BaseModel, BeforeValidator, ConfigDict, Field

from app.models.preset import LEVEL_MAX, LEVEL_MIN, PRESET_NAME_MAX_LENGTH


def _strip(value):
    # Trim before the length checks so "   " is rejected and padding doesn't eat the limit.
    return value.strip() if isinstance(value, str) else value


PresetName = Annotated[
    str, BeforeValidator(_strip), Field(min_length=1, max_length=PRESET_NAME_MAX_LENGTH)
]
Level = Annotated[int, Field(ge=LEVEL_MIN, le=LEVEL_MAX)]


class PresetLevels(BaseModel):
    pages: Level
    rain: Level
    clock: Level
    whispers: Level
    fire: Level
    keys: Level


class PresetRead(PresetLevels):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str


class PresetCreate(PresetLevels):
    model_config = ConfigDict(extra="forbid")

    name: PresetName

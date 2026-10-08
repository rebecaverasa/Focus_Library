import uuid
from typing import Annotated

from pydantic import BaseModel, BeforeValidator, ConfigDict, Field, model_validator

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


class PresetUpdate(BaseModel):
    """Partial update (rename and/or change levels). Unknown fields are a 422."""

    model_config = ConfigDict(extra="forbid")

    name: PresetName | None = None
    pages: Level | None = None
    rain: Level | None = None
    clock: Level | None = None
    whispers: Level | None = None
    fire: Level | None = None
    keys: Level | None = None

    @model_validator(mode="after")
    def _at_least_one_real_value(self):
        # An empty body is almost surely a client bug, and null would violate NOT NULL.
        if not self.model_fields_set:
            raise ValueError("Send at least one field to change.")
        if any(getattr(self, name) is None for name in self.model_fields_set):
            raise ValueError("Fields cannot be null.")
        return self

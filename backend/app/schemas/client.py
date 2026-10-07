import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ClientRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    created_at: datetime
    last_seen_at: datetime

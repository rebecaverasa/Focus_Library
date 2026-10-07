from fastapi import APIRouter

from app.api.deps import CurrentClient
from app.schemas.client import ClientRead

router = APIRouter(prefix="/clients", tags=["clients"])


@router.get("/me", response_model=ClientRead)
async def read_current_client(client: CurrentClient) -> ClientRead:
    """Lets the frontend (FE-3) check its X-Client-Id round-trips and is registered."""
    return ClientRead.model_validate(client)

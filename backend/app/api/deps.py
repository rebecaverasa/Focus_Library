import uuid
from typing import Annotated

from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.client import Client
from app.services.clients import upsert_client

CLIENT_ID_HEADER = "X-Client-Id"


def parse_client_id(raw: str | None) -> uuid.UUID:
    """Missing or malformed IDs are a client bug (FE-3 always sends one), hence 400."""
    if not raw:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Missing {CLIENT_ID_HEADER} header.",
        )
    try:
        return uuid.UUID(raw)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"{CLIENT_ID_HEADER} must be a valid UUID.",
        ) from None


async def get_client(
    db: Annotated[AsyncSession, Depends(get_db)],
    # Optional at the FastAPI level so we answer 400 with our own message instead of the
    # generic 422; alias keeps the documented header name in /docs.
    x_client_id: Annotated[str | None, Header(alias=CLIENT_ID_HEADER)] = None,
) -> Client:
    """Resolve the anonymous browser behind the request. Every data route depends on this
    and must filter its queries by the returned client's id."""
    client_id = parse_client_id(x_client_id)
    return await upsert_client(db, client_id)


CurrentClient = Annotated[Client, Depends(get_client)]

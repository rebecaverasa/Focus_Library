import uuid

from sqlalchemy import func
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.client import Client


def build_upsert_client_statement(client_id: uuid.UUID):
    """INSERT ... ON CONFLICT so two concurrent first requests from the same browser
    can't race into a duplicate-key error."""
    stmt = insert(Client).values(id=client_id)
    return stmt.on_conflict_do_update(
        index_elements=[Client.id],
        set_={"last_seen_at": func.now()},
    ).returning(Client)


async def upsert_client(db: AsyncSession, client_id: uuid.UUID) -> Client:
    """Create the Client on its first request, otherwise just bump last_seen_at."""
    result = await db.execute(
        build_upsert_client_statement(client_id),
        execution_options={"populate_existing": True},
    )
    client = result.scalar_one()
    await db.commit()
    return client

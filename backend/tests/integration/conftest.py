"""Fixtures for tests that run against a real Postgres (marker: integration).

They need TEST_DATABASE_URL pointing at a database whose name ends in "_test"; without it
the whole directory is skipped, so a plain `pytest` still works with no database. The
schema is built from the models (create_all) in that dedicated database, never in the dev
one, and every test starts from empty tables.
"""

import asyncio
import os
import uuid
from urllib.parse import urlsplit, urlunsplit

import asyncpg
import httpx
import pytest
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.pool import NullPool

from app.db.base import Base
from app.db.session import get_db
from app.main import app
from app.models import Client

TEST_DATABASE_URL = os.environ.get("TEST_DATABASE_URL")
SKIP_REASON = (
    "Integration tests need a real Postgres: set TEST_DATABASE_URL "
    "(e.g. postgresql://focus:change-me@localhost:5432/focus_library_test). See commands.md."
)


def pytest_collection_modifyitems(items):
    if TEST_DATABASE_URL:
        return
    skip = pytest.mark.skip(reason=SKIP_REASON)
    for item in items:
        if "integration" in item.keywords:
            item.add_marker(skip)


def _split(url: str) -> tuple[str, str]:
    """Return (url of the maintenance 'postgres' db, name of the test db)."""
    parts = urlsplit(url)
    return urlunsplit(parts._replace(path="/postgres")), parts.path.lstrip("/")


def _asyncpg_dsn(url: str) -> str:
    return url.replace("postgresql+asyncpg://", "postgresql://", 1)


def _sqlalchemy_url(url: str) -> str:
    return url.replace("postgresql://", "postgresql+asyncpg://", 1)


async def _prepare_database(url: str) -> None:
    admin_url, name = _split(_asyncpg_dsn(url))
    # Guard: create_all/drop_all must never touch a dev or prod database by accident.
    if not name.endswith("_test"):
        raise RuntimeError(f"TEST_DATABASE_URL must point to a database ending in '_test': {name}")
    admin = await asyncpg.connect(admin_url)
    try:
        exists = await admin.fetchval("SELECT 1 FROM pg_database WHERE datname = $1", name)
        if not exists:
            await admin.execute(f'CREATE DATABASE "{name}"')
    finally:
        await admin.close()

    engine = create_async_engine(_sqlalchemy_url(url), poolclass=NullPool)
    async with engine.begin() as conn:
        # Fresh schema each run, so model changes never meet stale tables.
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    await engine.dispose()


@pytest.fixture(scope="session")
def anyio_backend():
    return "asyncio"


@pytest.fixture(scope="session")
def _database():
    if not TEST_DATABASE_URL:
        pytest.skip(SKIP_REASON)
    asyncio.run(_prepare_database(TEST_DATABASE_URL))
    return _sqlalchemy_url(TEST_DATABASE_URL)


@pytest.fixture
async def engine(_database):
    # NullPool: each test runs in its own event loop, so connections can't be reused.
    eng = create_async_engine(_database, poolclass=NullPool)
    yield eng
    async with eng.begin() as conn:
        # Services commit for real, so isolation is a wipe after each test (tasks and
        # presets go with their client through ON DELETE CASCADE).
        await conn.exec_driver_sql("TRUNCATE clients CASCADE")
    await eng.dispose()


@pytest.fixture
def session_factory(engine):
    return async_sessionmaker(engine, expire_on_commit=False)


@pytest.fixture
async def db(session_factory):
    async with session_factory() as session:
        yield session


@pytest.fixture
async def make_client(session_factory):
    """Create a Client row (tasks/presets have an FK to it) and return its id."""

    async def _make() -> uuid.UUID:
        async with session_factory() as session:
            client = Client(id=uuid.uuid4())
            session.add(client)
            await session.commit()
            return client.id

    return _make


@pytest.fixture
async def http(session_factory):
    """httpx client wired to the app, with get_db bound to the test database."""

    async def _get_db():
        async with session_factory() as session:
            yield session

    app.dependency_overrides[get_db] = _get_db
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        yield client
    app.dependency_overrides.pop(get_db, None)


@pytest.fixture
def auth():
    """Build the X-Client-Id header for a client id."""
    return lambda client_id: {"X-Client-Id": str(client_id)}

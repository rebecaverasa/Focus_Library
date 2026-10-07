import os

# CI has no .env and no database: give Settings dummy URLs before any app module is
# imported. The async engine is lazy, so nothing tries to connect unless a test does.
os.environ.setdefault("DATABASE_URL", "postgresql://test:test@localhost:5432/test")
os.environ.setdefault("REDIS_URL", "redis://localhost:6379/0")

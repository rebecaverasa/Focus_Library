from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    database_url: str
    redis_url: str

    @property
    def sqlalchemy_database_uri(self) -> str:
        """DATABASE_URL uses the plain postgresql:// scheme (works with any client,
        e.g. DBeaver); SQLAlchemy's async engine needs the asyncpg driver spelled out."""
        return self.database_url.replace("postgresql://", "postgresql+asyncpg://", 1)


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()

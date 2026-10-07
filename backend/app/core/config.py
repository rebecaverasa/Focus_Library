from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    database_url: str
    redis_url: str
    # Comma-separated origins allowed to call the API from a browser (the Vite dev server
    # by default). A plain string because pydantic-settings would expect JSON for a list.
    cors_origins: str = "http://localhost:5173"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def sqlalchemy_database_uri(self) -> str:
        """DATABASE_URL uses the plain postgresql:// scheme (works with any client,
        e.g. DBeaver); SQLAlchemy's async engine needs the asyncpg driver spelled out."""
        return self.database_url.replace("postgresql://", "postgresql+asyncpg://", 1)


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()

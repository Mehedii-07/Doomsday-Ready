import os
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Doomsday Ready"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Defaults to SQLite for immediate local zero-config execution; Docker Compose sets PostgreSQL
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "sqlite:///./doomsday.db"
    )
    
    # Fix for SQLAlchemy requiring postgresql:// instead of postgres://
    @property
    def sync_database_url(self) -> str:
        if self.DATABASE_URL.startswith("postgres://"):
            return self.DATABASE_URL.replace("postgres://", "postgresql://", 1)
        return self.DATABASE_URL

    CORS_ORIGINS: list[str] = ["*"]

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)


settings = Settings()

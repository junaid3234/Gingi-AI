import os
from pydantic_settings import BaseSettings, SettingsConfigDict


def _default_db() -> str:
    """Use DATABASE_URL env var if set (Railway PostgreSQL), else SQLite fallback."""
    return os.environ.get(
        "DATABASE_URL",
        "sqlite+aiosqlite:///./gingiai.db"
    )


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = _default_db()
    jwt_secret: str = "dev-secret-change-in-production-min-32-chars"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60
    clerk_secret_key: str = ""
    cors_origins: str = "http://localhost:3000"
    rate_limit_per_minute: int = 60
    model_path: str = "../ml-model/models/gingivitis_rf_model.joblib"
    app_name: str = "GingiAI API"
    debug: bool = False


settings = Settings()

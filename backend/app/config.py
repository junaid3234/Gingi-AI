from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+asyncpg://gingiai:gingiai_dev_password@localhost:5432/gingiai"
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

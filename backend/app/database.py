import os
from collections.abc import AsyncGenerator
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.config import settings


def _connect_args(url: str) -> dict:
    if "sqlite" in url:
        return {"check_same_thread": False}
    # Railway public Postgres URLs require SSL; internal *.railway.internal does not.
    if os.getenv("DATABASE_SSL", "").lower() in ("1", "true", "require"):
        return {"ssl": True}
    if "sslmode=require" in url or "ssl=require" in url:
        return {"ssl": True}
    return {}


engine = create_async_engine(
    settings.database_url,
    echo=settings.debug,
    connect_args=_connect_args(settings.database_url),
)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


def to_db_id(value) -> str | UUID:
    """
    Normalise a UUID value for DB queries.
    SQLite stores UUIDs as str(36); PostgreSQL uses native UUID.
    Always pass the result of this into .where(Model.id == to_db_id(x)).
    """
    _is_postgres = "postgresql" in settings.database_url or "asyncpg" in settings.database_url
    if _is_postgres:
        if isinstance(value, UUID):
            return value
        return UUID(str(value))
    else:
        return str(value)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise

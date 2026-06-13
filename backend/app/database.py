import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.config import get_settings

# Allow DATABASE_URL env override (common in hosting)
_settings = get_settings()
DATABASE_URL = os.getenv("DATABASE_URL", _settings.database_url)

engine = create_engine(DATABASE_URL, future=True, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, future=True)

Base = declarative_base()

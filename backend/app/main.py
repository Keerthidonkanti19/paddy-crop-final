from pathlib import Path

from dotenv import load_dotenv

_root = Path(__file__).resolve().parent.parent
load_dotenv(_root / ".env")
load_dotenv()

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import get_settings
from app.database import Base, engine
from app.paths import UPLOAD_DIR
from app.routers import auth_router, predict_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Khet Saathi API", version="2.0.0")

_settings = get_settings()
_user_origins = [o.strip() for o in _settings.cors_origins.split(",") if o.strip()]
# With allow_credentials=True, browsers reject allow_origins="*". Always use explicit origins.
_default_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5175",
]
_origins = list(dict.fromkeys(_default_origins + _user_origins))
app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploaded_images", StaticFiles(directory=str(UPLOAD_DIR)), name="uploaded_images")

app.include_router(auth_router.router)
app.include_router(predict_router.router)


@app.get("/")
def root() -> dict[str, str]:
    return {"status": "ok", "message": "Khet Saathi API"}

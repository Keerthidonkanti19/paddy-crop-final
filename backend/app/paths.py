"""Filesystem paths shared by main.py and routers (single source of truth)."""
from pathlib import Path

# backend/app/paths.py -> app -> backend project root
BACKEND_ROOT: Path = Path(__file__).resolve().parent.parent
UPLOAD_DIR: Path = BACKEND_ROOT / "uploaded_images"

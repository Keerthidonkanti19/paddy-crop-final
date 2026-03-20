# app/main.py
import os
from dotenv import load_dotenv
load_dotenv()
import uuid
import shutil
import asyncio

from fastapi import FastAPI, UploadFile, File, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from sqlalchemy.orm import Session

from app.database import SessionLocal, engine, Base
from app.models import PaddyPrediction
from app.schemas import PredictionOut
from app.ml_model import predict_disease_from_path  # sync function
from app.llm import generate_recommendations

# from fastapi import FastAPI, File, UploadFile
# from fastapi.middleware.cors import CORSMiddleware
# from fastapi.staticfiles import StaticFiles
# import os

# Create tables if they don't exist (won't overwrite existing table)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Paddy Crop Disease API")
if not os.path.exists("uploaded_images"):
    os.makedirs("uploaded_images")

# --------- Paths for uploads ----------
# Directory to store uploaded images (absolute path inside project)
BASE_DIR = os.path.dirname(os.path.dirname(__file__))  # parent folder of app/
UPLOAD_DIR = os.path.join(BASE_DIR, "uploaded_images")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# --------- CORS (for frontend JS) ----------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # in prod: restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------- Static files (serve uploaded images) ----------
# This makes files in UPLOAD_DIR available at URL path: /uploaded_images/<filename>
app.mount("/uploaded_images", StaticFiles(directory=UPLOAD_DIR), name="uploaded_images")


# Simple root so visiting "/" is not 404
@app.get("/")
def root():
    return {"status": "ok", "message": "Paddy Crop Disease API running"}


# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def save_upload_file_to_disk(upload_file: UploadFile, dest_path: str) -> None:
    """Synchronous save (called inside run_in_executor)."""
    with open(dest_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)
    upload_file.file.seek(0)


@app.post("/predict", response_model=PredictionOut)
async def predict(file: UploadFile = File(...), db: Session = Depends(get_db)):
    # Basic validation
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded or filename missing")

    # Build unique filename and destination path
    _, ext = os.path.splitext(file.filename)
    if not ext:
        ext = ".jpg"
    unique_name = f"{uuid.uuid4().hex}{ext}"

    # File on disk
    dest_path = os.path.join(UPLOAD_DIR, unique_name)
    # URL path that browser can use (served via StaticFiles)
    web_path = f"/uploaded_images/{unique_name}"

    # Save the uploaded file to disk in a threadpool to avoid blocking
    loop = asyncio.get_running_loop()
    await loop.run_in_executor(None, save_upload_file_to_disk, file, dest_path)

    # Run model inference in threadpool (since predict_disease_from_path is sync)
    try:
        pred = await loop.run_in_executor(None, predict_disease_from_path, dest_path)
    except Exception as e:
        # If inference fails, remove file (optional)
        try:
            os.remove(dest_path)
        except Exception:
            pass
        raise HTTPException(status_code=500, detail=f"Inference error: {e}")

    label = pred.get("label") or str(pred)
    confidence_val = pred.get("confidence")
    # 🔥 Call Groq LLM for recommendations
    if label == "Uncertain / unclear leaf image":
        recommendations = {}
    else:
        try:
           recommendations = await generate_recommendations(label, "en")
        except Exception as e:
            print("LLM error:", e)
            recommendations = {}
    # store confidence as string because DB column is String
    confidence_str = str(confidence_val) if confidence_val is not None else None

    # Save to DB via ORM
    # NOTE: store the *web* path so frontend can use it directly
    db_row = PaddyPrediction(image_path=web_path, disease=label, confidence=confidence_str)
    db.add(db_row)
    db.commit()
    db.refresh(db_row)

    # Return a plain dict matching PredictionOut schema to avoid ResponseValidationError
    return {
        "id": db_row.id,
        "image_path": db_row.image_path,   # e.g. "/uploads/xyz.jpg"
        "disease": db_row.disease,
        "confidence": str(db_row.confidence) if db_row.confidence is not None else None,
        "recommendations": recommendations
    }

@app.get("/predictions", response_model=list[PredictionOut])
def list_predictions(limit: int = 100, db: Session = Depends(get_db)):
    rows = db.query(PaddyPrediction).limit(limit).all()
    result = []
    for r in rows:
        result.append(
            {
                "id": r.id,
                "image_path": r.image_path,  # still the web path "/uploads/..."
                "disease": r.disease,
                # ensure confidence is a string (or None) to match PredictionOut
                "confidence": str(r.confidence) if r.confidence is not None else None,
            }
        )
    return result

 
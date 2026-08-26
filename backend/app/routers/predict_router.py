# backend/app/routers/predict_router.py

import asyncio
import os
import shutil
import uuid
import json
from typing import Annotated

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    Query,
    Response,
    UploadFile,
)
from sqlalchemy.orm import Session

from app.db_models import DetectionHistory, User
from app.dependencies import get_current_user, get_db
from app.ml_model import predict_disease_from_path
from app.paths import UPLOAD_DIR
from app.schemas_api import HistoryItemOut, PredictResponse
from app.services.recommendations import get_recommendation
from pydantic import BaseModel
from app.llm import ask_farmer_question
from pathlib import Path

router = APIRouter(tags=["predictions"])
class FarmerAssistantRequest(BaseModel):
    disease: str
    confidence: str
    fertilizers: str
    pesticides: str
    question: str
    language: str

# Create upload directory if not exists
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Allowed image types
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}

# Max file size = 5 MB
MAX_FILE_SIZE = 5 * 1024 * 1024

# with open(
#     "app/data/disease_translations.json",
#     "r",
#     encoding="utf-8"
# ) as f:

#     DISEASE_TRANSLATIONS = json.load(f)
TRANSLATIONS_PATH = (
    Path(__file__).resolve().parent.parent
    / "data"
    / "disease_translations.json"
)

with open(
    TRANSLATIONS_PATH,
    "r",
    encoding="utf-8",
) as f:
    DISEASE_TRANSLATIONS = json.load(f)

# ---------------------------------------------------
# Save uploaded image
# ---------------------------------------------------
def save_upload_file_to_disk(
    upload_file: UploadFile,
    dest_path: str,
) -> None:

    with open(dest_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)

    upload_file.file.seek(0)


# ---------------------------------------------------
# Predict API
# ---------------------------------------------------
@router.post("/predict", response_model=PredictResponse)
async def predict(
    file: Annotated[UploadFile, File(...)],
    lang: Annotated[
        str,
        Query(description="UI language: en, te, hi, ta, kn"),
    ] = "en",
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> PredictResponse:
    print("BACKEND RECEIVED LANG =", lang)

    # -----------------------------
    # Validate file
    # -----------------------------
    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No file uploaded",
        )

    # Extract extension
    _, ext = os.path.splitext(file.filename)

    # Default extension
    if not ext:
        ext = ".jpg"

    # Validate extension
    if ext.lower() not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Only JPG, WEBP, PNG images are allowed",
        )

    # Validate file size
    contents = await file.read()

    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="File size exceeds 5 MB limit",
        )

    # Reset pointer after reading
    await file.seek(0)

    # -----------------------------
    # Generate unique filename
    # -----------------------------
    unique_name = f"{uuid.uuid4().hex}{ext}"

    dest_path = str(UPLOAD_DIR / unique_name)

    web_path = f"/uploaded_images/{unique_name}"

    # -----------------------------
    # Save image asynchronously
    # -----------------------------
    loop = asyncio.get_running_loop()

    await loop.run_in_executor(
        None,
        save_upload_file_to_disk,
        file,
        dest_path,
    )

    # -----------------------------
    # Run ML prediction
    # -----------------------------
    try:

        pred = await loop.run_in_executor(
            None,
            predict_disease_from_path,
            dest_path,
        )

    except Exception as e:

        try:
            os.remove(dest_path)

        except OSError:
            pass

        raise HTTPException(
            status_code=500,
            detail=f"Inference error: {e!s}",
        ) from e

    # -----------------------------
    # Extract prediction data
    # -----------------------------
    label = str(pred.get("prediction") or "")

    localized_label = (
    DISEASE_TRANSLATIONS
    .get(lang, DISEASE_TRANSLATIONS["en"])
    .get(label, label)
    )

    confidence_score = pred.get("confidence")

    probabilities = pred.get("probabilities", {})

    warning = pred.get("warning")

    # -----------------------------
    # Get recommendations
    # -----------------------------
    rec = get_recommendation(label, lang)
#     rec = get_recommendation(
#     localized_label,
#     lang
# )

    # -----------------------------
    # Save prediction history
    # -----------------------------
    row = DetectionHistory(
        user_id=user.id,
        image_path=web_path,
        # predicted_disease=label,
        predicted_disease=localized_label,
        fertilizers=rec["fertilizers"],
        pesticides=rec["pesticides"],
        confidence_score=confidence_score,
    )

    db.add(row)

    try:

        db.commit()

        db.refresh(row)

    except Exception as e:

        db.rollback()

        try:
            os.remove(dest_path)

        except OSError:
            pass

        raise HTTPException(
            status_code=500,
            detail=f"Could not save prediction to database: {e!s}",
        ) from e

    # -----------------------------
    # Return API response
    # -----------------------------
    return PredictResponse(
        id=row.id,
        image_path=row.image_path,
        predicted_disease=row.predicted_disease,
        confidence_score=row.confidence_score,
        fertilizers=row.fertilizers,
        pesticides=row.pesticides,
        disease_label_i18n=rec["disease_label_i18n"],
        probabilities=probabilities,
        warning=warning,
    )


# ---------------------------------------------------
# Prediction History API
# ---------------------------------------------------
@router.get(
    "/history/{user_id}",
    response_model=list[HistoryItemOut],
)
def get_history(
    user_id: int,
    response: Response,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> list[DetectionHistory]:

    # Disable caching
    response.headers["Cache-Control"] = (
        "no-store, no-cache, must-revalidate"
    )

    response.headers["Pragma"] = "no-cache"

    # Security check
    if current.id != user_id:
        raise HTTPException(
            status_code=403,
            detail="Cannot access another user's history",
        )

    # Fetch history
    rows = (
        db.query(DetectionHistory)
        .filter(DetectionHistory.user_id == user_id)
        .order_by(DetectionHistory.timestamp.desc())
        .limit(200)
        .all()
    )

    return rows

# ---------------------------------------------------
# Farmer Voice Assistant API
# ---------------------------------------------------
@router.post("/ask-farmer-assistant")
async def ask_farmer_ai(
    req: FarmerAssistantRequest
):

    answer = await ask_farmer_question(
        disease=req.disease,
        confidence=req.confidence,
        fertilizers=req.fertilizers,
        pesticides=req.pesticides,
        question=req.question,
        language_code=req.language
    )

    return {
        "answer": answer
    }
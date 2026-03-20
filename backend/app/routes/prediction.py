from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
import uuid
import os
from app.ml import predict_image  # your ML function

router = APIRouter()

UPLOAD_FOLDER = "static/uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# POST /predict
@router.post("/predict")
async def predict(file: UploadFile = File(...), db: Session = Depends(get_db)):
    # Save uploaded file
    file_ext = file.filename.split(".")[-1]
    file_name = f"{uuid.uuid4()}.{file_ext}"
    file_path = os.path.join(UPLOAD_FOLDER, file_name)

    with open(file_path, "wb") as f:
        f.write(await file.read())

    # ML model prediction
    disease, confidence = predict_image(file_path)

    # Save to database
    db_prediction = models.Prediction(
        image_url=f"/static/uploads/{file_name}",
        disease=disease,
        confidence=confidence
    )
    db.add(db_prediction)
    db.commit()
    db.refresh(db_prediction)

    return {
        "disease": disease,
        "confidence": confidence,
        "image_url": db_prediction.image_url
    }


# GET /predictions
@router.get("/predictions")
def get_predictions(db: Session = Depends(get_db)):
    predictions = db.query(models.Prediction).order_by(models.Prediction.created_at.desc()).all()
    return predictions

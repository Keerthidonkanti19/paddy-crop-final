from fastapi import APIRouter, File, UploadFile
from app.ml_model import predict_disease

router = APIRouter()

@router.post("/predict")
async def predict(file: UploadFile = File(...)):
    # Call ML model function
    result = await predict_disease(file)
    return {"disease_prediction": result}

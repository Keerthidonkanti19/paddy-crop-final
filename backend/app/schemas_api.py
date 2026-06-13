# backend/app/schemas_api.py

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


# ---------------------------------------------------
# Signup Request
# ---------------------------------------------------
class SignupRequest(BaseModel):
    username: str = Field(..., min_length=2, max_length=100)

    mobile_number: str = Field(
        ...,
        min_length=10,
        max_length=20,
    )


# ---------------------------------------------------
# Login Request
# ---------------------------------------------------
class LoginRequest(BaseModel):
    mobile_number: str = Field(
        ...,
        min_length=10,
        max_length=20,
    )


# ---------------------------------------------------
# JWT Token Response
# ---------------------------------------------------
class TokenResponse(BaseModel):
    access_token: str

    token_type: str = "bearer"

    user_id: int

    username: str

    mobile_number: str


# ---------------------------------------------------
# Prediction History Response
# ---------------------------------------------------
class HistoryItemOut(BaseModel):
    id: int

    image_path: str

    predicted_disease: str

    fertilizers: Optional[str] = None

    pesticides: Optional[str] = None

    confidence_score: Optional[float] = None

    timestamp: datetime

    model_config = {
        "from_attributes": True,
    }


# ---------------------------------------------------
# Prediction API Response
# ---------------------------------------------------
class PredictResponse(BaseModel):
    id: int

    image_path: str

    predicted_disease: str

    confidence_score: Optional[float] = None

    fertilizers: Optional[str] = None

    pesticides: Optional[str] = None

    disease_label_i18n: Optional[dict[str, str]] = None

    probabilities: dict[str, float]

    warning: Optional[str] = None
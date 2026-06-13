from pydantic import BaseModel
from typing import Optional, Dict, List


class PredictionOut(BaseModel):
    id: int
    image_path: str
    disease: str
    confidence: Optional[str]
    recommendations: Optional[Dict[str, List[str]]] = None

    class Config:
        from_attributes = True


class SignupRequest(BaseModel):
    username: str
    mobile_number: str


class LoginRequest(BaseModel):
    mobile_number: str


class TokenResponse(BaseModel):
    access_token: str
    user_id: int
    username: str
    mobile_number: str

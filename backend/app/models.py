# models.py
from sqlalchemy import Column, Integer, String
from app.database import Base

class PaddyPrediction(Base):
    __tablename__ = "paddy_crop_disease_data"   # exact table name you provided
    id = Column(Integer, primary_key=True, index=True)
    image_path = Column(String, nullable=False)
    disease = Column(String, nullable=False)
    confidence = Column(String, nullable=True)   # nullable True in case model doesn't return it

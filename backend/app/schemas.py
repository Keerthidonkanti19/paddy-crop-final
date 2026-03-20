# schemas.py
# from pydantic import BaseModel
# from typing import Optional
# from datetime import datetime

# '''class PredictionCreate(BaseModel):
#     image_path: str
#     disease: str
#     confidence: Optional[str] = None

# class PredictionOut(BaseModel):
#     id: int
#     image_path: str
#     disease: str
#     confidence: Optional[str] = None

#     class Config:
#         orm_mode = True '''


# from typing import Optional, Dict, List

# class PredictionOut(BaseModel):
#     id: int
#     image_path: str
#     disease: str
#     confidence: Optional[str]
#     recommendations: Optional[Dict[str, List[str]]] = None
#     model_config = {"from_attributes": True}

# schemas.py
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

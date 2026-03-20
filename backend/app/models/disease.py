from pydantic import BaseModel

class Disease(BaseModel):
    id: int
    name: str
    severity: str
    recommendation: str

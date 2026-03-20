from fastapi import APIRouter

router = APIRouter()

@router.post("/login")
def login(username: str, password: str):
    # Placeholder logic
    return {"username": username, "message": "Logged in successfully"}

@router.post("/register")
def register(username: str, email: str, password: str):
    return {"username": username, "email": email, "message": "User registered successfully"}

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db_models import User
from app.dependencies import get_db
from app.schemas_api import (
    LoginRequest,
    SignupRequest,
    TokenResponse,
)
from app.security import create_access_token

router = APIRouter(tags=["auth"])


@router.post("/signup", response_model=TokenResponse)
def signup(payload: SignupRequest, db: Session = Depends(get_db)):
    mobile = payload.mobile_number.strip()
    username = payload.username.strip()

    existing_mobile = (
        db.query(User)
        .filter(User.mobile_number == mobile)
        .first()
    )

    if existing_mobile:
        raise HTTPException(
            status_code=400,
            detail="Mobile number already registered",
        )

    existing_username = (
        db.query(User)
        .filter(User.username == username)
        .first()
    )

    if existing_username:
        raise HTTPException(
            status_code=400,
            detail="Username already taken",
        )

    user = User(
        username=username,
        mobile_number=mobile,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(
        str(user.id),
        {"username": user.username},
    )

    return TokenResponse(
        access_token=token,
        user_id=user.id,
        username=user.username,
        mobile_number=user.mobile_number,
    )


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    mobile = payload.mobile_number.strip()

    user = (
        db.query(User)
        .filter(User.mobile_number == mobile)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Mobile number not registered",
        )

    user.last_login = datetime.now(timezone.utc)

    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token(
        str(user.id),
        {"username": user.username},
    )

    return TokenResponse(
        access_token=token,
        user_id=user.id,
        username=user.username,
        mobile_number=user.mobile_number,
    )
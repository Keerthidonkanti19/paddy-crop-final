from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.database import Base


def _utc_now():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    username = Column(
        String(100),
        unique=True,
        nullable=False,
        index=True,
    )

    mobile_number = Column(
        String(20),
        unique=True,
        nullable=False,
        index=True,
    )

    created_at = Column(
        DateTime(timezone=True),
        default=_utc_now,
        nullable=False,
    )

    last_login = Column(
        DateTime(timezone=True),
        nullable=True,
    )

    history = relationship(
        "DetectionHistory",
        back_populates="user",
        cascade="all, delete-orphan",
    )


class DetectionHistory(Base):
    __tablename__ = "detection_history"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    image_path = Column(Text, nullable=False)

    predicted_disease = Column(
        String(255),
        nullable=False,
    )

    fertilizers = Column(Text, nullable=True)

    pesticides = Column(Text, nullable=True)

    confidence_score = Column(
        String(32),
        nullable=True,
    )

    timestamp = Column(
        DateTime(timezone=True),
        default=_utc_now,
        nullable=False,
    )

    user = relationship(
        "User",
        back_populates="history",
    )
import hashlib
import hmac
import logging
import random
import re
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.config import get_settings
from app.db_models import OtpCode

logger = logging.getLogger(__name__)


def normalize_mobile(mobile: str) -> str:
    digits = re.sub(r"\D", "", mobile.strip())
    if len(digits) == 12 and digits.startswith("91"):
        digits = digits[2:]
    return digits


def hash_otp(mobile: str, otp: str) -> str:
    pepper = get_settings().otp_pepper.encode()
    msg = f"{mobile}:{otp}".encode()
    return hmac.new(pepper, msg, hashlib.sha256).hexdigest()


def generate_otp() -> str:
    return f"{random.randint(0, 999999):06d}"


def store_otp(db: Session, mobile: str, otp: str) -> None:
    settings = get_settings()
    now = datetime.now(timezone.utc)
    expiry = now + timedelta(minutes=settings.otp_expire_minutes)
    db.query(OtpCode).filter(OtpCode.mobile_number == mobile).delete()
    row = OtpCode(
        mobile_number=mobile,
        otp_hash=hash_otp(mobile, otp),
        expiry_time=expiry,
    )
    db.add(row)
    db.commit()


def verify_otp_code(db: Session, mobile: str, otp: str) -> bool:
    now = datetime.now(timezone.utc)
    row = (
        db.query(OtpCode)
        .filter(OtpCode.mobile_number == mobile, OtpCode.expiry_time > now)
        .order_by(OtpCode.id.desc())
        .first()
    )
    if not row:
        return False
    if hmac.compare_digest(row.otp_hash, hash_otp(mobile, otp)):
        db.delete(row)
        db.commit()
        return True
    return False


def send_sms_twilio(mobile: str, body: str) -> None:
    s = get_settings()
    if not (s.twilio_account_sid and s.twilio_auth_token and s.twilio_from_number):
        logger.warning(
            "Twilio not configured — OTP (dev): mobile=%s message=%s",
            mobile,
            body,
        )
        return
    from twilio.rest import Client

    client = Client(s.twilio_account_sid, s.twilio_auth_token)
    to = mobile if mobile.startswith("+") else f"+91{mobile}"
    client.messages.create(body=body, from_=s.twilio_from_number, to=to)

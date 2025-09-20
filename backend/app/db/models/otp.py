"""
OTP model for one-time password management.

Handles OTP generation, validation, and expiration for authentication
and verification purposes.
"""

from datetime import datetime, timedelta
from enum import Enum
from typing import Optional
from uuid import UUID

from sqlalchemy import String, DateTime, ForeignKey, Boolean, Integer
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.core.config import get_settings
from app.db.base import Base

settings = get_settings()


class OTPPurpose(str, Enum):
    """OTP purpose enumeration."""
    LOGIN = "login"
    VERIFY_EMAIL = "verify_email"
    RESET_PASSWORD = "reset_password"
    REGISTRATION = "registration"
    PHONE_VERIFICATION = "phone_verification"


class OTP(Base):
    """OTP model for one-time password management."""
    
    __tablename__ = "otps"
    
    # User relationship (optional for anonymous OTPs)
    user_id: Mapped[Optional[UUID]] = mapped_column(
        PostgresUUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=True,
        index=True
    )
    
    # Contact information
    email_or_phone: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        index=True
    )
    
    # OTP details
    code: Mapped[str] = mapped_column(
        String(10),
        nullable=False
    )
    hashed_code: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )
    purpose: Mapped[OTPPurpose] = mapped_column(
        String(50),
        nullable=False,
        index=True
    )
    
    # Status and validation
    is_used: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
        index=True
    )
    attempts: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False
    )
    
    # Expiration
    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        index=True
    )
    
    # Additional information
    ip_address: Mapped[Optional[str]] = mapped_column(
        String(45),
        nullable=True
    )
    user_agent: Mapped[Optional[str]] = mapped_column(
        String(500),
        nullable=True
    )
    
    # Delivery information
    sent_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )
    delivery_method: Mapped[Optional[str]] = mapped_column(
        String(20),
        nullable=True
    )
    
    # Relationships
    user = relationship("User", back_populates="otps")
    
    def __repr__(self) -> str:
        return f"<OTP(id={self.id}, email_or_phone={self.email_or_phone}, purpose={self.purpose}, is_used={self.is_used})>"
    
    @property
    def is_expired(self) -> bool:
        """Check if OTP is expired."""
        return datetime.utcnow() > self.expires_at
    
    @property
    def is_valid(self) -> bool:
        """Check if OTP is valid (not used and not expired)."""
        return not self.is_used and not self.is_expired
    
    @property
    def is_max_attempts_reached(self) -> bool:
        """Check if maximum attempts reached."""
        return self.attempts >= settings.OTP_MAX_ATTEMPTS
    
    @property
    def remaining_attempts(self) -> int:
        """Get remaining attempts."""
        return max(0, settings.OTP_MAX_ATTEMPTS - self.attempts)
    
    @property
    def time_until_expiry(self) -> timedelta:
        """Get time until OTP expires."""
        if self.is_expired:
            return timedelta(0)
        return self.expires_at - datetime.utcnow()
    
    @property
    def is_email_otp(self) -> bool:
        """Check if OTP is for email."""
        return "@" in self.email_or_phone
    
    @property
    def is_phone_otp(self) -> bool:
        """Check if OTP is for phone."""
        return not self.is_email_otp
    
    @classmethod
    def create_otp(
        cls,
        email_or_phone: str,
        purpose: OTPPurpose,
        user_id: Optional[UUID] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        expires_in_minutes: int = None
    ) -> "OTP":
        """Create a new OTP instance."""
        from app.core.security import generate_otp, hash_otp
        
        if expires_in_minutes is None:
            expires_in_minutes = settings.OTP_EXPIRE_MINUTES
        
        code = generate_otp()
        hashed_code = hash_otp(code)
        expires_at = datetime.utcnow() + timedelta(minutes=expires_in_minutes)
        
        return cls(
            user_id=user_id,
            email_or_phone=email_or_phone,
            code=code,
            hashed_code=hashed_code,
            purpose=purpose,
            ip_address=ip_address,
            user_agent=user_agent,
            expires_at=expires_at
        )
    
    def verify(self, provided_code: str) -> bool:
        """Verify OTP code."""
        from app.core.security import verify_otp
        
        # Check if OTP is valid
        if not self.is_valid:
            return False
        
        # Check if max attempts reached
        if self.is_max_attempts_reached:
            return False
        
        # Increment attempts
        self.attempts += 1
        
        # Verify code
        if verify_otp(provided_code, self.hashed_code):
            self.is_used = True
            return True
        
        return False
    
    def mark_used(self):
        """Mark OTP as used."""
        self.is_used = True
    
    def mark_sent(self, delivery_method: str = None):
        """Mark OTP as sent."""
        self.sent_at = datetime.utcnow()
        if delivery_method:
            self.delivery_method = delivery_method
    
    def increment_attempts(self):
        """Increment attempt count."""
        self.attempts += 1
    
    def reset_attempts(self):
        """Reset attempt count."""
        self.attempts = 0
    
    def extend_expiry(self, minutes: int = None):
        """Extend OTP expiry time."""
        if minutes is None:
            minutes = settings.OTP_EXPIRE_MINUTES
        self.expires_at = datetime.utcnow() + timedelta(minutes=minutes)
    
    def get_otp_summary(self) -> dict:
        """Get OTP summary for display."""
        return {
            "id": str(self.id),
            "email_or_phone": self.email_or_phone,
            "purpose": self.purpose,
            "is_used": self.is_used,
            "is_expired": self.is_expired,
            "is_valid": self.is_valid,
            "attempts": self.attempts,
            "remaining_attempts": self.remaining_attempts,
            "expires_at": self.expires_at.isoformat(),
            "time_until_expiry": str(self.time_until_expiry),
            "created_at": self.created_at.isoformat(),
            "sent_at": self.sent_at.isoformat() if self.sent_at else None,
            "delivery_method": self.delivery_method,
        }

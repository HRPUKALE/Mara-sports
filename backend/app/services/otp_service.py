"""
OTP service for one-time password management.

Handles OTP generation, validation, and delivery.
"""

from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.security import generate_otp, hash_otp, verify_otp, is_otp_expired
from app.db.models.otp import OTP, OTPPurpose
from app.db.repository import OTPRepository

settings = get_settings()


class OTPService:
    """OTP service for one-time password management."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.otp_repo = OTPRepository(OTP, db)
    
    async def create_otp(
        self,
        email_or_phone: str,
        purpose: OTPPurpose,
        user_id: Optional[UUID] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        expires_in_minutes: int = None
    ) -> OTP:
        """Create a new OTP."""
        if expires_in_minutes is None:
            expires_in_minutes = settings.OTP_EXPIRE_MINUTES
        
        otp_code = generate_otp()
        hashed_otp = hash_otp(otp_code)
        expires_at = datetime.utcnow() + timedelta(minutes=expires_in_minutes)
        
        otp_data = {
            "user_id": user_id,
            "email_or_phone": email_or_phone,
            "code": otp_code,
            "hashed_code": hashed_otp,
            "purpose": purpose,
            "expires_at": expires_at,
            "ip_address": ip_address,
            "user_agent": user_agent,
        }
        
        return await self.otp_repo.create(otp_data)
    
    async def verify_otp(self, otp_id: UUID, provided_code: str) -> bool:
        """Verify OTP code."""
        otp = await self.otp_repo.get(otp_id)
        if not otp:
            return False
        
        return otp.verify(provided_code)
    
    async def get_valid_otp(self, email_or_phone: str, purpose: OTPPurpose) -> Optional[OTP]:
        """Get valid OTP for email/phone and purpose."""
        return await self.otp_repo.get_valid_otp(email_or_phone, purpose)
    
    async def mark_otp_used(self, otp_id: UUID) -> bool:
        """Mark OTP as used."""
        otp = await self.otp_repo.get(otp_id)
        if not otp:
            return False
        
        otp.mark_used()
        await self.db.commit()
        return True
    
    async def mark_otp_sent(self, otp_id: UUID, delivery_method: str = None) -> bool:
        """Mark OTP as sent."""
        otp = await self.otp_repo.get(otp_id)
        if not otp:
            return False
        
        otp.mark_sent(delivery_method)
        await self.db.commit()
        return True
    
    async def get_otp_by_id(self, otp_id: UUID) -> Optional[OTP]:
        """Get OTP by ID."""
        return await self.otp_repo.get(otp_id)
    
    async def get_otps_by_contact(self, email_or_phone: str) -> list[OTP]:
        """Get OTPs by email or phone."""
        return await self.otp_repo.get_by_email_or_phone(email_or_phone)
    
    async def cleanup_expired_otps(self) -> int:
        """Clean up expired OTPs."""
        expired_otps = await self.otp_repo.get_expired_otps()
        count = 0
        
        for otp in expired_otps:
            await self.otp_repo.hard_delete(otp.id)
            count += 1
        
        return count
    
    async def send_otp_email(self, otp: OTP) -> bool:
        """Send OTP via email."""
        # TODO: Implement email sending logic
        # For now, just mark as sent
        await self.mark_otp_sent(otp.id, "email")
        return True
    
    async def send_otp_sms(self, otp: OTP) -> bool:
        """Send OTP via SMS."""
        # TODO: Implement SMS sending logic
        # For now, just mark as sent
        await self.mark_otp_sent(otp.id, "sms")
        return True
    
    async def send_otp(self, otp: OTP) -> bool:
        """Send OTP via appropriate method."""
        if otp.is_email_otp:
            return await self.send_otp_email(otp)
        else:
            return await self.send_otp_sms(otp)
    
    async def get_otp_stats(self) -> Dict[str, Any]:
        """Get OTP statistics."""
        total_otps = await self.otp_repo.count()
        used_otps = await self.otp_repo.count({"is_used": True})
        expired_otps = await self.otp_repo.count({"expires_at": {"$lt": datetime.utcnow()}})
        
        return {
            "total_otps": total_otps,
            "used_otps": used_otps,
            "expired_otps": expired_otps,
            "active_otps": total_otps - used_otps - expired_otps
        }
    
    async def is_rate_limited(self, email_or_phone: str, purpose: OTPPurpose) -> bool:
        """Check if OTP request is rate limited."""
        # Get recent OTPs for this contact and purpose
        recent_otps = await self.otp_repo.get_by_email_or_phone(email_or_phone)
        recent_otps = [
            otp for otp in recent_otps
            if otp.purpose == purpose and not otp.is_expired
        ]
        
        # Check if rate limit exceeded
        return len(recent_otps) >= settings.RATE_LIMIT_OTP_REQUESTS
    
    async def get_otp_summary(self, otp_id: UUID) -> Optional[Dict[str, Any]]:
        """Get OTP summary for display."""
        otp = await self.otp_repo.get(otp_id)
        if not otp:
            return None
        
        return otp.get_otp_summary()

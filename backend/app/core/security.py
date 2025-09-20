"""
Security utilities for authentication, authorization, and data protection.

Includes JWT token management, password hashing, OTP generation,
rate limiting, and input validation.
"""

import hashlib
import secrets
import time
from datetime import datetime, timedelta
from typing import Any, Dict, Optional, Union

from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr

from app.core.config import get_settings

settings = get_settings()

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Rate limiting storage (in production, use Redis)
_rate_limit_storage: Dict[str, Dict[str, Any]] = {}


class TokenData(BaseModel):
    """Token data model for JWT payload."""
    user_id: str
    email: str
    role: str
    is_verified: bool = False


class OTPData(BaseModel):
    """OTP data model."""
    code: str
    purpose: str
    expires_at: datetime
    attempts: int = 0


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Generate password hash using bcrypt."""
    return pwd_context.hash(password)


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token."""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire, "type": "access"})
    
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )
    return encoded_jwt


def create_refresh_token(data: Dict[str, Any]) -> str:
    """Create JWT refresh token."""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    
    to_encode.update({"exp": expire, "type": "refresh"})
    
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )
    return encoded_jwt


def verify_token(token: str, token_type: str = "access") -> Optional[TokenData]:
    """Verify and decode JWT token."""
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        
        # Check token type
        if payload.get("type") != token_type:
            return None
        
        # Check expiration
        exp = payload.get("exp")
        if exp and datetime.utcnow() > datetime.fromtimestamp(exp):
            return None
        
        return TokenData(
            user_id=payload.get("sub"),
            email=payload.get("email"),
            role=payload.get("role"),
            is_verified=payload.get("is_verified", False)
        )
    
    except JWTError:
        return None


def generate_otp(length: int = None) -> str:
    """Generate cryptographically secure OTP."""
    if length is None:
        length = settings.OTP_LENGTH
    
    return ''.join([str(secrets.randbelow(10)) for _ in range(length)])


def hash_otp(otp: str) -> str:
    """Hash OTP for secure storage."""
    return hashlib.sha256(otp.encode()).hexdigest()


def verify_otp(otp: str, hashed_otp: str) -> bool:
    """Verify OTP against its hash."""
    return hash_otp(otp) == hashed_otp


def is_otp_expired(expires_at: datetime) -> bool:
    """Check if OTP is expired."""
    return datetime.utcnow() > expires_at


def is_rate_limited(
    identifier: str,
    limit: int,
    window_minutes: int = 1,
    storage: Optional[Dict[str, Any]] = None
) -> bool:
    """Check if identifier is rate limited."""
    if storage is None:
        storage = _rate_limit_storage
    
    now = time.time()
    window_seconds = window_minutes * 60
    
    # Clean old entries
    cutoff = now - window_seconds
    if identifier in storage:
        storage[identifier] = [
            timestamp for timestamp in storage[identifier]
            if timestamp > cutoff
        ]
    else:
        storage[identifier] = []
    
    # Check if limit exceeded
    if len(storage[identifier]) >= limit:
        return True
    
    # Add current request
    storage[identifier].append(now)
    return False


def get_rate_limit_info(
    identifier: str,
    limit: int,
    window_minutes: int = 1,
    storage: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """Get rate limit information for identifier."""
    if storage is None:
        storage = _rate_limit_storage
    
    now = time.time()
    window_seconds = window_minutes * 60
    
    # Clean old entries
    cutoff = now - window_seconds
    if identifier in storage:
        storage[identifier] = [
            timestamp for timestamp in storage[identifier]
            if timestamp > cutoff
        ]
    else:
        storage[identifier] = []
    
    remaining = max(0, limit - len(storage[identifier]))
    reset_time = int(now + window_seconds)
    
    return {
        "limit": limit,
        "remaining": remaining,
        "reset_time": reset_time,
        "window_minutes": window_minutes
    }


def validate_email(email: str) -> bool:
    """Validate email format."""
    try:
        EmailStr.validate(email)
        return True
    except ValueError:
        return False


def validate_phone(phone: str) -> bool:
    """Validate phone number format (basic validation)."""
    # Remove all non-digit characters
    digits = ''.join(filter(str.isdigit, phone))
    
    # Check if it's a valid length (7-15 digits)
    return 7 <= len(digits) <= 15


def sanitize_filename(filename: str) -> str:
    """Sanitize filename for safe storage."""
    # Remove path separators and dangerous characters
    dangerous_chars = ['/', '\\', '..', ':', '*', '?', '"', '<', '>', '|']
    
    for char in dangerous_chars:
        filename = filename.replace(char, '_')
    
    # Limit length
    if len(filename) > 255:
        name, ext = filename.rsplit('.', 1) if '.' in filename else (filename, '')
        filename = name[:250] + ('.' + ext if ext else '')
    
    return filename


def generate_secure_filename(original_filename: str) -> str:
    """Generate secure filename with UUID prefix."""
    import uuid
    
    # Get file extension
    if '.' in original_filename:
        name, ext = original_filename.rsplit('.', 1)
        ext = f'.{ext}'
    else:
        ext = ''
    
    # Generate UUID prefix
    uuid_prefix = str(uuid.uuid4())
    
    # Sanitize original name
    safe_name = sanitize_filename(original_filename)
    
    return f"{uuid_prefix}_{safe_name}{ext}"


def mask_sensitive_data(data: str, visible_chars: int = 4) -> str:
    """Mask sensitive data for logging."""
    if len(data) <= visible_chars:
        return '*' * len(data)
    
    return data[:visible_chars] + '*' * (len(data) - visible_chars)


def validate_file_type(filename: str, allowed_types: list = None) -> bool:
    """Validate file type based on extension."""
    if allowed_types is None:
        allowed_types = settings.ALLOWED_FILE_TYPES
    
    if not filename or '.' not in filename:
        return False
    
    # Get file extension
    ext = filename.lower().split('.')[-1]
    
    # Map extensions to MIME types
    ext_to_mime = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'pdf': 'application/pdf',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'csv': 'text/csv',
        'xls': 'application/vnd.ms-excel',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }
    
    mime_type = ext_to_mime.get(ext)
    return mime_type in allowed_types


def validate_file_size(file_size: int, max_size: int = None) -> bool:
    """Validate file size."""
    if max_size is None:
        max_size = settings.MAX_FILE_SIZE
    
    return file_size <= max_size


def generate_csrf_token() -> str:
    """Generate CSRF token."""
    return secrets.token_urlsafe(32)


def verify_csrf_token(token: str, stored_token: str) -> bool:
    """Verify CSRF token."""
    return secrets.compare_digest(token, stored_token)


def hash_sensitive_data(data: str) -> str:
    """Hash sensitive data for storage."""
    return hashlib.sha256(data.encode()).hexdigest()


def is_strong_password(password: str) -> bool:
    """Check if password meets strength requirements."""
    if len(password) < 8:
        return False
    
    has_upper = any(c.isupper() for c in password)
    has_lower = any(c.islower() for c in password)
    has_digit = any(c.isdigit() for c in password)
    has_special = any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password)
    
    return has_upper and has_lower and has_digit and has_special


def get_password_strength(password: str) -> str:
    """Get password strength level."""
    if not is_strong_password(password):
        return "weak"
    
    if len(password) >= 12 and any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password):
        return "strong"
    
    return "medium"

"""
Authentication schemas for request/response validation.

Handles OTP requests, login, token management, and user authentication.
"""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field, validator, model_validator

from app.models.user import UserRole


class OTPRequest(BaseModel):
    """OTP request schema."""
    
    email: Optional[EmailStr] = Field(default=None, description="Email address")
    phone: Optional[str] = Field(default=None, description="Phone number")
    purpose: str = Field(description="OTP purpose (login, verify_email, reset_password)")
    
    @validator('email', 'phone')
    def validate_contact_info(cls, v, values):
        """Validate that either email or phone is provided."""
        return v
    
    @model_validator(mode='after')
    def validate_contact_required(self):
        """Validate that either email or phone is provided."""
        if not self.email and not self.phone:
            raise ValueError('Either email or phone must be provided')
        return self
    
    @validator('purpose')
    def validate_purpose(cls, v):
        """Validate OTP purpose."""
        valid_purposes = ['login', 'verify_email', 'reset_password', 'registration', 'phone_verification']
        if v not in valid_purposes:
            raise ValueError(f'Purpose must be one of: {", ".join(valid_purposes)}')
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "purpose": "login"
            }
        }


class OTPVerify(BaseModel):
    """OTP verification schema."""
    
    otp_id: UUID = Field(description="OTP ID from request response")
    code: str = Field(description="OTP code", min_length=4, max_length=8)
    
    @validator('code')
    def validate_code(cls, v):
        """Validate OTP code format."""
        if not v.isdigit():
            raise ValueError('OTP code must contain only digits')
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "otp_id": "123e4567-e89b-12d3-a456-426614174000",
                "code": "123456"
            }
        }


class LoginRequest(BaseModel):
    """Admin login request schema."""
    
    email: EmailStr = Field(description="Email address")
    password: str = Field(description="Password", min_length=8)
    remember_me: bool = Field(default=False, description="Remember login")
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "admin@example.com",
                "password": "password123",
                "remember_me": False
            }
        }


class TokenResponse(BaseModel):
    """Token response schema."""
    
    access_token: str = Field(description="JWT access token")
    refresh_token: str = Field(description="JWT refresh token")
    token_type: str = Field(default="bearer", description="Token type")
    expires_in: int = Field(description="Access token expiration in seconds")
    refresh_expires_in: int = Field(description="Refresh token expiration in seconds")
    
    class Config:
        json_schema_extra = {
            "example": {
                "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
                "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
                "token_type": "bearer",
                "expires_in": 900,
                "refresh_expires_in": 2592000
            }
        }


class RefreshTokenRequest(BaseModel):
    """Refresh token request schema."""
    
    refresh_token: str = Field(description="Refresh token")
    
    class Config:
        json_schema_extra = {
            "example": {
                "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
            }
        }


class UserResponse(BaseModel):
    """User response schema."""
    
    id: UUID = Field(description="User ID")
    email: str = Field(description="Email address")
    role: UserRole = Field(description="User role")
    is_active: bool = Field(description="Whether user is active")
    is_verified: bool = Field(description="Whether user is verified")
    created_at: datetime = Field(description="User creation timestamp")
    last_login_at: Optional[datetime] = Field(default=None, description="Last login timestamp")
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "123e4567-e89b-12d3-a456-426614174000",
                "email": "user@example.com",
                "role": "student",
                "is_active": True,
                "is_verified": True,
                "created_at": "2024-01-01T00:00:00Z",
                "last_login_at": "2024-01-01T12:00:00Z"
            }
        }


class OTPResponse(BaseModel):
    """OTP response schema."""
    
    otp_id: UUID = Field(description="OTP ID")
    expires_at: datetime = Field(description="OTP expiration timestamp")
    message: str = Field(description="Response message")
    
    class Config:
        json_schema_extra = {
            "example": {
                "otp_id": "123e4567-e89b-12d3-a456-426614174000",
                "expires_at": "2024-01-01T00:05:00Z",
                "message": "OTP sent successfully"
            }
        }


class LogoutRequest(BaseModel):
    """Logout request schema."""
    
    refresh_token: Optional[str] = Field(default=None, description="Refresh token to revoke")
    
    class Config:
        json_schema_extra = {
            "example": {
                "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
            }
        }


class PasswordResetRequest(BaseModel):
    """Password reset request schema."""
    
    email: EmailStr = Field(description="Email address")
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com"
            }
        }


class PasswordResetConfirm(BaseModel):
    """Password reset confirmation schema."""
    
    otp_id: UUID = Field(description="OTP ID from reset request")
    code: str = Field(description="OTP code", min_length=4, max_length=8)
    new_password: str = Field(description="New password", min_length=8)
    
    @validator('code')
    def validate_code(cls, v):
        """Validate OTP code format."""
        if not v.isdigit():
            raise ValueError('OTP code must contain only digits')
        return v
    
    @validator('new_password')
    def validate_password(cls, v):
        """Validate password strength."""
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.islower() for c in v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one digit')
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "otp_id": "123e4567-e89b-12d3-a456-426614174000",
                "code": "123456",
                "new_password": "NewPassword123"
            }
        }


class ChangePasswordRequest(BaseModel):
    """Change password request schema."""
    
    current_password: str = Field(description="Current password")
    new_password: str = Field(description="New password", min_length=8)
    
    @validator('new_password')
    def validate_password(cls, v):
        """Validate password strength."""
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.islower() for c in v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one digit')
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "current_password": "OldPassword123",
                "new_password": "NewPassword123"
            }
        }

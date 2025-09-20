"""
User schemas for API responses.
"""

from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from app.models.user import UserRole

class UserBase(BaseModel):
    email: str
    role: UserRole
    is_active: bool
    is_verified: bool

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: str
    last_login_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

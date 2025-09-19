"""
Authentication service for user management and JWT operations.

Handles user authentication, token management, and authorization.
"""

from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    verify_token,
    verify_password,
    get_password_hash,
)
from app.db.models.user import User, UserRole
from app.db.repository import UserRepository
from app.schemas.auth import TokenResponse

settings = get_settings()


class AuthService:
    """Authentication service for user management and JWT operations."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repo = UserRepository(User, db)
    
    async def authenticate_user(self, email: str, password: str) -> Optional[User]:
        """Authenticate user with email and password."""
        user = await self.user_repo.get_by_email(email)
        if not user or not user.hashed_password:
            return None
        
        if not verify_password(password, user.hashed_password):
            return None
        
        if not user.is_active:
            return None
        
        return user
    
    async def create_user(self, user_data: Dict[str, Any]) -> User:
        """Create a new user."""
        # Hash password if provided
        if "password" in user_data and user_data["password"]:
            user_data["hashed_password"] = get_password_hash(user_data.pop("password"))
        
        return await self.user_repo.create(user_data)
    
    async def get_user_by_id(self, user_id: UUID) -> Optional[User]:
        """Get user by ID."""
        return await self.user_repo.get(user_id)
    
    async def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email."""
        return await self.user_repo.get_by_email(email)
    
    async def update_user(self, user_id: UUID, update_data: Dict[str, Any]) -> Optional[User]:
        """Update user information."""
        return await self.user_repo.update(user_id, update_data)
    
    async def deactivate_user(self, user_id: UUID) -> bool:
        """Deactivate user account."""
        return await self.user_repo.update(user_id, {"is_active": False})
    
    async def activate_user(self, user_id: UUID) -> bool:
        """Activate user account."""
        return await self.user_repo.update(user_id, {"is_active": True})
    
    async def verify_user(self, user_id: UUID) -> bool:
        """Verify user account."""
        return await self.user_repo.update(user_id, {"is_verified": True})
    
    async def update_last_login(self, user_id: UUID) -> bool:
        """Update user's last login timestamp."""
        return await self.user_repo.update(user_id, {"last_login_at": datetime.utcnow()})
    
    def create_tokens(self, user: User) -> TokenResponse:
        """Create JWT access and refresh tokens for user."""
        token_data = {
            "sub": str(user.id),
            "email": user.email,
            "role": user.role,
            "is_verified": user.is_verified
        }
        
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            refresh_expires_in=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60
        )
    
    def verify_access_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Verify JWT access token."""
        token_data = verify_token(token, "access")
        if not token_data:
            return None
        
        return {
            "user_id": token_data.user_id,
            "email": token_data.email,
            "role": token_data.role,
            "is_verified": token_data.is_verified
        }
    
    def verify_refresh_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Verify JWT refresh token."""
        token_data = verify_token(token, "refresh")
        if not token_data:
            return None
        
        return {
            "user_id": token_data.user_id,
            "email": token_data.email,
            "role": token_data.role,
            "is_verified": token_data.is_verified
        }
    
    async def change_password(self, user_id: UUID, current_password: str, new_password: str) -> bool:
        """Change user password."""
        user = await self.user_repo.get(user_id)
        if not user or not user.hashed_password:
            return False
        
        if not verify_password(current_password, user.hashed_password):
            return False
        
        hashed_password = get_password_hash(new_password)
        await self.user_repo.update(user_id, {"hashed_password": hashed_password})
        return True
    
    async def reset_password(self, user_id: UUID, new_password: str) -> bool:
        """Reset user password."""
        hashed_password = get_password_hash(new_password)
        await self.user_repo.update(user_id, {"hashed_password": hashed_password})
        return True
    
    async def get_user_stats(self) -> Dict[str, Any]:
        """Get user statistics."""
        total_users = await self.user_repo.count()
        active_users = await self.user_repo.count({"is_active": True})
        verified_users = await self.user_repo.count({"is_verified": True})
        
        return {
            "total_users": total_users,
            "active_users": active_users,
            "verified_users": verified_users,
            "verification_rate": (verified_users / total_users * 100) if total_users > 0 else 0
        }
    
    async def get_users_by_role(self, role: UserRole) -> list[User]:
        """Get users by role."""
        return await self.user_repo.get_by_role(role)
    
    async def search_users(self, search_term: str, limit: int = 20) -> list[User]:
        """Search users by email."""
        return await self.user_repo.search(search_term, ["email"], 0, limit)

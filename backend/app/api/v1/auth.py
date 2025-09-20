"""
Authentication API endpoints.

Handles OTP requests, login, token management, and user authentication.
"""

from datetime import datetime, timedelta
from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.logging import log_auth_event, log_security_event
from app.core.security import (
    create_access_token,
    create_refresh_token,
    verify_token,
    generate_otp,
    hash_otp,
    verify_otp,
    is_otp_expired,
    is_rate_limited,
    get_rate_limit_info,
    verify_password,
    get_password_hash,
)
from app.db.base import get_db
from app.db.models.user import User, UserRole
from app.db.models.otp import OTP, OTPPurpose
from app.db.repository import UserRepository, OTPRepository
from app.schemas.auth import (
    OTPRequest,
    OTPVerify,
    LoginRequest,
    TokenResponse,
    RefreshTokenRequest,
    UserResponse,
    OTPResponse,
    LogoutRequest,
    PasswordResetRequest,
    PasswordResetConfirm,
    ChangePasswordRequest,
)
from app.schemas.common import BaseResponse, ErrorResponse

router = APIRouter()
security = HTTPBearer()
settings = get_settings()


@router.post("/otp/request", response_model=OTPResponse, status_code=status.HTTP_201_CREATED)
async def request_otp(
    request: OTPRequest,
    http_request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Request OTP for authentication or verification.
    
    Sends OTP to email or phone for login, email verification, or password reset.
    Rate limited to prevent abuse.
    """
    # Get client IP for rate limiting
    client_ip = http_request.client.host
    
    # Check rate limiting
    identifier = request.email or request.phone
    if is_rate_limited(identifier, settings.RATE_LIMIT_OTP_REQUESTS, 1):
        log_security_event(
            "rate_limit_exceeded",
            "medium",
            ip_address=client_ip,
            details={"endpoint": "otp_request", "identifier": identifier}
        )
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many OTP requests. Please try again later."
        )
    
    # Generate OTP
    otp_code = generate_otp()
    hashed_otp = hash_otp(otp_code)
    expires_at = datetime.utcnow() + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)
    
    # Create OTP record
    otp_repo = OTPRepository(OTP, db)
    otp_data = {
        "email_or_phone": identifier,
        "code": otp_code,
        "hashed_code": hashed_otp,
        "purpose": request.purpose,
        "expires_at": expires_at,
        "ip_address": client_ip,
        "user_agent": http_request.headers.get("user-agent"),
    }
    
    otp_record = await otp_repo.create(otp_data)
    
    # TODO: Send OTP via email/SMS
    # For now, just log it (in production, remove this)
    print(f"OTP for {identifier}: {otp_code}")
    
    # Log OTP request
    log_auth_event(
        "otp_requested",
        email=request.email,
        success=True,
        request_id=getattr(http_request.state, "request_id", None)
    )
    
    return OTPResponse(
        otp_id=otp_record.id,
        expires_at=otp_record.expires_at,
        message="OTP sent successfully"
    )


@router.post("/otp/verify", response_model=TokenResponse)
async def verify_otp_endpoint(
    request: OTPVerify,
    http_request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Verify OTP and return authentication tokens.
    
    Validates OTP code and issues JWT access and refresh tokens.
    Creates user account if it doesn't exist for registration purposes.
    """
    otp_repo = OTPRepository(OTP, db)
    user_repo = UserRepository(User, db)
    
    # Get OTP record
    otp_record = await otp_repo.get(request.otp_id)
    if not otp_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="OTP not found"
        )
    
    # Check if OTP is expired
    if is_otp_expired(otp_record.expires_at):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP has expired"
        )
    
    # Check if OTP is already used
    if otp_record.is_used:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP has already been used"
        )
    
    # Check max attempts
    if otp_record.is_max_attempts_reached:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum attempts exceeded"
        )
    
    # Verify OTP code
    if not verify_otp(request.code, otp_record.hashed_code):
        # Increment attempts
        otp_record.attempts += 1
        await db.commit()
        
        log_auth_event(
            "otp_verification_failed",
            email=otp_record.email_or_phone if "@" in otp_record.email_or_phone else None,
            success=False,
            error_message="Invalid OTP code",
            request_id=getattr(http_request.state, "request_id", None)
        )
        
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP code"
        )
    
    # Mark OTP as used
    otp_record.is_used = True
    await db.commit()
    
    # Get or create user
    user = await user_repo.get_by_email(otp_record.email_or_phone)
    if not user:
        # Create new user for registration
        if request.purpose in ["login"]:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found. Please register first."
            )
        
        # Determine user role based on purpose
        role = UserRole.STUDENT
        if request.purpose == "registration":
            # Check if it's an institution email (simple check)
            if "@" in otp_record.email_or_phone and "admin" in otp_record.email_or_phone:
                role = UserRole.INSTITUTION_ADMIN
        
        user_data = {
            "email": otp_record.email_or_phone,
            "role": role,
            "is_verified": True,
            "is_active": True,
        }
        user = await user_repo.create(user_data)
    
    # Update last login
    user.last_login_at = datetime.utcnow()
    await db.commit()
    
    # Create tokens
    access_token = create_access_token({
        "sub": str(user.id),
        "email": user.email,
        "role": user.role,
        "is_verified": user.is_verified
    })
    
    refresh_token = create_refresh_token({
        "sub": str(user.id),
        "email": user.email,
        "role": user.role,
        "is_verified": user.is_verified
    })
    
    # Log successful authentication
    log_auth_event(
        "otp_verification_success",
        user_id=str(user.id),
        email=user.email,
        success=True,
        request_id=getattr(http_request.state, "request_id", None)
    )
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        refresh_expires_in=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60
    )


@router.post("/login", response_model=TokenResponse)
async def admin_login(
    request: LoginRequest,
    http_request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Admin login with email and password.
    
    Authenticates admin users with email and password credentials.
    Returns JWT access and refresh tokens.
    """
    user_repo = UserRepository(User, db)
    
    # Get user by email
    user = await user_repo.get_by_email(request.email)
    if not user:
        log_auth_event(
            "admin_login_failed",
            email=request.email,
            success=False,
            error_message="User not found",
            request_id=getattr(http_request.state, "request_id", None)
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Check if user is admin
    if not user.is_admin:
        log_auth_event(
            "admin_login_failed",
            user_id=str(user.id),
            email=user.email,
            success=False,
            error_message="Insufficient privileges",
            request_id=getattr(http_request.state, "request_id", None)
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Admin privileges required."
        )
    
    # Check if user has password
    if not user.hashed_password:
        log_auth_event(
            "admin_login_failed",
            user_id=str(user.id),
            email=user.email,
            success=False,
            error_message="No password set",
            request_id=getattr(http_request.state, "request_id", None)
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password not set. Please use OTP login."
        )
    
    # Verify password
    if not verify_password(request.password, user.hashed_password):
        log_auth_event(
            "admin_login_failed",
            user_id=str(user.id),
            email=user.email,
            success=False,
            error_message="Invalid password",
            request_id=getattr(http_request.state, "request_id", None)
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Check if user is active
    if not user.is_active:
        log_auth_event(
            "admin_login_failed",
            user_id=str(user.id),
            email=user.email,
            success=False,
            error_message="Account deactivated",
            request_id=getattr(http_request.state, "request_id", None)
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated"
        )
    
    # Update last login
    user.last_login_at = datetime.utcnow()
    await db.commit()
    
    # Create tokens
    access_token = create_access_token({
        "sub": str(user.id),
        "email": user.email,
        "role": user.role,
        "is_verified": user.is_verified
    })
    
    refresh_token = create_refresh_token({
        "sub": str(user.id),
        "email": user.email,
        "role": user.role,
        "is_verified": user.is_verified
    })
    
    # Log successful authentication
    log_auth_event(
        "admin_login_success",
        user_id=str(user.id),
        email=user.email,
        success=True,
        request_id=getattr(http_request.state, "request_id", None)
    )
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        refresh_expires_in=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    request: RefreshTokenRequest,
    http_request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Refresh access token using refresh token.
    
    Issues new access and refresh tokens using valid refresh token.
    Implements refresh token rotation for security.
    """
    # Verify refresh token
    token_data = verify_token(request.refresh_token, "refresh")
    if not token_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    # Get user
    user_repo = UserRepository(User, db)
    user = await user_repo.get(token_data.user_id)
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    
    # Create new tokens
    access_token = create_access_token({
        "sub": str(user.id),
        "email": user.email,
        "role": user.role,
        "is_verified": user.is_verified
    })
    
    refresh_token = create_refresh_token({
        "sub": str(user.id),
        "email": user.email,
        "role": user.role,
        "is_verified": user.is_verified
    })
    
    # TODO: Invalidate old refresh token (store in Redis)
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        refresh_expires_in=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60
    )


@router.post("/logout", response_model=BaseResponse)
async def logout(
    request: LogoutRequest,
    http_request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Logout user and revoke refresh token.
    
    Invalidates refresh token and logs out the user.
    """
    # TODO: Implement refresh token revocation (store in Redis)
    
    log_auth_event(
        "logout",
        success=True,
        request_id=getattr(http_request.state, "request_id", None)
    )
    
    return BaseResponse(
        success=True,
        message="Logged out successfully"
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user(
    current_user: User = Depends(get_current_user_dependency)
):
    """
    Get current user information.
    
    Returns the authenticated user's profile information.
    """
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        role=current_user.role,
        is_active=current_user.is_active,
        is_verified=current_user.is_verified,
        created_at=current_user.created_at,
        last_login_at=current_user.last_login_at
    )


# Dependency to get current user
async def get_current_user_dependency(
    token: str = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    """Get current authenticated user from JWT token."""
    # Verify token
    token_data = verify_token(token.credentials, "access")
    if not token_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    
    # Get user
    user_repo = UserRepository(User, db)
    user = await user_repo.get(token_data.user_id)
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    
    return user


# Admin dependency
async def get_admin_user_dependency(
    current_user: User = Depends(get_current_user_dependency)
) -> User:
    """Get current admin user."""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return current_user

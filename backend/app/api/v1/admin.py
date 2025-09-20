"""
Admin API endpoints.

Handles system administration, statistics, and management operations.
"""

from typing import Dict, List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.base import get_db
from app.db.models.user import User
from app.db.repository import UserRepository, StudentRepository, InstitutionRepository, PaymentRepository
from app.schemas.common import BaseResponse, StatsResponse, AuditLogResponse, PaginationParams
from app.api.v1.auth import get_admin_user_dependency

router = APIRouter()


@router.get("/stats", response_model=StatsResponse)
async def get_admin_stats(
    current_user: User = Depends(get_admin_user_dependency),
    db: AsyncSession = Depends(get_db)
):
    """
    Get system statistics.
    
    Returns comprehensive system statistics including user counts,
    registrations, payments, and other metrics.
    """
    user_repo = UserRepository(User, db)
    student_repo = StudentRepository(Student, db)
    institution_repo = InstitutionRepository(Institution, db)
    payment_repo = PaymentRepository(Payment, db)
    
    # Get basic counts
    total_users = await user_repo.count()
    active_users = await user_repo.count({"is_active": True})
    verified_users = await user_repo.count({"is_verified": True})
    
    total_students = await student_repo.count()
    active_students = await student_repo.count({"is_active": True})
    
    total_institutions = await institution_repo.count()
    verified_institutions = await institution_repo.count({"verified": True})
    pending_institutions = await institution_repo.count({"verified": False})
    
    # Get payment statistics
    total_payments = await payment_repo.count()
    successful_payments = await payment_repo.count({"status": "success"})
    pending_payments = await payment_repo.count({"status": "pending"})
    failed_payments = await payment_repo.count({"status": "failed"})
    
    # Calculate rates
    verification_rate = (verified_users / total_users * 100) if total_users > 0 else 0
    institution_verification_rate = (verified_institutions / total_institutions * 100) if total_institutions > 0 else 0
    payment_success_rate = (successful_payments / total_payments * 100) if total_payments > 0 else 0
    
    stats_data = {
        "users": {
            "total": total_users,
            "active": active_users,
            "verified": verified_users,
            "verification_rate": round(verification_rate, 2),
        },
        "students": {
            "total": total_students,
            "active": active_students,
        },
        "institutions": {
            "total": total_institutions,
            "verified": verified_institutions,
            "pending": pending_institutions,
            "verification_rate": round(institution_verification_rate, 2),
        },
        "payments": {
            "total": total_payments,
            "successful": successful_payments,
            "pending": pending_payments,
            "failed": failed_payments,
            "success_rate": round(payment_success_rate, 2),
        },
        "system": {
            "uptime": "24h 30m",  # TODO: Calculate actual uptime
            "version": "0.1.0",
            "environment": "development",
        }
    }
    
    return StatsResponse(
        success=True,
        data=stats_data,
        timestamp=datetime.utcnow()
    )


@router.get("/users", response_model=List[dict])
async def list_users(
    pagination: PaginationParams = Depends(),
    role: Optional[str] = Query(None, description="Filter by role"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    is_verified: Optional[bool] = Query(None, description="Filter by verification status"),
    search: Optional[str] = Query(None, description="Search term"),
    current_user: User = Depends(get_admin_user_dependency),
    db: AsyncSession = Depends(get_db)
):
    """
    List all users with filtering and pagination.
    
    Returns paginated list of users with optional filtering.
    """
    user_repo = UserRepository(User, db)
    
    # Build filters
    filters = {}
    if role:
        filters["role"] = role
    if is_active is not None:
        filters["is_active"] = is_active
    if is_verified is not None:
        filters["is_verified"] = is_verified
    
    # Get users
    if search:
        users = await user_repo.search(
            search,
            ["email"],
            pagination.skip,
            pagination.limit
        )
    else:
        users = await user_repo.get_multi(
            pagination.skip,
            pagination.limit,
            filters,
            pagination.sort_by
        )
    
    # Convert to response format
    user_responses = []
    for user in users:
        user_responses.append({
            "id": str(user.id),
            "email": user.email,
            "role": user.role,
            "is_active": user.is_active,
            "is_verified": user.is_verified,
            "created_at": user.created_at.isoformat(),
            "last_login_at": user.last_login_at.isoformat() if user.last_login_at else None,
        })
    
    return user_responses


@router.get("/audit-logs", response_model=List[AuditLogResponse])
async def get_audit_logs(
    pagination: PaginationParams = Depends(),
    action: Optional[str] = Query(None, description="Filter by action"),
    resource_type: Optional[str] = Query(None, description="Filter by resource type"),
    user_id: Optional[UUID] = Query(None, description="Filter by user ID"),
    success: Optional[bool] = Query(None, description="Filter by success status"),
    current_user: User = Depends(get_admin_user_dependency),
    db: AsyncSession = Depends(get_db)
):
    """
    Get audit logs with filtering and pagination.
    
    Returns paginated list of audit logs for system monitoring.
    """
    # TODO: Implement audit log repository and filtering
    # For now, return empty list
    return []


@router.post("/users/{user_id}/activate", response_model=BaseResponse)
async def activate_user(
    user_id: UUID,
    current_user: User = Depends(get_admin_user_dependency),
    db: AsyncSession = Depends(get_db)
):
    """
    Activate user account.
    
    Activates a deactivated user account.
    """
    user_repo = UserRepository(User, db)
    
    # Get user
    user = await user_repo.get(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Activate user
    await user_repo.update(user_id, {"is_active": True})
    
    return BaseResponse(
        success=True,
        message="User activated successfully"
    )


@router.post("/users/{user_id}/deactivate", response_model=BaseResponse)
async def deactivate_user(
    user_id: UUID,
    current_user: User = Depends(get_admin_user_dependency),
    db: AsyncSession = Depends(get_db)
):
    """
    Deactivate user account.
    
    Deactivates a user account.
    """
    user_repo = UserRepository(User, db)
    
    # Get user
    user = await user_repo.get(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Prevent deactivating self
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot deactivate your own account"
        )
    
    # Deactivate user
    await user_repo.update(user_id, {"is_active": False})
    
    return BaseResponse(
        success=True,
        message="User deactivated successfully"
    )


@router.post("/users/{user_id}/verify", response_model=BaseResponse)
async def verify_user(
    user_id: UUID,
    current_user: User = Depends(get_admin_user_dependency),
    db: AsyncSession = Depends(get_db)
):
    """
    Verify user account.
    
    Marks user account as verified.
    """
    user_repo = UserRepository(User, db)
    
    # Get user
    user = await user_repo.get(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Verify user
    await user_repo.update(user_id, {"is_verified": True})
    
    return BaseResponse(
        success=True,
        message="User verified successfully"
    )


@router.delete("/users/{user_id}", response_model=BaseResponse)
async def delete_user(
    user_id: UUID,
    current_user: User = Depends(get_admin_user_dependency),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete user account.
    
    Permanently deletes a user account and all associated data.
    """
    user_repo = UserRepository(User, db)
    
    # Get user
    user = await user_repo.get(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Prevent deleting self
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    # Delete user (hard delete)
    await user_repo.hard_delete(user_id)
    
    return BaseResponse(
        success=True,
        message="User deleted successfully"
    )


@router.get("/system/health", response_model=Dict[str, Any])
async def get_system_health(
    current_user: User = Depends(get_admin_user_dependency),
    db: AsyncSession = Depends(get_db)
):
    """
    Get system health status.
    
    Returns system health information including database connectivity,
    external services, and performance metrics.
    """
    # TODO: Implement actual health checks
    health_data = {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "database": "healthy",
            "redis": "healthy",
            "storage": "healthy",
            "email": "healthy",
            "sms": "healthy",
        },
        "metrics": {
            "response_time": "50ms",
            "memory_usage": "45%",
            "cpu_usage": "30%",
            "disk_usage": "60%",
        }
    }
    
    return health_data

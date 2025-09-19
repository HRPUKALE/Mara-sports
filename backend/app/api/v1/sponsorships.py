"""
Sponsorship API endpoints.

Handles sponsorship applications and management.
"""

from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.base import get_db
from app.db.models.sponsorship import Sponsorship
from app.db.models.user import User
from app.db.repository import BaseRepository
from app.schemas.sponsorship import (
    SponsorshipCreate,
    SponsorshipUpdate,
    SponsorshipResponse,
    SponsorshipStatus,
)
from app.schemas.common import BaseResponse, PaginationParams
from app.api.v1.auth import get_current_user_dependency, get_admin_user_dependency

router = APIRouter()


@router.post("/", response_model=SponsorshipResponse, status_code=status.HTTP_201_CREATED)
async def create_sponsorship(
    sponsorship_data: SponsorshipCreate,
    current_user: User = Depends(get_current_user_dependency),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new sponsorship application.
    
    Creates sponsorship application for institution.
    """
    sponsorship_repo = BaseRepository(Sponsorship, db)
    
    # Create sponsorship
    sponsorship_dict = sponsorship_data.dict()
    sponsorship_dict["created_by"] = current_user.id
    sponsorship = await sponsorship_repo.create(sponsorship_dict)
    
    return SponsorshipResponse(
        id=sponsorship.id,
        institution_id=sponsorship.institution_id,
        sponsor_name=sponsorship.sponsor_name,
        sponsor_contact_person=sponsorship.sponsor_contact_person,
        sponsor_email=sponsorship.sponsor_email,
        sponsor_phone=sponsorship.sponsor_phone,
        requested_amount=float(sponsorship.requested_amount),
        approved_amount=float(sponsorship.approved_amount) if sponsorship.approved_amount else None,
        currency=sponsorship.currency,
        sponsorship_type=sponsorship.sponsorship_type,
        description=sponsorship.description,
        terms_and_conditions=sponsorship.terms_and_conditions,
        status=sponsorship.status,
        reviewed_by=sponsorship.reviewed_by,
        review_notes=sponsorship.review_notes,
        rejection_reason=sponsorship.rejection_reason,
        start_date=sponsorship.start_date,
        end_date=sponsorship.end_date,
        is_renewable=sponsorship.is_renewable,
        documents=sponsorship.documents,
        metadata=sponsorship.metadata,
        created_at=sponsorship.created_at,
        updated_at=sponsorship.updated_at,
    )


@router.get("/", response_model=List[SponsorshipResponse])
async def list_sponsorships(
    pagination: PaginationParams = Depends(),
    status: Optional[str] = Query(None, description="Filter by status"),
    institution_id: Optional[UUID] = Query(None, description="Filter by institution"),
    current_user: User = Depends(get_current_user_dependency),
    db: AsyncSession = Depends(get_db)
):
    """
    List sponsorships with pagination and filtering.
    
    Returns paginated list of sponsorships.
    """
    sponsorship_repo = BaseRepository(Sponsorship, db)
    
    # Build filters
    filters = {}
    if status:
        filters["status"] = status
    if institution_id:
        filters["institution_id"] = institution_id
    
    # Get sponsorships
    sponsorships = await sponsorship_repo.get_multi(
        pagination.skip,
        pagination.limit,
        filters,
        pagination.sort_by
    )
    
    # Convert to response format
    sponsorship_responses = []
    for sponsorship in sponsorships:
        sponsorship_responses.append(SponsorshipResponse(
            id=sponsorship.id,
            institution_id=sponsorship.institution_id,
            sponsor_name=sponsorship.sponsor_name,
            sponsor_contact_person=sponsorship.sponsor_contact_person,
            sponsor_email=sponsorship.sponsor_email,
            sponsor_phone=sponsorship.sponsor_phone,
            requested_amount=float(sponsorship.requested_amount),
            approved_amount=float(sponsorship.approved_amount) if sponsorship.approved_amount else None,
            currency=sponsorship.currency,
            sponsorship_type=sponsorship.sponsorship_type,
            description=sponsorship.description,
            terms_and_conditions=sponsorship.terms_and_conditions,
            status=sponsorship.status,
            reviewed_by=sponsorship.reviewed_by,
            review_notes=sponsorship.review_notes,
            rejection_reason=sponsorship.rejection_reason,
            start_date=sponsorship.start_date,
            end_date=sponsorship.end_date,
            is_renewable=sponsorship.is_renewable,
            documents=sponsorship.documents,
            metadata=sponsorship.metadata,
            created_at=sponsorship.created_at,
            updated_at=sponsorship.updated_at,
        ))
    
    return sponsorship_responses


@router.get("/{sponsorship_id}", response_model=SponsorshipResponse)
async def get_sponsorship(
    sponsorship_id: UUID,
    current_user: User = Depends(get_current_user_dependency),
    db: AsyncSession = Depends(get_db)
):
    """
    Get sponsorship by ID.
    
    Returns sponsorship information.
    """
    sponsorship_repo = BaseRepository(Sponsorship, db)
    
    # Get sponsorship
    sponsorship = await sponsorship_repo.get(sponsorship_id)
    if not sponsorship:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sponsorship not found"
        )
    
    # Check permissions
    if not current_user.is_admin and sponsorship.created_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    return SponsorshipResponse(
        id=sponsorship.id,
        institution_id=sponsorship.institution_id,
        sponsor_name=sponsorship.sponsor_name,
        sponsor_contact_person=sponsorship.sponsor_contact_person,
        sponsor_email=sponsorship.sponsor_email,
        sponsor_phone=sponsorship.sponsor_phone,
        requested_amount=float(sponsorship.requested_amount),
        approved_amount=float(sponsorship.approved_amount) if sponsorship.approved_amount else None,
        currency=sponsorship.currency,
        sponsorship_type=sponsorship.sponsorship_type,
        description=sponsorship.description,
        terms_and_conditions=sponsorship.terms_and_conditions,
        status=sponsorship.status,
        reviewed_by=sponsorship.reviewed_by,
        review_notes=sponsorship.review_notes,
        rejection_reason=sponsorship.rejection_reason,
        start_date=sponsorship.start_date,
        end_date=sponsorship.end_date,
        is_renewable=sponsorship.is_renewable,
        documents=sponsorship.documents,
        metadata=sponsorship.metadata,
        created_at=sponsorship.created_at,
        updated_at=sponsorship.updated_at,
    )


@router.patch("/{sponsorship_id}", response_model=SponsorshipResponse)
async def update_sponsorship(
    sponsorship_id: UUID,
    update_data: SponsorshipUpdate,
    current_user: User = Depends(get_current_user_dependency),
    db: AsyncSession = Depends(get_db)
):
    """
    Update sponsorship.
    
    Updates sponsorship information.
    """
    sponsorship_repo = BaseRepository(Sponsorship, db)
    
    # Get sponsorship
    sponsorship = await sponsorship_repo.get(sponsorship_id)
    if not sponsorship:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sponsorship not found"
        )
    
    # Check permissions
    if not current_user.is_admin and sponsorship.created_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Update sponsorship
    update_dict = update_data.dict(exclude_unset=True)
    updated_sponsorship = await sponsorship_repo.update(sponsorship_id, update_dict)
    
    return SponsorshipResponse(
        id=updated_sponsorship.id,
        institution_id=updated_sponsorship.institution_id,
        sponsor_name=updated_sponsorship.sponsor_name,
        sponsor_contact_person=updated_sponsorship.sponsor_contact_person,
        sponsor_email=updated_sponsorship.sponsor_email,
        sponsor_phone=updated_sponsorship.sponsor_phone,
        requested_amount=float(updated_sponsorship.requested_amount),
        approved_amount=float(updated_sponsorship.approved_amount) if updated_sponsorship.approved_amount else None,
        currency=updated_sponsorship.currency,
        sponsorship_type=updated_sponsorship.sponsorship_type,
        description=updated_sponsorship.description,
        terms_and_conditions=updated_sponsorship.terms_and_conditions,
        status=updated_sponsorship.status,
        reviewed_by=updated_sponsorship.reviewed_by,
        review_notes=updated_sponsorship.review_notes,
        rejection_reason=updated_sponsorship.rejection_reason,
        start_date=updated_sponsorship.start_date,
        end_date=updated_sponsorship.end_date,
        is_renewable=updated_sponsorship.is_renewable,
        documents=updated_sponsorship.documents,
        metadata=updated_sponsorship.metadata,
        created_at=updated_sponsorship.created_at,
        updated_at=updated_sponsorship.updated_at,
    )


@router.post("/{sponsorship_id}/approve", response_model=BaseResponse)
async def approve_sponsorship(
    sponsorship_id: UUID,
    approved_amount: Optional[float] = None,
    notes: Optional[str] = None,
    current_user: User = Depends(get_admin_user_dependency),
    db: AsyncSession = Depends(get_db)
):
    """
    Approve sponsorship application.
    
    Approves sponsorship application with optional amount adjustment.
    """
    sponsorship_repo = BaseRepository(Sponsorship, db)
    
    # Get sponsorship
    sponsorship = await sponsorship_repo.get(sponsorship_id)
    if not sponsorship:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sponsorship not found"
        )
    
    # Check if sponsorship can be approved
    if not sponsorship.can_be_approved:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Sponsorship cannot be approved"
        )
    
    # Approve sponsorship
    sponsorship.approve(approved_amount, current_user.email, notes)
    await db.commit()
    
    return BaseResponse(
        success=True,
        message="Sponsorship approved successfully"
    )


@router.post("/{sponsorship_id}/reject", response_model=BaseResponse)
async def reject_sponsorship(
    sponsorship_id: UUID,
    reason: str,
    current_user: User = Depends(get_admin_user_dependency),
    db: AsyncSession = Depends(get_db)
):
    """
    Reject sponsorship application.
    
    Rejects sponsorship application with reason.
    """
    sponsorship_repo = BaseRepository(Sponsorship, db)
    
    # Get sponsorship
    sponsorship = await sponsorship_repo.get(sponsorship_id)
    if not sponsorship:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sponsorship not found"
        )
    
    # Check if sponsorship can be rejected
    if not sponsorship.can_be_rejected:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Sponsorship cannot be rejected"
        )
    
    # Reject sponsorship
    sponsorship.reject(reason, current_user.email)
    await db.commit()
    
    return BaseResponse(
        success=True,
        message="Sponsorship rejected successfully"
    )


@router.post("/{sponsorship_id}/cancel", response_model=BaseResponse)
async def cancel_sponsorship(
    sponsorship_id: UUID,
    reason: Optional[str] = None,
    current_user: User = Depends(get_current_user_dependency),
    db: AsyncSession = Depends(get_db)
):
    """
    Cancel sponsorship application.
    
    Cancels sponsorship application.
    """
    sponsorship_repo = BaseRepository(Sponsorship, db)
    
    # Get sponsorship
    sponsorship = await sponsorship_repo.get(sponsorship_id)
    if not sponsorship:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sponsorship not found"
        )
    
    # Check permissions
    if not current_user.is_admin and sponsorship.created_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Check if sponsorship can be cancelled
    if not sponsorship.can_be_cancelled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Sponsorship cannot be cancelled"
        )
    
    # Cancel sponsorship
    sponsorship.cancel(reason)
    await db.commit()
    
    return BaseResponse(
        success=True,
        message="Sponsorship cancelled successfully"
    )

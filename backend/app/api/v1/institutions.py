"""
Institution API endpoints.

Handles institution management, student imports, and related operations.
"""

from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.base import get_db
from app.db.models.institution import Institution
from app.db.models.user import User
from app.db.repository import InstitutionRepository, UserRepository
from app.schemas.institution import (
    InstitutionCreate,
    InstitutionUpdate,
    InstitutionResponse,
    InstitutionProfile,
    InstitutionStats,
)
from app.schemas.common import BaseResponse, PaginationParams
from app.api.v1.auth import get_admin_user_dependency, get_current_user_dependency

router = APIRouter()


@router.post("/", response_model=InstitutionResponse, status_code=status.HTTP_201_CREATED)
async def create_institution(
    institution_data: InstitutionCreate,
    current_user: User = Depends(get_admin_user_dependency),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new institution.
    
    Creates institution with admin user account.
    """
    institution_repo = InstitutionRepository(Institution, db)
    user_repo = UserRepository(User, db)
    
    # Check if institution already exists
    existing_institution = await institution_repo.get_by_email(institution_data.email)
    if existing_institution:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Institution with this email already exists"
        )
    
    # Create user account for institution
    user_data = {
        "email": institution_data.email,
        "role": "institution_admin",
        "is_verified": False,
        "is_active": True,
    }
    user = await user_repo.create(user_data)
    
    # Create institution
    institution_dict = institution_data.dict()
    institution_dict["user_id"] = user.id
    
    institution = await institution_repo.create(institution_dict)
    
    return InstitutionResponse(
        id=institution.id,
        user_id=institution.user_id,
        name=institution.name,
        email=institution.email,
        phone=institution.phone,
        address=institution.address,
        institution_type=institution.institution_type,
        registration_number=institution.registration_number,
        website=institution.website,
        description=institution.description,
        verified=institution.verified,
        verification_date=institution.verification_date,
        verification_notes=institution.verification_notes,
        billing_info=institution.billing_info,
        contact_person_name=institution.contact_person_name,
        contact_person_phone=institution.contact_person_phone,
        contact_person_email=institution.contact_person_email,
        logo_url=institution.logo_url,
        is_active=institution.is_active,
        created_at=institution.created_at,
        updated_at=institution.updated_at,
    )


@router.get("/", response_model=List[InstitutionResponse])
async def list_institutions(
    pagination: PaginationParams = Depends(),
    search: Optional[str] = Query(None, description="Search term"),
    verified: Optional[bool] = Query(None, description="Filter by verification status"),
    current_user: User = Depends(get_admin_user_dependency),
    db: AsyncSession = Depends(get_db)
):
    """
    List institutions with pagination and filtering.
    
    Returns paginated list of institutions.
    """
    institution_repo = InstitutionRepository(Institution, db)
    
    # Build filters
    filters = {}
    if verified is not None:
        filters["verified"] = verified
    
    # Get institutions
    if search:
        institutions = await institution_repo.search(
            search,
            ["name", "email", "registration_number"],
            pagination.skip,
            pagination.limit
        )
    else:
        institutions = await institution_repo.get_multi(
            pagination.skip,
            pagination.limit,
            filters,
            pagination.sort_by
        )
    
    # Convert to response format
    institution_responses = []
    for institution in institutions:
        institution_responses.append(InstitutionResponse(
            id=institution.id,
            user_id=institution.user_id,
            name=institution.name,
            email=institution.email,
            phone=institution.phone,
            address=institution.address,
            institution_type=institution.institution_type,
            registration_number=institution.registration_number,
            website=institution.website,
            description=institution.description,
            verified=institution.verified,
            verification_date=institution.verification_date,
            verification_notes=institution.verification_notes,
            billing_info=institution.billing_info,
            contact_person_name=institution.contact_person_name,
            contact_person_phone=institution.contact_person_phone,
            contact_person_email=institution.contact_person_email,
            logo_url=institution.logo_url,
            is_active=institution.is_active,
            created_at=institution.created_at,
            updated_at=institution.updated_at,
        ))
    
    return institution_responses


@router.get("/{institution_id}", response_model=InstitutionResponse)
async def get_institution(
    institution_id: UUID,
    current_user: User = Depends(get_admin_user_dependency),
    db: AsyncSession = Depends(get_db)
):
    """
    Get institution by ID.
    
    Returns institution profile information.
    """
    institution_repo = InstitutionRepository(Institution, db)
    
    # Get institution
    institution = await institution_repo.get(institution_id)
    if not institution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Institution not found"
        )
    
    return InstitutionResponse(
        id=institution.id,
        user_id=institution.user_id,
        name=institution.name,
        email=institution.email,
        phone=institution.phone,
        address=institution.address,
        institution_type=institution.institution_type,
        registration_number=institution.registration_number,
        website=institution.website,
        description=institution.description,
        verified=institution.verified,
        verification_date=institution.verification_date,
        verification_notes=institution.verification_notes,
        billing_info=institution.billing_info,
        contact_person_name=institution.contact_person_name,
        contact_person_phone=institution.contact_person_phone,
        contact_person_email=institution.contact_person_email,
        logo_url=institution.logo_url,
        is_active=institution.is_active,
        created_at=institution.created_at,
        updated_at=institution.updated_at,
    )


@router.patch("/{institution_id}", response_model=InstitutionResponse)
async def update_institution(
    institution_id: UUID,
    update_data: InstitutionUpdate,
    current_user: User = Depends(get_admin_user_dependency),
    db: AsyncSession = Depends(get_db)
):
    """
    Update institution.
    
    Updates institution information.
    """
    institution_repo = InstitutionRepository(Institution, db)
    
    # Get institution
    institution = await institution_repo.get(institution_id)
    if not institution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Institution not found"
        )
    
    # Update institution
    update_dict = update_data.dict(exclude_unset=True)
    updated_institution = await institution_repo.update(institution_id, update_dict)
    
    return InstitutionResponse(
        id=updated_institution.id,
        user_id=updated_institution.user_id,
        name=updated_institution.name,
        email=updated_institution.email,
        phone=updated_institution.phone,
        address=updated_institution.address,
        institution_type=updated_institution.institution_type,
        registration_number=updated_institution.registration_number,
        website=updated_institution.website,
        description=updated_institution.description,
        verified=updated_institution.verified,
        verification_date=updated_institution.verification_date,
        verification_notes=updated_institution.verification_notes,
        billing_info=updated_institution.billing_info,
        contact_person_name=updated_institution.contact_person_name,
        contact_person_phone=updated_institution.contact_person_phone,
        contact_person_email=updated_institution.contact_person_email,
        logo_url=updated_institution.logo_url,
        is_active=updated_institution.is_active,
        created_at=updated_institution.created_at,
        updated_at=updated_institution.updated_at,
    )


@router.post("/{institution_id}/verify", response_model=BaseResponse)
async def verify_institution(
    institution_id: UUID,
    verification_notes: Optional[str] = None,
    current_user: User = Depends(get_admin_user_dependency),
    db: AsyncSession = Depends(get_db)
):
    """
    Verify institution.
    
    Marks institution as verified and sends notification.
    """
    institution_repo = InstitutionRepository(Institution, db)
    
    # Get institution
    institution = await institution_repo.get(institution_id)
    if not institution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Institution not found"
        )
    
    # Update verification status
    update_data = {
        "verified": True,
        "verification_date": datetime.utcnow().isoformat(),
        "verification_notes": verification_notes,
    }
    await institution_repo.update(institution_id, update_data)
    
    # TODO: Send verification notification email
    
    return BaseResponse(
        success=True,
        message="Institution verified successfully"
    )


@router.get("/{institution_id}/students", response_model=List[dict])
async def get_institution_students(
    institution_id: UUID,
    pagination: PaginationParams = Depends(),
    search: Optional[str] = Query(None, description="Search term"),
    current_user: User = Depends(get_current_user_dependency),
    db: AsyncSession = Depends(get_db)
):
    """
    Get students for institution.
    
    Returns list of students belonging to the institution.
    """
    institution_repo = InstitutionRepository(Institution, db)
    
    # Get institution
    institution = await institution_repo.get(institution_id)
    if not institution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Institution not found"
        )
    
    # Check permissions
    if not current_user.is_admin and institution.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Get students
    students = await institution_repo.get_students(institution_id)
    
    # Apply search filter if provided
    if search:
        students = [
            s for s in students
            if search.lower() in s.full_name.lower() or
            (s.student_id and search.lower() in s.student_id.lower())
        ]
    
    # Apply pagination
    start = pagination.skip
    end = start + pagination.limit
    paginated_students = students[start:end]
    
    # Convert to response format
    student_responses = []
    for student in paginated_students:
        student_responses.append({
            "id": str(student.id),
            "first_name": student.first_name,
            "last_name": student.last_name,
            "full_name": student.full_name,
            "email": student.user.email,
            "student_id": student.student_id,
            "gender": student.gender,
            "age": student.age,
            "is_active": student.is_active,
            "created_at": student.created_at.isoformat(),
        })
    
    return student_responses


@router.get("/{institution_id}/stats", response_model=InstitutionStats)
async def get_institution_stats(
    institution_id: UUID,
    current_user: User = Depends(get_current_user_dependency),
    db: AsyncSession = Depends(get_db)
):
    """
    Get institution statistics.
    
    Returns statistics for the institution including student counts,
    registrations, and other metrics.
    """
    institution_repo = InstitutionRepository(Institution, db)
    
    # Get institution
    institution = await institution_repo.get(institution_id)
    if not institution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Institution not found"
        )
    
    # Check permissions
    if not current_user.is_admin and institution.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Calculate statistics
    total_students = institution.get_total_students()
    verified_students = institution.get_verified_students()
    pending_verifications = institution.get_pending_verifications()
    total_registrations = institution.get_total_registrations()
    active_registrations = institution.get_active_registrations()
    
    return InstitutionStats(
        total_students=total_students,
        verified_students=verified_students,
        pending_verifications=pending_verifications,
        total_registrations=total_registrations,
        active_registrations=active_registrations,
        verification_rate=(verified_students / total_students * 100) if total_students > 0 else 0,
        registration_rate=(active_registrations / total_registrations * 100) if total_registrations > 0 else 0,
    )

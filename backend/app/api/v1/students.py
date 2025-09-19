"""
Student API endpoints.

Handles student profile management, registrations, and related operations.
"""

from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.base import get_db
from app.db.models.student import Student
from app.db.models.user import User
from app.db.repository import StudentRepository, UserRepository
from app.schemas.student import (
    StudentCreate,
    StudentUpdate,
    StudentResponse,
    StudentProfile,
    StudentRegistration,
    StudentListResponse,
)
from app.schemas.common import BaseResponse, PaginationParams
from app.api.v1.auth import get_current_user_dependency

router = APIRouter()


@router.get("/me", response_model=StudentProfile)
async def get_my_profile(
    current_user: User = Depends(get_current_user_dependency),
    db: AsyncSession = Depends(get_db)
):
    """
    Get current student's profile.
    
    Returns detailed profile information including user data,
    institution, registrations, and documents.
    """
    student_repo = StudentRepository(Student, db)
    user_repo = UserRepository(User, db)
    
    # Get student profile
    student = await student_repo.get_by_user_id(current_user.id)
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found"
        )
    
    # Get user data
    user_data = {
        "id": str(current_user.id),
        "email": current_user.email,
        "role": current_user.role,
        "is_verified": current_user.is_verified,
        "is_active": current_user.is_active,
        "created_at": current_user.created_at.isoformat(),
        "last_login_at": current_user.last_login_at.isoformat() if current_user.last_login_at else None,
    }
    
    # Get institution data if applicable
    institution_data = None
    if student.institution:
        institution_data = {
            "id": str(student.institution.id),
            "name": student.institution.name,
            "email": student.institution.email,
            "verified": student.institution.verified,
        }
    
    # Get registrations
    registrations = []
    for registration in student.registrations:
        registrations.append({
            "id": str(registration.id),
            "sport_category": {
                "id": str(registration.sport_category.id),
                "name": registration.sport_category.name,
                "sport": registration.sport_category.sport.name,
            },
            "status": registration.status,
            "registered_at": registration.registered_at.isoformat(),
            "payment_status": registration.payment_status,
        })
    
    # Get documents
    documents = []
    for document in student.documents:
        documents.append({
            "id": str(document.id),
            "filename": document.filename,
            "document_type": document.document_type,
            "is_verified": document.is_verified,
            "created_at": document.created_at.isoformat(),
        })
    
    return StudentProfile(
        student=StudentResponse(
            id=student.id,
            user_id=student.user_id,
            first_name=student.first_name,
            middle_name=student.middle_name,
            last_name=student.last_name,
            full_name=student.full_name,
            gender=student.gender,
            date_of_birth=student.date_of_birth,
            age=student.age,
            phone=student.phone,
            address=student.address,
            medical_info=student.medical_info,
            guardian=student.guardian,
            institution_id=student.institution_id,
            student_id=student.student_id,
            profile_picture=student.profile_picture,
            is_active=student.is_active,
            created_at=student.created_at,
            updated_at=student.updated_at,
        ),
        user=user_data,
        institution=institution_data,
        registrations=registrations,
        documents=documents,
    )


@router.patch("/me", response_model=StudentResponse)
async def update_my_profile(
    update_data: StudentUpdate,
    current_user: User = Depends(get_current_user_dependency),
    db: AsyncSession = Depends(get_db)
):
    """
    Update current student's profile.
    
    Updates student profile information with validation.
    """
    student_repo = StudentRepository(Student, db)
    
    # Get student profile
    student = await student_repo.get_by_user_id(current_user.id)
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found"
        )
    
    # Update student data
    update_dict = update_data.dict(exclude_unset=True)
    updated_student = await student_repo.update(student.id, update_dict)
    
    return StudentResponse(
        id=updated_student.id,
        user_id=updated_student.user_id,
        first_name=updated_student.first_name,
        middle_name=updated_student.middle_name,
        last_name=updated_student.last_name,
        full_name=updated_student.full_name,
        gender=updated_student.gender,
        date_of_birth=updated_student.date_of_birth,
        age=updated_student.age,
        phone=updated_student.phone,
        address=updated_student.address,
        medical_info=updated_student.medical_info,
        guardian=updated_student.guardian,
        institution_id=updated_student.institution_id,
        student_id=updated_student.student_id,
        profile_picture=updated_student.profile_picture,
        is_active=updated_student.is_active,
        created_at=updated_student.created_at,
        updated_at=updated_student.updated_at,
    )


@router.get("/{student_id}/registrations", response_model=List[dict])
async def get_student_registrations(
    student_id: UUID,
    current_user: User = Depends(get_current_user_dependency),
    db: AsyncSession = Depends(get_db)
):
    """
    Get student's registrations.
    
    Returns list of registrations for the specified student.
    """
    student_repo = StudentRepository(Student, db)
    
    # Get student
    student = await student_repo.get(student_id)
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    # Check if user can access this student's data
    if not current_user.is_admin and student.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Get registrations
    registrations = []
    for registration in student.registrations:
        registrations.append({
            "id": str(registration.id),
            "sport_category": {
                "id": str(registration.sport_category.id),
                "name": registration.sport_category.name,
                "sport": registration.sport_category.sport.name,
                "fee": float(registration.sport_category.fee),
            },
            "status": registration.status,
            "registered_at": registration.registered_at.isoformat(),
            "payment_status": registration.payment_status,
            "total_fee": registration.total_fee,
        })
    
    return registrations


@router.post("/", response_model=StudentResponse, status_code=status.HTTP_201_CREATED)
async def create_student(
    student_data: StudentCreate,
    current_user: User = Depends(get_current_user_dependency),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new student profile.
    
    Creates student profile for the current user.
    """
    student_repo = StudentRepository(Student, db)
    
    # Check if student already exists
    existing_student = await student_repo.get_by_user_id(current_user.id)
    if existing_student:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student profile already exists"
        )
    
    # Create student data
    student_dict = student_data.dict()
    student_dict["user_id"] = current_user.id
    
    student = await student_repo.create(student_dict)
    
    return StudentResponse(
        id=student.id,
        user_id=student.user_id,
        first_name=student.first_name,
        middle_name=student.middle_name,
        last_name=student.last_name,
        full_name=student.full_name,
        gender=student.gender,
        date_of_birth=student.date_of_birth,
        age=student.age,
        phone=student.phone,
        address=student.address,
        medical_info=student.medical_info,
        guardian=student.guardian,
        institution_id=student.institution_id,
        student_id=student.student_id,
        profile_picture=student.profile_picture,
        is_active=student.is_active,
        created_at=student.created_at,
        updated_at=student.updated_at,
    )


@router.get("/", response_model=StudentListResponse)
async def list_students(
    pagination: PaginationParams = Depends(),
    search: Optional[str] = Query(None, description="Search term"),
    institution_id: Optional[UUID] = Query(None, description="Filter by institution"),
    current_user: User = Depends(get_current_user_dependency),
    db: AsyncSession = Depends(get_db)
):
    """
    List students with pagination and filtering.
    
    Returns paginated list of students with optional search and filtering.
    """
    # Check permissions
    if not current_user.is_admin and not current_user.is_institution_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    student_repo = StudentRepository(Student, db)
    
    # Build filters
    filters = {}
    if institution_id:
        filters["institution_id"] = institution_id
    
    # Get students
    if search:
        students = await student_repo.search(
            search,
            ["first_name", "last_name", "student_id"],
            pagination.skip,
            pagination.limit
        )
        total = await student_repo.count(filters)
    else:
        students = await student_repo.get_multi(
            pagination.skip,
            pagination.limit,
            filters,
            pagination.sort_by
        )
        total = await student_repo.count(filters)
    
    # Convert to response format
    student_responses = []
    for student in students:
        student_responses.append(StudentResponse(
            id=student.id,
            user_id=student.user_id,
            first_name=student.first_name,
            middle_name=student.middle_name,
            last_name=student.last_name,
            full_name=student.full_name,
            gender=student.gender,
            date_of_birth=student.date_of_birth,
            age=student.age,
            phone=student.phone,
            address=student.address,
            medical_info=student.medical_info,
            guardian=student.guardian,
            institution_id=student.institution_id,
            student_id=student.student_id,
            profile_picture=student.profile_picture,
            is_active=student.is_active,
            created_at=student.created_at,
            updated_at=student.updated_at,
        ))
    
    return StudentListResponse(
        data=student_responses,
        total=total,
        page=pagination.page,
        size=pagination.size,
        pages=(total + pagination.size - 1) // pagination.size
    )


@router.get("/{student_id}", response_model=StudentResponse)
async def get_student(
    student_id: UUID,
    current_user: User = Depends(get_current_user_dependency),
    db: AsyncSession = Depends(get_db)
):
    """
    Get student by ID.
    
    Returns student profile information.
    """
    student_repo = StudentRepository(Student, db)
    
    # Get student
    student = await student_repo.get(student_id)
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    # Check permissions
    if not current_user.is_admin and student.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    return StudentResponse(
        id=student.id,
        user_id=student.user_id,
        first_name=student.first_name,
        middle_name=student.middle_name,
        last_name=student.last_name,
        full_name=student.full_name,
        gender=student.gender,
        date_of_birth=student.date_of_birth,
        age=student.age,
        phone=student.phone,
        address=student.address,
        medical_info=student.medical_info,
        guardian=student.guardian,
        institution_id=student.institution_id,
        student_id=student.student_id,
        profile_picture=student.profile_picture,
        is_active=student.is_active,
        created_at=student.created_at,
        updated_at=student.updated_at,
    )

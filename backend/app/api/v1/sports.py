"""
Sports API endpoints.

Handles sports and sport categories management.
"""

from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.base import get_db
from app.db.models.sport import Sport, SportCategory
from app.db.models.user import User
from app.db.repository import BaseRepository
from app.schemas.sport import (
    SportCreate,
    SportUpdate,
    SportResponse,
    SportCategoryCreate,
    SportCategoryUpdate,
    SportCategoryResponse,
)
from app.schemas.common import BaseResponse, PaginationParams
from app.api.v1.auth import get_admin_user_dependency, get_current_user_dependency

router = APIRouter()


@router.get("/", response_model=List[SportResponse])
async def list_sports(
    pagination: PaginationParams = Depends(),
    search: Optional[str] = Query(None, description="Search term"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    current_user: User = Depends(get_current_user_dependency),
    db: AsyncSession = Depends(get_db)
):
    """
    List sports with pagination and filtering.
    
    Returns paginated list of sports with optional search and filtering.
    """
    sport_repo = BaseRepository(Sport, db)
    
    # Build filters
    filters = {}
    if is_active is not None:
        filters["is_active"] = is_active
    
    # Get sports
    if search:
        sports = await sport_repo.search(
            search,
            ["name", "description"],
            pagination.skip,
            pagination.limit
        )
    else:
        sports = await sport_repo.get_multi(
            pagination.skip,
            pagination.limit,
            filters,
            pagination.sort_by
        )
    
    # Convert to response format
    sport_responses = []
    for sport in sports:
        sport_responses.append(SportResponse(
            id=sport.id,
            name=sport.name,
            slug=sport.slug,
            description=sport.description,
            sport_type=sport.sport_type,
            is_team_sport=sport.is_team_sport,
            is_individual_sport=sport.is_individual_sport,
            is_active=sport.is_active,
            total_categories=sport.total_categories,
            active_categories=sport.active_categories,
            total_capacity=sport.total_capacity,
            current_registrations=sport.current_registrations,
            created_at=sport.created_at,
            updated_at=sport.updated_at,
        ))
    
    return sport_responses


@router.get("/{sport_id}", response_model=SportResponse)
async def get_sport(
    sport_id: UUID,
    current_user: User = Depends(get_current_user_dependency),
    db: AsyncSession = Depends(get_db)
):
    """
    Get sport by ID.
    
    Returns sport information including categories.
    """
    sport_repo = BaseRepository(Sport, db)
    
    # Get sport
    sport = await sport_repo.get(sport_id)
    if not sport:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sport not found"
        )
    
    return SportResponse(
        id=sport.id,
        name=sport.name,
        slug=sport.slug,
        description=sport.description,
        sport_type=sport.sport_type,
        is_team_sport=sport.is_team_sport,
        is_individual_sport=sport.is_individual_sport,
        is_active=sport.is_active,
        total_categories=sport.total_categories,
        active_categories=sport.active_categories,
        total_capacity=sport.total_capacity,
        current_registrations=sport.current_registrations,
        created_at=sport.created_at,
        updated_at=sport.updated_at,
    )


@router.post("/", response_model=SportResponse, status_code=status.HTTP_201_CREATED)
async def create_sport(
    sport_data: SportCreate,
    current_user: User = Depends(get_admin_user_dependency),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new sport.
    
    Creates sport with basic information.
    """
    sport_repo = BaseRepository(Sport, db)
    
    # Check if sport already exists
    existing_sport = await sport_repo.get_by_name(sport_data.name)
    if existing_sport:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Sport with this name already exists"
        )
    
    # Create sport
    sport_dict = sport_data.dict()
    sport = await sport_repo.create(sport_dict)
    
    return SportResponse(
        id=sport.id,
        name=sport.name,
        slug=sport.slug,
        description=sport.description,
        sport_type=sport.sport_type,
        is_team_sport=sport.is_team_sport,
        is_individual_sport=sport.is_individual_sport,
        is_active=sport.is_active,
        total_categories=sport.total_categories,
        active_categories=sport.active_categories,
        total_capacity=sport.total_capacity,
        current_registrations=sport.current_registrations,
        created_at=sport.created_at,
        updated_at=sport.updated_at,
    )


@router.patch("/{sport_id}", response_model=SportResponse)
async def update_sport(
    sport_id: UUID,
    update_data: SportUpdate,
    current_user: User = Depends(get_admin_user_dependency),
    db: AsyncSession = Depends(get_db)
):
    """
    Update sport.
    
    Updates sport information.
    """
    sport_repo = BaseRepository(Sport, db)
    
    # Get sport
    sport = await sport_repo.get(sport_id)
    if not sport:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sport not found"
        )
    
    # Update sport
    update_dict = update_data.dict(exclude_unset=True)
    updated_sport = await sport_repo.update(sport_id, update_dict)
    
    return SportResponse(
        id=updated_sport.id,
        name=updated_sport.name,
        slug=updated_sport.slug,
        description=updated_sport.description,
        sport_type=updated_sport.sport_type,
        is_team_sport=updated_sport.is_team_sport,
        is_individual_sport=updated_sport.is_individual_sport,
        is_active=updated_sport.is_active,
        total_categories=updated_sport.total_categories,
        active_categories=updated_sport.active_categories,
        total_capacity=updated_sport.total_capacity,
        current_registrations=updated_sport.current_registrations,
        created_at=updated_sport.created_at,
        updated_at=updated_sport.updated_at,
    )


@router.delete("/{sport_id}", response_model=BaseResponse)
async def delete_sport(
    sport_id: UUID,
    current_user: User = Depends(get_admin_user_dependency),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete sport.
    
    Soft deletes sport and all associated categories.
    """
    sport_repo = BaseRepository(Sport, db)
    
    # Get sport
    sport = await sport_repo.get(sport_id)
    if not sport:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sport not found"
        )
    
    # Delete sport (soft delete)
    await sport_repo.delete(sport_id)
    
    return BaseResponse(
        success=True,
        message="Sport deleted successfully"
    )


@router.get("/{sport_id}/categories", response_model=List[SportCategoryResponse])
async def list_sport_categories(
    sport_id: UUID,
    pagination: PaginationParams = Depends(),
    search: Optional[str] = Query(None, description="Search term"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    current_user: User = Depends(get_current_user_dependency),
    db: AsyncSession = Depends(get_db)
):
    """
    List sport categories for a specific sport.
    
    Returns paginated list of sport categories.
    """
    category_repo = BaseRepository(SportCategory, db)
    
    # Build filters
    filters = {"sport_id": sport_id}
    if is_active is not None:
        filters["is_active"] = is_active
    
    # Get categories
    if search:
        categories = await category_repo.search(
            search,
            ["name", "description"],
            pagination.skip,
            pagination.limit
        )
    else:
        categories = await category_repo.get_multi(
            pagination.skip,
            pagination.limit,
            filters,
            pagination.sort_by
        )
    
    # Convert to response format
    category_responses = []
    for category in categories:
        category_responses.append(SportCategoryResponse(
            id=category.id,
            sport_id=category.sport_id,
            name=category.name,
            description=category.description,
            age_range=category.age_range,
            age_from=category.age_from,
            age_to=category.age_to,
            gender_allowed=category.gender_allowed,
            max_participants=category.max_participants,
            fee=float(category.fee),
            currency=category.currency,
            requires_medical_certificate=category.requires_medical_certificate,
            requires_guardian_consent=category.requires_guardian_consent,
            requires_equipment=category.requires_equipment,
            equipment_provided=category.equipment_provided,
            is_active=category.is_active,
            current_registrations=category.current_registrations,
            available_spots=category.available_spots,
            is_full=category.is_full,
            registration_percentage=category.registration_percentage,
            created_at=category.created_at,
            updated_at=category.updated_at,
        ))
    
    return category_responses


@router.post("/{sport_id}/categories", response_model=SportCategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_sport_category(
    sport_id: UUID,
    category_data: SportCategoryCreate,
    current_user: User = Depends(get_admin_user_dependency),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new sport category.
    
    Creates sport category with age groups, fees, and requirements.
    """
    category_repo = BaseRepository(SportCategory, db)
    sport_repo = BaseRepository(Sport, db)
    
    # Check if sport exists
    sport = await sport_repo.get(sport_id)
    if not sport:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sport not found"
        )
    
    # Create category
    category_dict = category_data.dict()
    category_dict["sport_id"] = sport_id
    category = await category_repo.create(category_dict)
    
    return SportCategoryResponse(
        id=category.id,
        sport_id=category.sport_id,
        name=category.name,
        description=category.description,
        age_range=category.age_range,
        age_from=category.age_from,
        age_to=category.age_to,
        gender_allowed=category.gender_allowed,
        max_participants=category.max_participants,
        fee=float(category.fee),
        currency=category.currency,
        requires_medical_certificate=category.requires_medical_certificate,
        requires_guardian_consent=category.requires_guardian_consent,
        requires_equipment=category.requires_equipment,
        equipment_provided=category.equipment_provided,
        is_active=category.is_active,
        current_registrations=category.current_registrations,
        available_spots=category.available_spots,
        is_full=category.is_full,
        registration_percentage=category.registration_percentage,
        created_at=category.created_at,
        updated_at=category.updated_at,
    )


@router.get("/categories/{category_id}", response_model=SportCategoryResponse)
async def get_sport_category(
    category_id: UUID,
    current_user: User = Depends(get_current_user_dependency),
    db: AsyncSession = Depends(get_db)
):
    """
    Get sport category by ID.
    
    Returns sport category information.
    """
    category_repo = BaseRepository(SportCategory, db)
    
    # Get category
    category = await category_repo.get(category_id)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sport category not found"
        )
    
    return SportCategoryResponse(
        id=category.id,
        sport_id=category.sport_id,
        name=category.name,
        description=category.description,
        age_range=category.age_range,
        age_from=category.age_from,
        age_to=category.age_to,
        gender_allowed=category.gender_allowed,
        max_participants=category.max_participants,
        fee=float(category.fee),
        currency=category.currency,
        requires_medical_certificate=category.requires_medical_certificate,
        requires_guardian_consent=category.requires_guardian_consent,
        requires_equipment=category.requires_equipment,
        equipment_provided=category.equipment_provided,
        is_active=category.is_active,
        current_registrations=category.current_registrations,
        available_spots=category.available_spots,
        is_full=category.is_full,
        registration_percentage=category.registration_percentage,
        created_at=category.created_at,
        updated_at=category.updated_at,
    )


@router.patch("/categories/{category_id}", response_model=SportCategoryResponse)
async def update_sport_category(
    category_id: UUID,
    update_data: SportCategoryUpdate,
    current_user: User = Depends(get_admin_user_dependency),
    db: AsyncSession = Depends(get_db)
):
    """
    Update sport category.
    
    Updates sport category information.
    """
    category_repo = BaseRepository(SportCategory, db)
    
    # Get category
    category = await category_repo.get(category_id)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sport category not found"
        )
    
    # Update category
    update_dict = update_data.dict(exclude_unset=True)
    updated_category = await category_repo.update(category_id, update_dict)
    
    return SportCategoryResponse(
        id=updated_category.id,
        sport_id=updated_category.sport_id,
        name=updated_category.name,
        description=updated_category.description,
        age_range=updated_category.age_range,
        age_from=updated_category.age_from,
        age_to=updated_category.age_to,
        gender_allowed=updated_category.gender_allowed,
        max_participants=updated_category.max_participants,
        fee=float(updated_category.fee),
        currency=updated_category.currency,
        requires_medical_certificate=updated_category.requires_medical_certificate,
        requires_guardian_consent=updated_category.requires_guardian_consent,
        requires_equipment=updated_category.requires_equipment,
        equipment_provided=updated_category.equipment_provided,
        is_active=updated_category.is_active,
        current_registrations=updated_category.current_registrations,
        available_spots=updated_category.available_spots,
        is_full=updated_category.is_full,
        registration_percentage=updated_category.registration_percentage,
        created_at=updated_category.created_at,
        updated_at=updated_category.updated_at,
    )


@router.delete("/categories/{category_id}", response_model=BaseResponse)
async def delete_sport_category(
    category_id: UUID,
    current_user: User = Depends(get_admin_user_dependency),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete sport category.
    
    Soft deletes sport category.
    """
    category_repo = BaseRepository(SportCategory, db)
    
    # Get category
    category = await category_repo.get(category_id)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sport category not found"
        )
    
    # Delete category (soft delete)
    await category_repo.delete(category_id)
    
    return BaseResponse(
        success=True,
        message="Sport category deleted successfully"
    )

"""
Sport schemas for API responses.
"""

from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from app.models.sport import GenderAllowed

class SportBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None

class SportCreate(SportBase):
    pass

class SportResponse(SportBase):
    id: str
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class SportCategoryBase(BaseModel):
    name: str
    age_from: int
    age_to: int
    gender_allowed: GenderAllowed
    fee: Decimal
    max_participants: Optional[int] = None

class SportCategoryCreate(SportCategoryBase):
    sport_id: str

class SportCategoryResponse(SportCategoryBase):
    id: str
    sport_id: str
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class SportWithCategories(SportResponse):
    categories: List[SportCategoryResponse] = []
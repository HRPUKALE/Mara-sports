"""
Institution schemas for API responses.
"""

from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class InstitutionBase(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    address: Optional[Dict[str, Any]] = None
    institution_type: Optional[str] = None
    registration_number: Optional[str] = None
    website: Optional[str] = None
    description: Optional[str] = None
    contact_person_name: Optional[str] = None
    contact_person_phone: Optional[str] = None
    contact_person_email: Optional[str] = None
    logo_url: Optional[str] = None

class InstitutionCreate(InstitutionBase):
    user_id: str

class InstitutionResponse(InstitutionBase):
    id: str
    user_id: str
    verified: bool
    verification_date: Optional[str]
    verification_notes: Optional[str]
    billing_info: Optional[Dict[str, Any]]
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
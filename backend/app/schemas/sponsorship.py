"""
Sponsorship schemas for request/response validation.

Handles sponsorship applications and management data serialization.
"""

from decimal import Decimal
from enum import Enum
from typing import Optional, Dict, Any
from uuid import UUID

from pydantic import BaseModel, Field, validator

from app.schemas.common import BaseResponse


class SponsorshipStatus(str, Enum):
    """Sponsorship status enumeration."""
    APPLIED = "applied"
    UNDER_REVIEW = "under_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    CANCELLED = "cancelled"
    EXPIRED = "expired"


class SponsorshipCreate(BaseModel):
    """Sponsorship creation schema."""
    
    institution_id: UUID = Field(description="Institution ID")
    sponsor_name: str = Field(description="Sponsor name", min_length=1, max_length=255)
    sponsor_contact_person: Optional[str] = Field(default=None, description="Sponsor contact person", max_length=255)
    sponsor_email: Optional[str] = Field(default=None, description="Sponsor email", max_length=255)
    sponsor_phone: Optional[str] = Field(default=None, description="Sponsor phone", max_length=20)
    requested_amount: Decimal = Field(description="Requested amount", gt=0)
    currency: str = Field(default="INR", description="Currency", max_length=10)
    sponsorship_type: Optional[str] = Field(default=None, description="Sponsorship type", max_length=100)
    description: Optional[str] = Field(default=None, description="Sponsorship description")
    terms_and_conditions: Optional[Dict[str, Any]] = Field(default=None, description="Terms and conditions")
    start_date: Optional[str] = Field(default=None, description="Start date")
    end_date: Optional[str] = Field(default=None, description="End date")
    is_renewable: bool = Field(default=False, description="Is renewable")
    documents: Optional[Dict[str, Any]] = Field(default=None, description="Sponsorship documents")
    metadata: Optional[Dict[str, Any]] = Field(default=None, description="Additional metadata")
    
    @validator('requested_amount')
    def validate_amount(cls, v):
        """Validate requested amount."""
        if v <= 0:
            raise ValueError('Requested amount must be greater than 0')
        return v
    
    @validator('sponsor_email')
    def validate_email(cls, v):
        """Validate sponsor email."""
        if v is not None and '@' not in v:
            raise ValueError('Invalid email format')
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "institution_id": "123e4567-e89b-12d3-a456-426614174000",
                "sponsor_name": "ABC Sports Company",
                "sponsor_contact_person": "John Smith",
                "sponsor_email": "john@abcsports.com",
                "sponsor_phone": "+1234567890",
                "requested_amount": 50000.00,
                "currency": "INR",
                "sponsorship_type": "equipment",
                "description": "Equipment sponsorship for football team",
                "terms_and_conditions": {
                    "duration": "1 year",
                    "visibility": "Logo on jerseys",
                    "benefits": "Equipment and training support"
                },
                "start_date": "2024-01-01",
                "end_date": "2024-12-31",
                "is_renewable": True,
                "documents": {
                    "proposal": "https://example.com/proposal.pdf",
                    "company_profile": "https://example.com/profile.pdf"
                }
            }
        }


class SponsorshipUpdate(BaseModel):
    """Sponsorship update schema."""
    
    sponsor_name: Optional[str] = Field(default=None, description="Sponsor name", min_length=1, max_length=255)
    sponsor_contact_person: Optional[str] = Field(default=None, description="Sponsor contact person", max_length=255)
    sponsor_email: Optional[str] = Field(default=None, description="Sponsor email", max_length=255)
    sponsor_phone: Optional[str] = Field(default=None, description="Sponsor phone", max_length=20)
    requested_amount: Optional[Decimal] = Field(default=None, description="Requested amount", gt=0)
    currency: Optional[str] = Field(default=None, description="Currency", max_length=10)
    sponsorship_type: Optional[str] = Field(default=None, description="Sponsorship type", max_length=100)
    description: Optional[str] = Field(default=None, description="Sponsorship description")
    terms_and_conditions: Optional[Dict[str, Any]] = Field(default=None, description="Terms and conditions")
    start_date: Optional[str] = Field(default=None, description="Start date")
    end_date: Optional[str] = Field(default=None, description="End date")
    is_renewable: Optional[bool] = Field(default=None, description="Is renewable")
    documents: Optional[Dict[str, Any]] = Field(default=None, description="Sponsorship documents")
    metadata: Optional[Dict[str, Any]] = Field(default=None, description="Additional metadata")
    
    @validator('requested_amount')
    def validate_amount(cls, v):
        """Validate requested amount."""
        if v is not None and v <= 0:
            raise ValueError('Requested amount must be greater than 0')
        return v
    
    @validator('sponsor_email')
    def validate_email(cls, v):
        """Validate sponsor email."""
        if v is not None and '@' not in v:
            raise ValueError('Invalid email format')
        return v


class SponsorshipResponse(BaseModel):
    """Sponsorship response schema."""
    
    id: UUID = Field(description="Sponsorship ID")
    institution_id: UUID = Field(description="Institution ID")
    sponsor_name: str = Field(description="Sponsor name")
    sponsor_contact_person: Optional[str] = Field(default=None, description="Sponsor contact person")
    sponsor_email: Optional[str] = Field(default=None, description="Sponsor email")
    sponsor_phone: Optional[str] = Field(default=None, description="Sponsor phone")
    requested_amount: float = Field(description="Requested amount")
    approved_amount: Optional[float] = Field(default=None, description="Approved amount")
    currency: str = Field(description="Currency")
    sponsorship_type: Optional[str] = Field(default=None, description="Sponsorship type")
    description: Optional[str] = Field(default=None, description="Sponsorship description")
    terms_and_conditions: Optional[Dict[str, Any]] = Field(default=None, description="Terms and conditions")
    status: SponsorshipStatus = Field(description="Sponsorship status")
    reviewed_by: Optional[str] = Field(default=None, description="Reviewed by")
    review_notes: Optional[str] = Field(default=None, description="Review notes")
    rejection_reason: Optional[str] = Field(default=None, description="Rejection reason")
    start_date: Optional[str] = Field(default=None, description="Start date")
    end_date: Optional[str] = Field(default=None, description="End date")
    is_renewable: bool = Field(description="Is renewable")
    documents: Optional[Dict[str, Any]] = Field(default=None, description="Sponsorship documents")
    metadata: Optional[Dict[str, Any]] = Field(default=None, description="Additional metadata")
    is_active: bool = Field(description="Is active")
    final_amount: float = Field(description="Final amount")
    approval_percentage: float = Field(description="Approval percentage")
    created_at: str = Field(description="Creation timestamp")
    updated_at: str = Field(description="Last update timestamp")
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "123e4567-e89b-12d3-a456-426614174000",
                "institution_id": "123e4567-e89b-12d3-a456-426614174001",
                "sponsor_name": "ABC Sports Company",
                "sponsor_contact_person": "John Smith",
                "sponsor_email": "john@abcsports.com",
                "sponsor_phone": "+1234567890",
                "requested_amount": 50000.0,
                "approved_amount": 45000.0,
                "currency": "INR",
                "sponsorship_type": "equipment",
                "description": "Equipment sponsorship for football team",
                "terms_and_conditions": {
                    "duration": "1 year",
                    "visibility": "Logo on jerseys"
                },
                "status": "approved",
                "reviewed_by": "admin@example.com",
                "review_notes": "Approved with minor adjustments",
                "rejection_reason": None,
                "start_date": "2024-01-01",
                "end_date": "2024-12-31",
                "is_renewable": True,
                "documents": {
                    "proposal": "https://example.com/proposal.pdf"
                },
                "is_active": True,
                "final_amount": 45000.0,
                "approval_percentage": 90.0,
                "created_at": "2024-01-01T00:00:00Z",
                "updated_at": "2024-01-01T00:00:00Z"
            }
        }

"""
Registration schemas for request/response validation.

Handles student sport registrations data serialization.
"""

from datetime import datetime
from enum import Enum
from typing import Optional, Dict, Any
from uuid import UUID

from pydantic import BaseModel, Field, validator

from app.schemas.common import BaseResponse


class RegistrationStatus(str, Enum):
    """Registration status enumeration."""
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    PAID = "paid"
    REJECTED = "rejected"


class RegistrationCreate(BaseModel):
    """Registration creation schema."""
    
    student_id: UUID = Field(description="Student ID")
    sport_category_id: UUID = Field(description="Sport category ID")
    registration_data: Optional[Dict[str, Any]] = Field(default=None, description="Registration data")
    documents: Optional[Dict[str, Any]] = Field(default=None, description="Registration documents")
    notes: Optional[str] = Field(default=None, description="Additional notes")
    
    class Config:
        json_schema_extra = {
            "example": {
                "student_id": "123e4567-e89b-12d3-a456-426614174000",
                "sport_category_id": "123e4567-e89b-12d3-a456-426614174001",
                "registration_data": {
                    "emergency_contact": {
                        "name": "Jane Doe",
                        "phone": "+1234567891",
                        "relation": "Mother"
                    },
                    "medical_conditions": "None",
                    "allergies": "None"
                },
                "documents": {
                    "medical_certificate": "https://example.com/medical.pdf",
                    "id_proof": "https://example.com/id.pdf"
                },
                "notes": "Student is left-handed"
            }
        }


class RegistrationUpdate(BaseModel):
    """Registration update schema."""
    
    status: Optional[RegistrationStatus] = Field(default=None, description="Registration status")
    registration_data: Optional[Dict[str, Any]] = Field(default=None, description="Registration data")
    documents: Optional[Dict[str, Any]] = Field(default=None, description="Registration documents")
    notes: Optional[str] = Field(default=None, description="Additional notes")
    
    class Config:
        json_schema_extra = {
            "example": {
                "status": "confirmed",
                "notes": "Registration confirmed after verification"
            }
        }


class RegistrationResponse(BaseModel):
    """Registration response schema."""
    
    id: UUID = Field(description="Registration ID")
    student_id: UUID = Field(description="Student ID")
    sport_category_id: UUID = Field(description="Sport category ID")
    status: RegistrationStatus = Field(description="Registration status")
    payment_id: Optional[UUID] = Field(default=None, description="Payment ID")
    registration_data: Optional[Dict[str, Any]] = Field(default=None, description="Registration data")
    documents: Optional[Dict[str, Any]] = Field(default=None, description="Registration documents")
    notes: Optional[str] = Field(default=None, description="Additional notes")
    registered_at: str = Field(description="Registration timestamp")
    confirmed_at: Optional[str] = Field(default=None, description="Confirmation timestamp")
    cancelled_at: Optional[str] = Field(default=None, description="Cancellation timestamp")
    is_active: bool = Field(description="Is active")
    can_be_cancelled: bool = Field(description="Can be cancelled")
    requires_payment: bool = Field(description="Requires payment")
    payment_status: str = Field(description="Payment status")
    total_fee: float = Field(description="Total registration fee")
    created_at: str = Field(description="Creation timestamp")
    updated_at: str = Field(description="Last update timestamp")
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "123e4567-e89b-12d3-a456-426614174000",
                "student_id": "123e4567-e89b-12d3-a456-426614174001",
                "sport_category_id": "123e4567-e89b-12d3-a456-426614174002",
                "status": "confirmed",
                "payment_id": "123e4567-e89b-12d3-a456-426614174003",
                "registration_data": {
                    "emergency_contact": {
                        "name": "Jane Doe",
                        "phone": "+1234567891",
                        "relation": "Mother"
                    }
                },
                "documents": {
                    "medical_certificate": "https://example.com/medical.pdf"
                },
                "notes": "Student is left-handed",
                "registered_at": "2024-01-01T00:00:00Z",
                "confirmed_at": "2024-01-01T01:00:00Z",
                "cancelled_at": None,
                "is_active": True,
                "can_be_cancelled": True,
                "requires_payment": True,
                "payment_status": "success",
                "total_fee": 1000.0,
                "created_at": "2024-01-01T00:00:00Z",
                "updated_at": "2024-01-01T01:00:00Z"
            }
        }

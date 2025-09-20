"""
Payment schemas for request/response validation.

Handles payment processing and management data serialization.
"""

from decimal import Decimal
from enum import Enum
from typing import Optional, Dict, Any
from uuid import UUID

from pydantic import BaseModel, Field, validator

from app.schemas.common import BaseResponse


class PaymentStatus(str, Enum):
    """Payment status enumeration."""
    INITIATED = "initiated"
    PENDING = "pending"
    SUCCESS = "success"
    FAILED = "failed"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"
    PARTIALLY_REFUNDED = "partially_refunded"


class PaymentProvider(str, Enum):
    """Payment provider enumeration."""
    LOCAL = "local"
    RAZORPAY = "razorpay"
    STRIPE = "stripe"


class PaymentCreate(BaseModel):
    """Payment creation schema."""
    
    registration_id: Optional[UUID] = Field(default=None, description="Registration ID")
    institution_id: Optional[UUID] = Field(default=None, description="Institution ID")
    amount: Decimal = Field(description="Payment amount", gt=0)
    currency: str = Field(default="INR", description="Currency", max_length=10)
    provider: PaymentProvider = Field(default=PaymentProvider.LOCAL, description="Payment provider")
    payment_method: Optional[str] = Field(default=None, description="Payment method", max_length=50)
    payment_gateway: Optional[str] = Field(default=None, description="Payment gateway", max_length=50)
    description: Optional[str] = Field(default=None, description="Payment description")
    notes: Optional[str] = Field(default=None, description="Additional notes")
    
    @validator('amount')
    def validate_amount(cls, v):
        """Validate payment amount."""
        if v <= 0:
            raise ValueError('Payment amount must be greater than 0')
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "registration_id": "123e4567-e89b-12d3-a456-426614174000",
                "amount": 1000.00,
                "currency": "INR",
                "provider": "razorpay",
                "payment_method": "card",
                "payment_gateway": "razorpay",
                "description": "Sports registration fee",
                "notes": "Payment for football registration"
            }
        }


class PaymentResponse(BaseModel):
    """Payment response schema."""
    
    id: UUID = Field(description="Payment ID")
    registration_id: Optional[UUID] = Field(default=None, description="Registration ID")
    institution_id: Optional[UUID] = Field(default=None, description="Institution ID")
    amount: float = Field(description="Payment amount")
    currency: str = Field(description="Currency")
    status: PaymentStatus = Field(description="Payment status")
    provider: PaymentProvider = Field(description="Payment provider")
    provider_payment_id: Optional[str] = Field(default=None, description="Provider payment ID")
    provider_order_id: Optional[str] = Field(default=None, description="Provider order ID")
    payment_method: Optional[str] = Field(default=None, description="Payment method")
    payment_gateway: Optional[str] = Field(default=None, description="Payment gateway")
    description: Optional[str] = Field(default=None, description="Payment description")
    notes: Optional[str] = Field(default=None, description="Additional notes")
    refund_amount: Optional[float] = Field(default=None, description="Refund amount")
    refund_reason: Optional[str] = Field(default=None, description="Refund reason")
    refund_id: Optional[str] = Field(default=None, description="Refund ID")
    webhook_received: bool = Field(description="Webhook received")
    webhook_processed: bool = Field(description="Webhook processed")
    created_at: str = Field(description="Creation timestamp")
    updated_at: str = Field(description="Last update timestamp")
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "123e4567-e89b-12d3-a456-426614174000",
                "registration_id": "123e4567-e89b-12d3-a456-426614174001",
                "amount": 1000.0,
                "currency": "INR",
                "status": "success",
                "provider": "razorpay",
                "provider_payment_id": "pay_1234567890",
                "provider_order_id": "order_1234567890",
                "payment_method": "card",
                "payment_gateway": "razorpay",
                "description": "Sports registration fee",
                "notes": "Payment for football registration",
                "refund_amount": None,
                "refund_reason": None,
                "refund_id": None,
                "webhook_received": True,
                "webhook_processed": True,
                "created_at": "2024-01-01T00:00:00Z",
                "updated_at": "2024-01-01T00:00:00Z"
            }
        }


class PaymentWebhook(BaseModel):
    """Payment webhook schema."""
    
    event: str = Field(description="Webhook event type")
    data: Dict[str, Any] = Field(description="Webhook data")
    signature: Optional[str] = Field(default=None, description="Webhook signature")
    timestamp: Optional[str] = Field(default=None, description="Webhook timestamp")
    
    class Config:
        json_schema_extra = {
            "example": {
                "event": "payment.success",
                "data": {
                    "payment_id": "pay_1234567890",
                    "order_id": "order_1234567890",
                    "amount": 1000,
                    "currency": "INR",
                    "status": "success"
                },
                "signature": "webhook_signature_here",
                "timestamp": "2024-01-01T00:00:00Z"
            }
        }

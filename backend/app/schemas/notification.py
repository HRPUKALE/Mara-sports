"""
Notification schemas for request/response validation.

Handles notification management and data serialization.
"""

from enum import Enum
from typing import Optional, Dict, Any, List
from uuid import UUID

from pydantic import BaseModel, Field, validator

from app.schemas.common import BaseResponse


class NotificationType(str, Enum):
    """Notification type enumeration."""
    SPORT_ENROLLMENT = "sport_enrollment"
    PAYMENT = "payment"
    SPONSORSHIP = "sponsorship"
    SYSTEM = "system"
    REGISTRATION = "registration"
    VERIFICATION = "verification"
    REMINDER = "reminder"
    ANNOUNCEMENT = "announcement"


class NotificationStatus(str, Enum):
    """Notification status enumeration."""
    PENDING = "pending"
    SENT = "sent"
    DELIVERED = "delivered"
    FAILED = "failed"
    READ = "read"


class NotificationPriority(str, Enum):
    """Notification priority enumeration."""
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"


class NotificationCreate(BaseModel):
    """Notification creation schema."""
    
    user_id: UUID = Field(description="User ID")
    title: str = Field(description="Notification title", min_length=1, max_length=255)
    message: str = Field(description="Notification message", min_length=1)
    notification_type: NotificationType = Field(description="Notification type")
    priority: NotificationPriority = Field(default=NotificationPriority.NORMAL, description="Notification priority")
    data: Optional[Dict[str, Any]] = Field(default=None, description="Notification data")
    metadata: Optional[Dict[str, Any]] = Field(default=None, description="Additional metadata")
    expires_at: Optional[str] = Field(default=None, description="Expiration timestamp")
    
    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "123e4567-e89b-12d3-a456-426614174000",
                "title": "Registration Confirmed",
                "message": "Your football registration has been confirmed successfully.",
                "notification_type": "registration",
                "priority": "normal",
                "data": {
                    "registration_id": "123e4567-e89b-12d3-a456-426614174001",
                    "sport": "Football",
                    "category": "Under 18"
                },
                "metadata": {
                    "action_url": "/registrations/123e4567-e89b-12d3-a456-426614174001",
                    "icon": "check-circle"
                },
                "expires_at": "2024-12-31T23:59:59Z"
            }
        }


class NotificationResponse(BaseModel):
    """Notification response schema."""
    
    id: UUID = Field(description="Notification ID")
    user_id: UUID = Field(description="User ID")
    title: str = Field(description="Notification title")
    message: str = Field(description="Notification message")
    notification_type: NotificationType = Field(description="Notification type")
    priority: NotificationPriority = Field(description="Notification priority")
    status: NotificationStatus = Field(description="Notification status")
    is_read: bool = Field(description="Is read")
    sent_at: Optional[str] = Field(default=None, description="Sent timestamp")
    delivered_at: Optional[str] = Field(default=None, description="Delivered timestamp")
    read_at: Optional[str] = Field(default=None, description="Read timestamp")
    email_sent: bool = Field(description="Email sent")
    sms_sent: bool = Field(description="SMS sent")
    push_sent: bool = Field(description="Push sent")
    data: Optional[Dict[str, Any]] = Field(default=None, description="Notification data")
    metadata: Optional[Dict[str, Any]] = Field(default=None, description="Additional metadata")
    error_message: Optional[str] = Field(default=None, description="Error message")
    retry_count: int = Field(description="Retry count")
    expires_at: Optional[str] = Field(default=None, description="Expiration timestamp")
    is_pending: bool = Field(description="Is pending")
    is_sent: bool = Field(description="Is sent")
    is_delivered: bool = Field(description="Is delivered")
    is_failed: bool = Field(description="Is failed")
    is_unread: bool = Field(description="Is unread")
    is_high_priority: bool = Field(description="Is high priority")
    is_urgent: bool = Field(description="Is urgent")
    can_be_retried: bool = Field(description="Can be retried")
    is_expired: bool = Field(description="Is expired")
    created_at: str = Field(description="Creation timestamp")
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "123e4567-e89b-12d3-a456-426614174000",
                "user_id": "123e4567-e89b-12d3-a456-426614174001",
                "title": "Registration Confirmed",
                "message": "Your football registration has been confirmed successfully.",
                "notification_type": "registration",
                "priority": "normal",
                "status": "delivered",
                "is_read": False,
                "sent_at": "2024-01-01T00:00:00Z",
                "delivered_at": "2024-01-01T00:00:01Z",
                "read_at": None,
                "email_sent": True,
                "sms_sent": False,
                "push_sent": True,
                "data": {
                    "registration_id": "123e4567-e89b-12d3-a456-426614174002",
                    "sport": "Football",
                    "category": "Under 18"
                },
                "metadata": {
                    "action_url": "/registrations/123e4567-e89b-12d3-a456-426614174002",
                    "icon": "check-circle"
                },
                "error_message": None,
                "retry_count": 0,
                "expires_at": "2024-12-31T23:59:59Z",
                "is_pending": False,
                "is_sent": True,
                "is_delivered": True,
                "is_failed": False,
                "is_unread": True,
                "is_high_priority": False,
                "is_urgent": False,
                "can_be_retried": False,
                "is_expired": False,
                "created_at": "2024-01-01T00:00:00Z"
            }
        }

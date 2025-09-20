"""
Notification model for user notifications and messaging.

Supports different notification types, delivery methods, and
real-time notification management.
"""

from enum import Enum
from typing import Optional
from uuid import UUID

from sqlalchemy import String, Text, ForeignKey, JSON, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.db.base import Base


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


class Notification(Base):
    """Notification model for user notifications and messaging."""
    
    __tablename__ = "notifications"
    
    # User relationship
    user_id: Mapped[UUID] = mapped_column(
        PostgresUUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    # Notification content
    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )
    message: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )
    
    # Notification type and priority
    notification_type: Mapped[NotificationType] = mapped_column(
        String(50),
        nullable=False,
        index=True
    )
    priority: Mapped[NotificationPriority] = mapped_column(
        String(20),
        default=NotificationPriority.NORMAL,
        nullable=False
    )
    
    # Status and delivery
    status: Mapped[NotificationStatus] = mapped_column(
        String(20),
        default=NotificationStatus.PENDING,
        nullable=False,
        index=True
    )
    is_read: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
        index=True
    )
    
    # Delivery information
    sent_at: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True
    )
    delivered_at: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True
    )
    read_at: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True
    )
    
    # Delivery methods
    email_sent: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False
    )
    sms_sent: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False
    )
    push_sent: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False
    )
    
    # Additional data and metadata
    data: Mapped[Optional[dict]] = mapped_column(
        JSON,
        nullable=True
    )
    metadata: Mapped[Optional[dict]] = mapped_column(
        JSON,
        nullable=True
    )
    
    # Error handling
    error_message: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
    )
    retry_count: Mapped[int] = mapped_column(
        default=0,
        nullable=False
    )
    
    # Expiration
    expires_at: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True
    )
    
    # Relationships
    user = relationship("User", back_populates="notifications")
    
    def __repr__(self) -> str:
        return f"<Notification(id={self.id}, user_id={self.user_id}, type={self.notification_type}, status={self.status})>"
    
    @property
    def is_pending(self) -> bool:
        """Check if notification is pending."""
        return self.status == NotificationStatus.PENDING
    
    @property
    def is_sent(self) -> bool:
        """Check if notification is sent."""
        return self.status == NotificationStatus.SENT
    
    @property
    def is_delivered(self) -> bool:
        """Check if notification is delivered."""
        return self.status == NotificationStatus.DELIVERED
    
    @property
    def is_failed(self) -> bool:
        """Check if notification failed."""
        return self.status == NotificationStatus.FAILED
    
    @property
    def is_read(self) -> bool:
        """Check if notification is read."""
        return self.is_read
    
    @property
    def is_unread(self) -> bool:
        """Check if notification is unread."""
        return not self.is_read
    
    @property
    def is_high_priority(self) -> bool:
        """Check if notification is high priority."""
        return self.priority in [NotificationPriority.HIGH, NotificationPriority.URGENT]
    
    @property
    def is_urgent(self) -> bool:
        """Check if notification is urgent."""
        return self.priority == NotificationPriority.URGENT
    
    @property
    def can_be_retried(self) -> bool:
        """Check if notification can be retried."""
        return (
            self.status == NotificationStatus.FAILED and
            self.retry_count < 3  # Max 3 retries
        )
    
    @property
    def is_expired(self) -> bool:
        """Check if notification is expired."""
        if not self.expires_at:
            return False
        # TODO: Implement proper date comparison
        return False
    
    def get_data(self, key: str, default=None):
        """Get specific data from data JSON."""
        if not self.data:
            return default
        return self.data.get(key, default)
    
    def set_data(self, key: str, value):
        """Set specific data in data JSON."""
        if not self.data:
            self.data = {}
        self.data[key] = value
    
    def get_metadata(self, key: str, default=None):
        """Get specific metadata from metadata JSON."""
        if not self.metadata:
            return default
        return self.metadata.get(key, default)
    
    def set_metadata(self, key: str, value):
        """Set specific metadata in metadata JSON."""
        if not self.metadata:
            self.metadata = {}
        self.metadata[key] = value
    
    def mark_sent(self, delivery_method: str = None):
        """Mark notification as sent."""
        self.status = NotificationStatus.SENT
        if delivery_method == "email":
            self.email_sent = True
        elif delivery_method == "sms":
            self.sms_sent = True
        elif delivery_method == "push":
            self.push_sent = True
    
    def mark_delivered(self):
        """Mark notification as delivered."""
        self.status = NotificationStatus.DELIVERED
    
    def mark_failed(self, error_message: str = None):
        """Mark notification as failed."""
        self.status = NotificationStatus.FAILED
        if error_message:
            self.error_message = error_message
        self.retry_count += 1
    
    def mark_read(self):
        """Mark notification as read."""
        self.is_read = True
        self.status = NotificationStatus.READ
    
    def mark_unread(self):
        """Mark notification as unread."""
        self.is_read = False
        if self.status == NotificationStatus.READ:
            self.status = NotificationStatus.DELIVERED
    
    def increment_retry(self):
        """Increment retry count."""
        self.retry_count += 1
    
    def reset_retry(self):
        """Reset retry count."""
        self.retry_count = 0
    
    def get_notification_summary(self) -> dict:
        """Get notification summary for display."""
        return {
            "id": str(self.id),
            "user_id": str(self.user_id),
            "title": self.title,
            "message": self.message,
            "type": self.notification_type,
            "priority": self.priority,
            "status": self.status,
            "is_read": self.is_read,
            "created_at": self.created_at.isoformat(),
            "sent_at": self.sent_at,
            "delivered_at": self.delivered_at,
            "read_at": self.read_at,
            "is_high_priority": self.is_high_priority,
            "retry_count": self.retry_count,
        }

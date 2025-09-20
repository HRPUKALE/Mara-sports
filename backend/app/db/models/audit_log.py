"""
Audit log model for tracking system activities and changes.

Provides comprehensive audit trail for all user actions and system events
for compliance and security monitoring.
"""

from datetime import datetime
from enum import Enum
from typing import Optional
from uuid import UUID

from sqlalchemy import String, Text, ForeignKey, JSON, DateTime
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.db.base import Base


class AuditAction(str, Enum):
    """Audit action enumeration."""
    CREATE = "create"
    READ = "read"
    UPDATE = "update"
    DELETE = "delete"
    LOGIN = "login"
    LOGOUT = "logout"
    REGISTER = "register"
    VERIFY = "verify"
    APPROVE = "approve"
    REJECT = "reject"
    CANCEL = "cancel"
    EXPORT = "export"
    IMPORT = "import"
    UPLOAD = "upload"
    DOWNLOAD = "download"
    PAYMENT = "payment"
    REFUND = "refund"
    NOTIFICATION = "notification"
    SYSTEM = "system"


class AuditResourceType(str, Enum):
    """Audit resource type enumeration."""
    USER = "user"
    STUDENT = "student"
    INSTITUTION = "institution"
    SPORT = "sport"
    SPORT_CATEGORY = "sport_category"
    REGISTRATION = "registration"
    PAYMENT = "payment"
    SPONSORSHIP = "sponsorship"
    DOCUMENT = "document"
    NOTIFICATION = "notification"
    OTP = "otp"
    SYSTEM = "system"


class AuditLog(Base):
    """Audit log model for tracking system activities and changes."""
    
    __tablename__ = "audit_logs"
    
    # Actor information
    actor_user_id: Mapped[Optional[UUID]] = mapped_column(
        PostgresUUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    actor_email: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        index=True
    )
    actor_ip_address: Mapped[Optional[str]] = mapped_column(
        String(45),
        nullable=True
    )
    actor_user_agent: Mapped[Optional[str]] = mapped_column(
        String(500),
        nullable=True
    )
    
    # Action information
    action: Mapped[AuditAction] = mapped_column(
        String(50),
        nullable=False,
        index=True
    )
    resource_type: Mapped[AuditResourceType] = mapped_column(
        String(50),
        nullable=False,
        index=True
    )
    resource_id: Mapped[Optional[UUID]] = mapped_column(
        PostgresUUID(as_uuid=True),
        nullable=True,
        index=True
    )
    
    # Action details
    description: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )
    details: Mapped[Optional[dict]] = mapped_column(
        JSON,
        nullable=True
    )
    
    # Request information
    request_id: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        index=True
    )
    endpoint: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True
    )
    method: Mapped[Optional[str]] = mapped_column(
        String(10),
        nullable=True
    )
    
    # Result information
    success: Mapped[bool] = mapped_column(
        default=True,
        nullable=False,
        index=True
    )
    error_message: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
    )
    status_code: Mapped[Optional[int]] = mapped_column(
        nullable=True
    )
    
    # Additional metadata
    metadata: Mapped[Optional[dict]] = mapped_column(
        JSON,
        nullable=True
    )
    
    # Timestamps
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=func.now(),
        nullable=False,
        index=True
    )
    
    # Relationships
    actor_user = relationship("User", foreign_keys=[actor_user_id])
    
    def __repr__(self) -> str:
        return f"<AuditLog(id={self.id}, action={self.action}, resource_type={self.resource_type}, actor={self.actor_email})>"
    
    @property
    def is_successful(self) -> bool:
        """Check if action was successful."""
        return self.success
    
    @property
    def is_failed(self) -> bool:
        """Check if action failed."""
        return not self.success
    
    @property
    def has_error(self) -> bool:
        """Check if action has error message."""
        return self.error_message is not None
    
    @property
    def is_system_action(self) -> bool:
        """Check if action is a system action."""
        return self.action == AuditAction.SYSTEM or self.resource_type == AuditResourceType.SYSTEM
    
    @property
    def is_user_action(self) -> bool:
        """Check if action is a user action."""
        return self.actor_user_id is not None
    
    @property
    def is_anonymous_action(self) -> bool:
        """Check if action is anonymous."""
        return self.actor_user_id is None
    
    def get_details(self, key: str, default=None):
        """Get specific detail from details JSON."""
        if not self.details:
            return default
        return self.details.get(key, default)
    
    def set_details(self, key: str, value):
        """Set specific detail in details JSON."""
        if not self.details:
            self.details = {}
        self.details[key] = value
    
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
    
    def mark_success(self, status_code: int = None):
        """Mark action as successful."""
        self.success = True
        if status_code:
            self.status_code = status_code
    
    def mark_failure(self, error_message: str, status_code: int = None):
        """Mark action as failed."""
        self.success = False
        self.error_message = error_message
        if status_code:
            self.status_code = status_code
    
    def add_detail(self, key: str, value):
        """Add detail to the audit log."""
        if not self.details:
            self.details = {}
        self.details[key] = value
    
    def add_metadata(self, key: str, value):
        """Add metadata to the audit log."""
        if not self.metadata:
            self.metadata = {}
        self.metadata[key] = value
    
    def get_audit_summary(self) -> dict:
        """Get audit log summary for display."""
        return {
            "id": str(self.id),
            "action": self.action,
            "resource_type": self.resource_type,
            "resource_id": str(self.resource_id) if self.resource_id else None,
            "description": self.description,
            "actor_user_id": str(self.actor_user_id) if self.actor_user_id else None,
            "actor_email": self.actor_email,
            "actor_ip_address": self.actor_ip_address,
            "success": self.success,
            "error_message": self.error_message,
            "status_code": self.status_code,
            "endpoint": self.endpoint,
            "method": self.method,
            "request_id": self.request_id,
            "timestamp": self.timestamp.isoformat(),
            "is_system_action": self.is_system_action,
            "is_user_action": self.is_user_action,
            "is_anonymous_action": self.is_anonymous_action,
        }
    
    @classmethod
    def create_audit_log(
        cls,
        action: AuditAction,
        resource_type: AuditResourceType,
        description: str,
        actor_user_id: Optional[UUID] = None,
        actor_email: Optional[str] = None,
        resource_id: Optional[UUID] = None,
        details: Optional[dict] = None,
        metadata: Optional[dict] = None,
        request_id: Optional[str] = None,
        endpoint: Optional[str] = None,
        method: Optional[str] = None,
        actor_ip_address: Optional[str] = None,
        actor_user_agent: Optional[str] = None,
        success: bool = True,
        error_message: Optional[str] = None,
        status_code: Optional[int] = None
    ) -> "AuditLog":
        """Create a new audit log entry."""
        return cls(
            actor_user_id=actor_user_id,
            actor_email=actor_email,
            actor_ip_address=actor_ip_address,
            actor_user_agent=actor_user_agent,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            description=description,
            details=details,
            metadata=metadata,
            request_id=request_id,
            endpoint=endpoint,
            method=method,
            success=success,
            error_message=error_message,
            status_code=status_code
        )

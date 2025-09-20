"""
Registration model for student sport registrations.

Contains registration status, payment information, and relationships
to students, sport categories, and payments.
"""

from datetime import datetime
from enum import Enum
from typing import Optional
from uuid import UUID

from sqlalchemy import DateTime, ForeignKey, String, Text, JSON, Boolean
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, SoftDeleteMixin


class RegistrationStatus(str, Enum):
    """Registration status enumeration."""
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    PAID = "paid"
    REJECTED = "rejected"


class Registration(Base, SoftDeleteMixin):
    """Registration model for student sport registrations."""
    
    __tablename__ = "registrations"
    
    # Student relationship
    student_id: Mapped[UUID] = mapped_column(
        PostgresUUID(as_uuid=True),
        ForeignKey("students.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    # Sport category relationship
    sport_category_id: Mapped[UUID] = mapped_column(
        PostgresUUID(as_uuid=True),
        ForeignKey("sport_categories.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    # Registration details
    status: Mapped[RegistrationStatus] = mapped_column(
        String(20),
        default=RegistrationStatus.PENDING,
        nullable=False,
        index=True
    )
    
    # Payment relationship
    payment_id: Mapped[Optional[UUID]] = mapped_column(
        PostgresUUID(as_uuid=True),
        ForeignKey("payments.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    
    # Registration data (stored as JSON)
    registration_data: Mapped[Optional[dict]] = mapped_column(
        JSON,
        nullable=True
    )
    
    # Documents (stored as JSON)
    documents: Mapped[Optional[dict]] = mapped_column(
        JSON,
        nullable=True
    )
    
    # Additional information
    notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
    )
    
    # Timestamps
    registered_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        nullable=False
    )
    confirmed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )
    cancelled_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )
    
    # Relationships
    student = relationship("Student", back_populates="registrations")
    sport_category = relationship("SportCategory", back_populates="registrations")
    payment = relationship("Payment", back_populates="registration")
    documents_rel = relationship(
        "Document",
        back_populates="registration_owner",
        foreign_keys="Document.owner_id",
        primaryjoin="and_(Registration.id == Document.owner_id, Document.owner_type == 'registration')"
    )
    
    def __repr__(self) -> str:
        return f"<Registration(id={self.id}, student={self.student.full_name}, sport={self.sport_category.name}, status={self.status})>"
    
    @property
    def is_pending(self) -> bool:
        """Check if registration is pending."""
        return self.status == RegistrationStatus.PENDING
    
    @property
    def is_confirmed(self) -> bool:
        """Check if registration is confirmed."""
        return self.status == RegistrationStatus.CONFIRMED
    
    @property
    def is_paid(self) -> bool:
        """Check if registration is paid."""
        return self.status == RegistrationStatus.PAID
    
    @property
    def is_cancelled(self) -> bool:
        """Check if registration is cancelled."""
        return self.status == RegistrationStatus.CANCELLED
    
    @property
    def is_rejected(self) -> bool:
        """Check if registration is rejected."""
        return self.status == RegistrationStatus.REJECTED
    
    @property
    def is_active(self) -> bool:
        """Check if registration is active (confirmed or paid)."""
        return self.status in [RegistrationStatus.CONFIRMED, RegistrationStatus.PAID]
    
    @property
    def can_be_cancelled(self) -> bool:
        """Check if registration can be cancelled."""
        return self.status in [RegistrationStatus.PENDING, RegistrationStatus.CONFIRMED]
    
    @property
    def requires_payment(self) -> bool:
        """Check if registration requires payment."""
        return self.sport_category.fee > 0
    
    @property
    def payment_status(self) -> str:
        """Get payment status string."""
        if not self.payment:
            return "No payment required" if not self.requires_payment else "Payment pending"
        
        return self.payment.status
    
    @property
    def total_fee(self) -> float:
        """Get total registration fee."""
        return float(self.sport_category.fee)
    
    def get_registration_data(self, key: str, default=None):
        """Get specific data from registration_data JSON."""
        if not self.registration_data:
            return default
        return self.registration_data.get(key, default)
    
    def set_registration_data(self, key: str, value):
        """Set specific data in registration_data JSON."""
        if not self.registration_data:
            self.registration_data = {}
        self.registration_data[key] = value
    
    def get_document_urls(self) -> list:
        """Get list of document URLs from documents JSON."""
        if not self.documents:
            return []
        return self.documents.get("urls", [])
    
    def add_document_url(self, url: str, doc_type: str = "general"):
        """Add document URL to documents JSON."""
        if not self.documents:
            self.documents = {"urls": [], "types": {}}
        
        if "urls" not in self.documents:
            self.documents["urls"] = []
        if "types" not in self.documents:
            self.documents["types"] = {}
        
        self.documents["urls"].append(url)
        self.documents["types"][url] = doc_type
    
    def confirm(self):
        """Confirm the registration."""
        if self.status == RegistrationStatus.PENDING:
            self.status = RegistrationStatus.CONFIRMED
            self.confirmed_at = datetime.utcnow()
    
    def cancel(self, reason: str = None):
        """Cancel the registration."""
        if self.can_be_cancelled:
            self.status = RegistrationStatus.CANCELLED
            self.cancelled_at = datetime.utcnow()
            if reason:
                self.notes = f"Cancelled: {reason}"
    
    def reject(self, reason: str = None):
        """Reject the registration."""
        if self.status == RegistrationStatus.PENDING:
            self.status = RegistrationStatus.REJECTED
            if reason:
                self.notes = f"Rejected: {reason}"
    
    def mark_as_paid(self):
        """Mark registration as paid."""
        if self.status == RegistrationStatus.CONFIRMED:
            self.status = RegistrationStatus.PAID

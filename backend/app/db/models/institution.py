"""
Institution model for educational institutions.

Contains institution details, verification status, billing information,
and relationships to students and sponsorships.
"""

from typing import Optional
from uuid import UUID

from sqlalchemy import Boolean, ForeignKey, String, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, SoftDeleteMixin


class Institution(Base, SoftDeleteMixin):
    """Institution model for educational institutions."""
    
    __tablename__ = "institutions"
    
    # User relationship
    user_id: Mapped[UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True
    )
    
    # Basic information
    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        index=True
    )
    email: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        index=True
    )
    phone: Mapped[Optional[str]] = mapped_column(
        String(20),
        nullable=True
    )
    
    # Address information (stored as JSON)
    address: Mapped[Optional[dict]] = mapped_column(
        JSON,
        nullable=True
    )
    
    # Institution details
    institution_type: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True
    )
    registration_number: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
        index=True
    )
    website: Mapped[Optional[str]] = mapped_column(
        String(500),
        nullable=True
    )
    description: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
    )
    
    # Verification and status
    verified: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False
    )
    verification_date: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True
    )
    verification_notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
    )
    
    # Billing information (stored as JSON)
    billing_info: Mapped[Optional[dict]] = mapped_column(
        JSON,
        nullable=True
    )
    
    # Contact person information
    contact_person_name: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True
    )
    contact_person_phone: Mapped[Optional[str]] = mapped_column(
        String(20),
        nullable=True
    )
    contact_person_email: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True
    )
    
    # Additional information
    logo_url: Mapped[Optional[str]] = mapped_column(
        String(500),
        nullable=True
    )
    
    # Relationships
    user = relationship("User", back_populates="institution_profile")
    students = relationship(
        "Student",
        back_populates="institution",
        cascade="all, delete-orphan"
    )
    sponsorships = relationship(
        "Sponsorship",
        back_populates="institution",
        cascade="all, delete-orphan"
    )
    payments = relationship(
        "Payment",
        back_populates="institution",
        cascade="all, delete-orphan"
    )
    documents = relationship(
        "Document",
        back_populates="institution_owner",
        foreign_keys="Document.owner_id",
        primaryjoin="and_(Institution.id == Document.owner_id, Document.owner_type == 'institution')"
    )
    
    def __repr__(self) -> str:
        return f"<Institution(id={self.id}, name={self.name}, verified={self.verified})>"
    
    @property
    def display_name(self) -> str:
        """Get display name for the institution."""
        return self.name
    
    @property
    def is_verified(self) -> bool:
        """Check if institution is verified."""
        return self.verified
    
    def get_address_string(self) -> Optional[str]:
        """Get formatted address string."""
        if not self.address:
            return None
        
        parts = []
        for field in ["street", "city", "state", "postal_code", "country"]:
            if self.address.get(field):
                parts.append(self.address[field])
        
        return ", ".join(parts) if parts else None
    
    def get_billing_address(self) -> Optional[dict]:
        """Get billing address from billing_info JSON data."""
        if not self.billing_info:
            return None
        return self.billing_info.get("address")
    
    def get_tax_id(self) -> Optional[str]:
        """Get tax ID from billing_info JSON data."""
        if not self.billing_info:
            return None
        return self.billing_info.get("tax_id")
    
    def get_payment_method(self) -> Optional[str]:
        """Get payment method from billing_info JSON data."""
        if not self.billing_info:
            return None
        return self.billing_info.get("payment_method")
    
    def get_total_students(self) -> int:
        """Get total number of active students."""
        return len([s for s in self.students if s.is_active])
    
    def get_verified_students(self) -> int:
        """Get number of verified students."""
        return len([
            s for s in self.students 
            if s.is_active and s.user.is_verified
        ])
    
    def get_pending_verifications(self) -> int:
        """Get number of students pending verification."""
        return len([
            s for s in self.students 
            if s.is_active and not s.user.is_verified
        ])
    
    def get_total_registrations(self) -> int:
        """Get total number of student registrations."""
        total = 0
        for student in self.students:
            if student.is_active:
                total += len(student.registrations)
        return total
    
    def get_active_registrations(self) -> int:
        """Get number of active registrations."""
        total = 0
        for student in self.students:
            if student.is_active:
                total += len([
                    r for r in student.registrations 
                    if r.status in ["confirmed", "paid"]
                ])
        return total

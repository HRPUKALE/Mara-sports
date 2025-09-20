"""
Sponsorship model for sponsorship applications and management.

Contains sponsorship details, status tracking, and relationships
to institutions and sponsors.
"""

from decimal import Decimal
from enum import Enum
from typing import Optional
from uuid import UUID

from sqlalchemy import String, Text, Numeric, ForeignKey, JSON, Boolean
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class SponsorshipStatus(str, Enum):
    """Sponsorship status enumeration."""
    APPLIED = "applied"
    UNDER_REVIEW = "under_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    CANCELLED = "cancelled"
    EXPIRED = "expired"


class Sponsorship(Base):
    """Sponsorship model for sponsorship applications and management."""
    
    __tablename__ = "sponsorships"
    
    # Institution relationship
    institution_id: Mapped[UUID] = mapped_column(
        PostgresUUID(as_uuid=True),
        ForeignKey("institutions.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    # Sponsorship details
    sponsor_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )
    sponsor_contact_person: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True
    )
    sponsor_email: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True
    )
    sponsor_phone: Mapped[Optional[str]] = mapped_column(
        String(20),
        nullable=True
    )
    
    # Financial details
    requested_amount: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False
    )
    approved_amount: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(10, 2),
        nullable=True
    )
    currency: Mapped[str] = mapped_column(
        String(10),
        default="INR",
        nullable=False
    )
    
    # Sponsorship details
    sponsorship_type: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True
    )
    description: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
    )
    terms_and_conditions: Mapped[Optional[dict]] = mapped_column(
        JSON,
        nullable=True
    )
    
    # Status and processing
    status: Mapped[SponsorshipStatus] = mapped_column(
        String(20),
        default=SponsorshipStatus.APPLIED,
        nullable=False,
        index=True
    )
    
    # Review information
    reviewed_by: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True
    )
    review_notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
    )
    rejection_reason: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
    )
    
    # Additional information
    start_date: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True
    )
    end_date: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True
    )
    is_renewable: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False
    )
    
    # Documents and attachments
    documents: Mapped[Optional[dict]] = mapped_column(
        JSON,
        nullable=True
    )
    
    # Additional metadata
    metadata: Mapped[Optional[dict]] = mapped_column(
        JSON,
        nullable=True
    )
    
    # Relationships
    institution = relationship("Institution", back_populates="sponsorships")
    
    def __repr__(self) -> str:
        return f"<Sponsorship(id={self.id}, sponsor={self.sponsor_name}, amount={self.requested_amount}, status={self.status})>"
    
    @property
    def is_applied(self) -> bool:
        """Check if sponsorship is applied."""
        return self.status == SponsorshipStatus.APPLIED
    
    @property
    def is_under_review(self) -> bool:
        """Check if sponsorship is under review."""
        return self.status == SponsorshipStatus.UNDER_REVIEW
    
    @property
    def is_approved(self) -> bool:
        """Check if sponsorship is approved."""
        return self.status == SponsorshipStatus.APPROVED
    
    @property
    def is_rejected(self) -> bool:
        """Check if sponsorship is rejected."""
        return self.status == SponsorshipStatus.REJECTED
    
    @property
    def is_cancelled(self) -> bool:
        """Check if sponsorship is cancelled."""
        return self.status == SponsorshipStatus.CANCELLED
    
    @property
    def is_expired(self) -> bool:
        """Check if sponsorship is expired."""
        return self.status == SponsorshipStatus.EXPIRED
    
    @property
    def is_active(self) -> bool:
        """Check if sponsorship is active (approved and not expired)."""
        return self.is_approved and not self.is_expired
    
    @property
    def can_be_approved(self) -> bool:
        """Check if sponsorship can be approved."""
        return self.status in [SponsorshipStatus.APPLIED, SponsorshipStatus.UNDER_REVIEW]
    
    @property
    def can_be_rejected(self) -> bool:
        """Check if sponsorship can be rejected."""
        return self.status in [SponsorshipStatus.APPLIED, SponsorshipStatus.UNDER_REVIEW]
    
    @property
    def can_be_cancelled(self) -> bool:
        """Check if sponsorship can be cancelled."""
        return self.status in [SponsorshipStatus.APPLIED, SponsorshipStatus.UNDER_REVIEW, SponsorshipStatus.APPROVED]
    
    @property
    def final_amount(self) -> Decimal:
        """Get final approved amount or requested amount."""
        return self.approved_amount if self.approved_amount is not None else self.requested_amount
    
    @property
    def approval_percentage(self) -> float:
        """Get approval percentage of requested amount."""
        if self.approved_amount is None:
            return 0.0
        return float((self.approved_amount / self.requested_amount) * 100)
    
    def get_terms(self, key: str, default=None):
        """Get specific term from terms_and_conditions JSON."""
        if not self.terms_and_conditions:
            return default
        return self.terms_and_conditions.get(key, default)
    
    def set_terms(self, key: str, value):
        """Set specific term in terms_and_conditions JSON."""
        if not self.terms_and_conditions:
            self.terms_and_conditions = {}
        self.terms_and_conditions[key] = value
    
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
    
    def approve(self, approved_amount: Decimal = None, reviewer: str = None, notes: str = None):
        """Approve the sponsorship."""
        if not self.can_be_approved:
            raise ValueError("Sponsorship cannot be approved")
        
        self.status = SponsorshipStatus.APPROVED
        if approved_amount is not None:
            self.approved_amount = approved_amount
        if reviewer:
            self.reviewed_by = reviewer
        if notes:
            self.review_notes = notes
    
    def reject(self, reason: str, reviewer: str = None):
        """Reject the sponsorship."""
        if not self.can_be_rejected:
            raise ValueError("Sponsorship cannot be rejected")
        
        self.status = SponsorshipStatus.REJECTED
        self.rejection_reason = reason
        if reviewer:
            self.reviewed_by = reviewer
    
    def cancel(self, reason: str = None):
        """Cancel the sponsorship."""
        if not self.can_be_cancelled:
            raise ValueError("Sponsorship cannot be cancelled")
        
        self.status = SponsorshipStatus.CANCELLED
        if reason:
            self.review_notes = f"Cancelled: {reason}"
    
    def mark_under_review(self, reviewer: str = None):
        """Mark sponsorship as under review."""
        if self.status != SponsorshipStatus.APPLIED:
            raise ValueError("Only applied sponsorships can be marked as under review")
        
        self.status = SponsorshipStatus.UNDER_REVIEW
        if reviewer:
            self.reviewed_by = reviewer
    
    def get_sponsorship_summary(self) -> dict:
        """Get sponsorship summary for display."""
        return {
            "id": str(self.id),
            "sponsor_name": self.sponsor_name,
            "institution": self.institution.name,
            "requested_amount": float(self.requested_amount),
            "approved_amount": float(self.approved_amount) if self.approved_amount else None,
            "currency": self.currency,
            "status": self.status,
            "sponsorship_type": self.sponsorship_type,
            "description": self.description,
            "created_at": self.created_at.isoformat(),
            "is_active": self.is_active,
            "approval_percentage": self.approval_percentage,
        }

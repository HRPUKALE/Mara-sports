"""
Payment model for payment processing and tracking.

Supports multiple payment providers (Razorpay, Stripe) and tracks
payment status, amounts, and provider-specific data.
"""

from decimal import Decimal
from enum import Enum
from typing import Optional
from uuid import UUID

from sqlalchemy import String, Text, Numeric, ForeignKey, JSON, Boolean
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


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


class Payment(Base):
    """Payment model for payment processing and tracking."""
    
    __tablename__ = "payments"
    
    # Registration relationship (optional for institution payments)
    registration_id: Mapped[Optional[UUID]] = mapped_column(
        PostgresUUID(as_uuid=True),
        ForeignKey("registrations.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    
    # Institution relationship (for institution-level payments)
    institution_id: Mapped[Optional[UUID]] = mapped_column(
        PostgresUUID(as_uuid=True),
        ForeignKey("institutions.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    
    # Payment details
    amount: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False
    )
    currency: Mapped[str] = mapped_column(
        String(10),
        default="INR",
        nullable=False
    )
    
    # Payment status and provider
    status: Mapped[PaymentStatus] = mapped_column(
        String(20),
        default=PaymentStatus.INITIATED,
        nullable=False,
        index=True
    )
    provider: Mapped[PaymentProvider] = mapped_column(
        String(20),
        default=PaymentProvider.LOCAL,
        nullable=False
    )
    
    # Provider-specific data
    provider_payment_id: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        index=True
    )
    provider_order_id: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        index=True
    )
    provider_payload: Mapped[Optional[dict]] = mapped_column(
        JSON,
        nullable=True
    )
    
    # Payment metadata
    payment_method: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True
    )
    payment_gateway: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True
    )
    
    # Refund information
    refund_amount: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(10, 2),
        nullable=True
    )
    refund_reason: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
    )
    refund_id: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True
    )
    
    # Additional information
    description: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
    )
    notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
    )
    
    # Webhook and processing
    webhook_received: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False
    )
    webhook_processed: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False
    )
    
    # Relationships
    registration = relationship("Registration", back_populates="payment")
    institution = relationship("Institution", back_populates="payments")
    
    def __repr__(self) -> str:
        return f"<Payment(id={self.id}, amount={self.amount}, status={self.status}, provider={self.provider})>"
    
    @property
    def is_successful(self) -> bool:
        """Check if payment is successful."""
        return self.status == PaymentStatus.SUCCESS
    
    @property
    def is_failed(self) -> bool:
        """Check if payment failed."""
        return self.status == PaymentStatus.FAILED
    
    @property
    def is_pending(self) -> bool:
        """Check if payment is pending."""
        return self.status in [PaymentStatus.INITIATED, PaymentStatus.PENDING]
    
    @property
    def is_cancelled(self) -> bool:
        """Check if payment is cancelled."""
        return self.status == PaymentStatus.CANCELLED
    
    @property
    def is_refunded(self) -> bool:
        """Check if payment is refunded."""
        return self.status in [PaymentStatus.REFUNDED, PaymentStatus.PARTIALLY_REFUNDED]
    
    @property
    def is_completed(self) -> bool:
        """Check if payment is completed (success or refunded)."""
        return self.status in [PaymentStatus.SUCCESS, PaymentStatus.REFUNDED, PaymentStatus.PARTIALLY_REFUNDED]
    
    @property
    def can_be_refunded(self) -> bool:
        """Check if payment can be refunded."""
        return self.is_successful and not self.is_refunded
    
    @property
    def refund_amount_remaining(self) -> Decimal:
        """Get remaining amount that can be refunded."""
        if not self.is_successful:
            return Decimal('0.00')
        
        if self.refund_amount is None:
            return self.amount
        
        return self.amount - self.refund_amount
    
    @property
    def is_partial_refund(self) -> bool:
        """Check if payment has partial refund."""
        return (
            self.status == PaymentStatus.PARTIALLY_REFUNDED or
            (self.refund_amount is not None and self.refund_amount < self.amount)
        )
    
    @property
    def is_full_refund(self) -> bool:
        """Check if payment has full refund."""
        return (
            self.status == PaymentStatus.REFUNDED or
            (self.refund_amount is not None and self.refund_amount == self.amount)
        )
    
    def get_provider_data(self, key: str, default=None):
        """Get specific data from provider_payload JSON."""
        if not self.provider_payload:
            return default
        return self.provider_payload.get(key, default)
    
    def set_provider_data(self, key: str, value):
        """Set specific data in provider_payload JSON."""
        if not self.provider_payload:
            self.provider_payload = {}
        self.provider_payload[key] = value
    
    def mark_successful(self, provider_payment_id: str = None, provider_data: dict = None):
        """Mark payment as successful."""
        self.status = PaymentStatus.SUCCESS
        if provider_payment_id:
            self.provider_payment_id = provider_payment_id
        if provider_data:
            self.provider_payload = provider_data
        self.webhook_processed = True
    
    def mark_failed(self, reason: str = None, provider_data: dict = None):
        """Mark payment as failed."""
        self.status = PaymentStatus.FAILED
        if reason:
            self.notes = f"Payment failed: {reason}"
        if provider_data:
            self.provider_payload = provider_data
        self.webhook_processed = True
    
    def mark_cancelled(self, reason: str = None):
        """Mark payment as cancelled."""
        self.status = PaymentStatus.CANCELLED
        if reason:
            self.notes = f"Payment cancelled: {reason}"
    
    def process_refund(self, refund_amount: Decimal, reason: str = None, refund_id: str = None):
        """Process refund for payment."""
        if not self.can_be_refunded:
            raise ValueError("Payment cannot be refunded")
        
        if refund_amount > self.refund_amount_remaining:
            raise ValueError("Refund amount exceeds remaining amount")
        
        if self.refund_amount is None:
            self.refund_amount = refund_amount
        else:
            self.refund_amount += refund_amount
        
        if self.refund_amount == self.amount:
            self.status = PaymentStatus.REFUNDED
        else:
            self.status = PaymentStatus.PARTIALLY_REFUNDED
        
        if reason:
            self.refund_reason = reason
        if refund_id:
            self.refund_id = refund_id
    
    def get_payment_summary(self) -> dict:
        """Get payment summary for display."""
        return {
            "id": str(self.id),
            "amount": float(self.amount),
            "currency": self.currency,
            "status": self.status,
            "provider": self.provider,
            "payment_method": self.payment_method,
            "description": self.description,
            "created_at": self.created_at.isoformat(),
            "is_successful": self.is_successful,
            "refund_amount": float(self.refund_amount) if self.refund_amount else None,
            "refund_remaining": float(self.refund_amount_remaining),
        }

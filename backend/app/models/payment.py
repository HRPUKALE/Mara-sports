"""
Payment model for handling payments.
"""

from sqlalchemy import Column, String, ForeignKey, Enum, Boolean, DateTime, Numeric, JSON
from sqlalchemy.dialects.mysql import CHAR
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.db.database import Base


class Payment(Base):
    """Payment model."""
    
    __tablename__ = "payments"
    
    id = Column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    registration_id = Column(CHAR(36), ForeignKey("registrations.id", ondelete="CASCADE"), nullable=False)
    institution_id = Column(CHAR(36), ForeignKey("institutions.id", ondelete="CASCADE"), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(3), nullable=False, default="INR")
    status = Column(Enum("pending", "completed", "failed", "refunded"), nullable=False, default="pending")
    provider = Column(String(50), nullable=False)
    provider_payload = Column(JSON, nullable=True)
    transaction_id = Column(String(255), nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    registration = relationship("Registration", back_populates="payment")
    institution = relationship("Institution", back_populates="payments")
    
    def __repr__(self):
        return f"<Payment(id={self.id}, amount={self.amount}, status={self.status})>"

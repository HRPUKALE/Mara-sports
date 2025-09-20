"""
Sponsorship model for handling sponsorships.
"""

from sqlalchemy import Column, String, ForeignKey, Enum, Boolean, DateTime, Numeric, JSON
from sqlalchemy.dialects.mysql import CHAR
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.db.database import Base


class Sponsorship(Base):
    """Sponsorship model."""
    
    __tablename__ = "sponsorships"
    
    id = Column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    institution_id = Column(CHAR(36), ForeignKey("institutions.id", ondelete="CASCADE"), nullable=False)
    sponsor_name = Column(String(255), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    status = Column(Enum("pending", "approved", "rejected"), nullable=False, default="pending")
    terms = Column(JSON, nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    institution = relationship("Institution", back_populates="sponsorships")
    
    def __repr__(self):
        return f"<Sponsorship(id={self.id}, sponsor_name={self.sponsor_name}, amount={self.amount})>"

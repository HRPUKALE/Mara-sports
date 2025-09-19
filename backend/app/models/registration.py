"""
Registration model for sport registrations.
"""

from sqlalchemy import Column, String, ForeignKey, Enum, Boolean, DateTime, Text, JSON
from sqlalchemy.dialects.mysql import CHAR
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.db.database import Base


class Registration(Base):
    """Sport registration model."""
    
    __tablename__ = "registrations"
    
    id = Column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = Column(CHAR(36), ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    sport_category_id = Column(CHAR(36), ForeignKey("sport_categories.id", ondelete="CASCADE"), nullable=False)
    status = Column(Enum("pending", "confirmed", "rejected", "cancelled"), nullable=False, default="pending")
    payment_id = Column(CHAR(36), nullable=True)
    documents = Column(JSON, nullable=True)
    notes = Column(Text, nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    student = relationship("Student", back_populates="registrations")
    sport_category = relationship("SportCategory", back_populates="registrations")
    payment = relationship("Payment", back_populates="registration")
    
    def __repr__(self):
        return f"<Registration(id={self.id}, student_id={self.student_id}, status={self.status})>"

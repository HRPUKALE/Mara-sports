"""
Institution model.
"""

from sqlalchemy import Column, String, Boolean, ForeignKey, JSON, DateTime, Text
from sqlalchemy.dialects.mysql import CHAR
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base

class Institution(Base):
    __tablename__ = "institutions"
    
    id = Column(CHAR(36), primary_key=True, index=True)
    user_id = Column(CHAR(36), ForeignKey("users.id"), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False, index=True)
    email = Column(String(255), nullable=False, index=True)
    phone = Column(String(20), nullable=True)
    address = Column(JSON, nullable=True)
    institution_type = Column(String(100), nullable=True)
    registration_number = Column(String(100), nullable=True, index=True)
    website = Column(String(500), nullable=True)
    description = Column(Text, nullable=True)
    verified = Column(Boolean, default=False, nullable=False)
    verification_date = Column(String(50), nullable=True)
    verification_notes = Column(Text, nullable=True)
    billing_info = Column(JSON, nullable=True)
    contact_person_name = Column(String(255), nullable=True)
    contact_person_phone = Column(String(20), nullable=True)
    contact_person_email = Column(String(255), nullable=True)
    logo_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="institution_profile")
    students = relationship("Student", back_populates="institution")
    payments = relationship("Payment", back_populates="institution")
    sponsorships = relationship("Sponsorship", back_populates="institution")

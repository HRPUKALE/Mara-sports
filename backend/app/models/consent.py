"""
Consent forms and student consents models.
"""

from sqlalchemy import Column, String, Text, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.dialects.mysql import CHAR
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.db.database import Base

class ConsentType(str, enum.Enum):
    WAIVER = "waiver"
    PRIVACY = "privacy"
    MEDICAL = "medical"
    PHOTO = "photo"
    TRANSPORT = "transport"

class ConsentStatus(str, enum.Enum):
    REQUIRED = "required"
    PENDING = "pending"
    COMPLETED = "completed"
    EXPIRED = "expired"

class ConsentForm(Base):
    __tablename__ = "consent_forms"
    
    id = Column(CHAR(36), primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    type = Column(Enum(ConsentType), nullable=False)
    description = Column(Text, nullable=True)
    content = Column(Text, nullable=False)
    version = Column(String(20), nullable=False, default="1.0")
    is_active = Column(Boolean, default=True, nullable=False)
    expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    student_consents = relationship("StudentConsent", back_populates="consent_form")

class StudentConsent(Base):
    __tablename__ = "student_consents"
    
    id = Column(CHAR(36), primary_key=True, index=True)
    student_id = Column(CHAR(36), ForeignKey("students.id"), nullable=False, index=True)
    consent_form_id = Column(CHAR(36), ForeignKey("consent_forms.id"), nullable=False, index=True)
    status = Column(Enum(ConsentStatus), nullable=False, default=ConsentStatus.REQUIRED)
    digital_signature = Column(Text, nullable=True)
    agreed_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    student = relationship("Student", back_populates="consents")
    consent_form = relationship("ConsentForm", back_populates="student_consents")

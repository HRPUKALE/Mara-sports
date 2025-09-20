"""
Student model.
"""

from sqlalchemy import Column, String, Date, ForeignKey, JSON, Boolean, DateTime
from sqlalchemy.dialects.mysql import CHAR
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base

class Student(Base):
    __tablename__ = "students"
    
    id = Column(CHAR(36), primary_key=True, index=True)
    user_id = Column(CHAR(36), ForeignKey("users.id"), unique=True, nullable=False, index=True)
    first_name = Column(String(100), nullable=False)
    middle_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=False)
    gender = Column(String(20), nullable=False)
    date_of_birth = Column(Date, nullable=False)
    phone = Column(String(20), nullable=True)
    email = Column(String(255), nullable=False, index=True)
    
    # Institution Information
    institution_id = Column(CHAR(36), ForeignKey("institutions.id"), nullable=True, index=True)
    institution_name = Column(String(255), nullable=True)
    student_id = Column(String(50), nullable=True, index=True)
    
    # Contact Information
    parent_guardian_name = Column(String(255), nullable=True)
    parent_phone = Column(String(20), nullable=True)
    parent_email = Column(String(255), nullable=True)
    
    # Emergency Contact
    emergency_contact_name = Column(String(255), nullable=True)
    emergency_contact_relation = Column(String(100), nullable=True)
    emergency_contact_phone = Column(String(20), nullable=True)
    emergency_contact_email = Column(String(255), nullable=True)
    
    # Medical Information
    medical_question_1 = Column(String(500), nullable=True)
    medical_question_2 = Column(String(500), nullable=True)
    has_allergies = Column(Boolean, default=False, nullable=False)
    allergies_details = Column(String(1000), nullable=True)
    
    # Sports Participation
    participation_type = Column(String(50), nullable=True)  # individual, team, both
    selected_sports = Column(JSON, nullable=True)  # Array of selected sports
    
    # Document Uploads
    student_id_image = Column(String(500), nullable=True)
    age_proof_image = Column(String(500), nullable=True)
    
    # Additional Information
    address = Column(JSON, nullable=True)
    medical_info = Column(JSON, nullable=True)
    guardian = Column(JSON, nullable=True)
    profile_picture = Column(String(500), nullable=True)
    
    # Status and Timestamps
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="student_profile")
    institution = relationship("Institution", back_populates="students")
    consents = relationship("StudentConsent", back_populates="student")
    registrations = relationship("Registration", back_populates="student")

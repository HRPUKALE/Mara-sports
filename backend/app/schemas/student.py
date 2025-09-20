"""
Student schemas for API responses.
"""

from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any, List
from datetime import date, datetime

class StudentBase(BaseModel):
    first_name: str
    middle_name: Optional[str] = None
    last_name: str
    gender: str
    date_of_birth: date
    phone: Optional[str] = None
    email: EmailStr
    
    # Institution Information
    institution_name: Optional[str] = None
    student_id: Optional[str] = None
    
    # Contact Information
    parent_guardian_name: Optional[str] = None
    parent_phone: Optional[str] = None
    parent_email: Optional[EmailStr] = None
    
    # Emergency Contact
    emergency_contact_name: Optional[str] = None
    emergency_contact_relation: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    emergency_contact_email: Optional[EmailStr] = None
    
    # Medical Information
    medical_question_1: Optional[str] = None
    medical_question_2: Optional[str] = None
    has_allergies: bool = False
    allergies_details: Optional[str] = None
    
    # Sports Participation
    participation_type: Optional[str] = None
    selected_sports: Optional[List[str]] = None
    
    # Document Uploads
    student_id_image: Optional[str] = None
    age_proof_image: Optional[str] = None
    
    # Additional Information
    address: Optional[Dict[str, Any]] = None
    medical_info: Optional[Dict[str, Any]] = None
    guardian: Optional[Dict[str, Any]] = None
    profile_picture: Optional[str] = None

class StudentCreate(StudentBase):
    user_id: str
    institution_id: Optional[str] = None
    password: str

class StudentRegistration(StudentBase):
    institution_id: Optional[str] = None
    password: str

class StudentUpdate(BaseModel):
    first_name: Optional[str] = None
    middle_name: Optional[str] = None
    last_name: Optional[str] = None
    gender: Optional[str] = None
    date_of_birth: Optional[date] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    institution_name: Optional[str] = None
    student_id: Optional[str] = None
    parent_guardian_name: Optional[str] = None
    parent_phone: Optional[str] = None
    parent_email: Optional[EmailStr] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_relation: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    emergency_contact_email: Optional[EmailStr] = None
    medical_question_1: Optional[str] = None
    medical_question_2: Optional[str] = None
    has_allergies: Optional[bool] = None
    allergies_details: Optional[str] = None
    participation_type: Optional[str] = None
    selected_sports: Optional[List[str]] = None
    student_id_image: Optional[str] = None
    age_proof_image: Optional[str] = None
    address: Optional[Dict[str, Any]] = None
    medical_info: Optional[Dict[str, Any]] = None
    guardian: Optional[Dict[str, Any]] = None
    profile_picture: Optional[str] = None

class StudentResponse(StudentBase):
    id: str
    user_id: str
    institution_id: Optional[str]
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
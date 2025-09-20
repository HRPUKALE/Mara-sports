"""
Student model for student profiles and information.

Contains personal details, medical information, guardian details,
and relationships to institutions and registrations.
"""

from datetime import date
from typing import Optional
from uuid import UUID

from sqlalchemy import Date, ForeignKey, String, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, SoftDeleteMixin


class Student(Base, SoftDeleteMixin):
    """Student model for student profiles."""
    
    __tablename__ = "students"
    
    # User relationship
    user_id: Mapped[UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True
    )
    
    # Personal information
    first_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )
    middle_name: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True
    )
    last_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )
    gender: Mapped[str] = mapped_column(
        String(20),
        nullable=False
    )
    date_of_birth: Mapped[date] = mapped_column(
        Date,
        nullable=False
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
    
    # Medical information (stored as JSON)
    medical_info: Mapped[Optional[dict]] = mapped_column(
        JSON,
        nullable=True
    )
    
    # Guardian information (stored as JSON)
    guardian: Mapped[Optional[dict]] = mapped_column(
        JSON,
        nullable=True
    )
    
    # Institution relationship
    institution_id: Mapped[Optional[UUID]] = mapped_column(
        ForeignKey("institutions.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    
    # Additional information
    student_id: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
        index=True
    )
    profile_picture: Mapped[Optional[str]] = mapped_column(
        String(500),
        nullable=True
    )
    
    # Relationships
    user = relationship("User", back_populates="student_profile")
    institution = relationship("Institution", back_populates="students")
    registrations = relationship(
        "Registration",
        back_populates="student",
        cascade="all, delete-orphan"
    )
    documents = relationship(
        "Document",
        back_populates="student_owner",
        foreign_keys="Document.owner_id",
        primaryjoin="and_(Student.id == Document.owner_id, Document.owner_type == 'student')"
    )
    
    def __repr__(self) -> str:
        return f"<Student(id={self.id}, name={self.full_name}, email={self.user.email})>"
    
    @property
    def full_name(self) -> str:
        """Get full name combining first, middle, and last names."""
        parts = [self.first_name]
        if self.middle_name:
            parts.append(self.middle_name)
        parts.append(self.last_name)
        return " ".join(parts)
    
    @property
    def age(self) -> int:
        """Calculate current age from date of birth."""
        today = date.today()
        return today.year - self.date_of_birth.year - (
            (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
        )
    
    @property
    def is_adult(self) -> bool:
        """Check if student is 18 or older."""
        return self.age >= 18
    
    def get_guardian_name(self) -> Optional[str]:
        """Get guardian name from guardian JSON data."""
        if not self.guardian:
            return None
        return self.guardian.get("name")
    
    def get_guardian_phone(self) -> Optional[str]:
        """Get guardian phone from guardian JSON data."""
        if not self.guardian:
            return None
        return self.guardian.get("phone")
    
    def get_guardian_relation(self) -> Optional[str]:
        """Get guardian relation from guardian JSON data."""
        if not self.guardian:
            return None
        return self.guardian.get("relation")
    
    def get_medical_conditions(self) -> Optional[str]:
        """Get medical conditions from medical_info JSON data."""
        if not self.medical_info:
            return None
        return self.medical_info.get("conditions")
    
    def get_allergies(self) -> Optional[str]:
        """Get allergies from medical_info JSON data."""
        if not self.medical_info:
            return None
        return self.medical_info.get("allergies")
    
    def get_medications(self) -> Optional[str]:
        """Get medications from medical_info JSON data."""
        if not self.medical_info:
            return None
        return self.medical_info.get("medications")
    
    def get_emergency_contact(self) -> Optional[dict]:
        """Get emergency contact information."""
        if not self.medical_info:
            return None
        return self.medical_info.get("emergency_contact")
    
    def get_address_string(self) -> Optional[str]:
        """Get formatted address string."""
        if not self.address:
            return None
        
        parts = []
        for field in ["street", "city", "state", "postal_code", "country"]:
            if self.address.get(field):
                parts.append(self.address[field])
        
        return ", ".join(parts) if parts else None

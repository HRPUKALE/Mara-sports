"""
Sport model for sports and sport categories.

Contains sport definitions, categories, age groups, fees, and capacity limits.
"""

from decimal import Decimal
from enum import Enum
from typing import Optional
from uuid import UUID

from sqlalchemy import Integer, String, Text, Numeric, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class GenderAllowed(str, Enum):
    """Gender allowed enumeration."""
    MALE = "male"
    FEMALE = "female"
    MIXED = "mixed"
    ANY = "any"


class Sport(Base):
    """Sport model for sports definitions."""
    
    __tablename__ = "sports"
    
    # Basic information
    name: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=False,
        index=True
    )
    slug: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=False,
        index=True
    )
    description: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
    )
    
    # Sport details
    sport_type: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True
    )
    is_team_sport: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False
    )
    is_individual_sport: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False
    )
    
    # Status
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False
    )
    
    # Relationships
    categories = relationship(
        "SportCategory",
        back_populates="sport",
        cascade="all, delete-orphan"
    )
    registrations = relationship(
        "Registration",
        back_populates="sport_category",
        secondary="sport_categories"
    )
    
    def __repr__(self) -> str:
        return f"<Sport(id={self.id}, name={self.name}, slug={self.slug})>"
    
    @property
    def total_categories(self) -> int:
        """Get total number of categories for this sport."""
        return len(self.categories)
    
    @property
    def active_categories(self) -> int:
        """Get number of active categories for this sport."""
        return len([c for c in self.categories if c.is_active])
    
    @property
    def total_capacity(self) -> int:
        """Get total capacity across all categories."""
        return sum(c.max_participants for c in self.categories if c.is_active)
    
    @property
    def current_registrations(self) -> int:
        """Get current number of registrations."""
        total = 0
        for category in self.categories:
            if category.is_active:
                total += len([
                    r for r in category.registrations 
                    if r.status in ["confirmed", "paid"]
                ])
        return total


class SportCategory(Base):
    """Sport category model for subcategories and age groups."""
    
    __tablename__ = "sport_categories"
    
    # Sport relationship
    sport_id: Mapped[UUID] = mapped_column(
        PostgresUUID(as_uuid=True),
        ForeignKey("sports.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    # Category information
    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )
    description: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
    )
    
    # Age and gender restrictions
    age_from: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True
    )
    age_to: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True
    )
    gender_allowed: Mapped[str] = mapped_column(
        String(20),
        default=GenderAllowed.ANY,
        nullable=False
    )
    
    # Capacity and fees
    max_participants: Mapped[int] = mapped_column(
        Integer,
        default=100,
        nullable=False
    )
    fee: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
        default=0.00
    )
    currency: Mapped[str] = mapped_column(
        String(10),
        default="INR",
        nullable=False
    )
    
    # Additional requirements
    requires_medical_certificate: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False
    )
    requires_guardian_consent: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False
    )
    requires_equipment: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False
    )
    equipment_provided: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False
    )
    
    # Status
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False
    )
    
    # Relationships
    sport = relationship("Sport", back_populates="categories")
    registrations = relationship(
        "Registration",
        back_populates="sport_category",
        cascade="all, delete-orphan"
    )
    
    def __repr__(self) -> str:
        return f"<SportCategory(id={self.id}, name={self.name}, sport={self.sport.name})>"
    
    @property
    def age_range(self) -> str:
        """Get formatted age range string."""
        if self.age_from and self.age_to:
            return f"{self.age_from}-{self.age_to} years"
        elif self.age_from:
            return f"{self.age_from}+ years"
        elif self.age_to:
            return f"Under {self.age_to} years"
        return "Any age"
    
    @property
    def current_registrations(self) -> int:
        """Get current number of registrations."""
        return len([
            r for r in self.registrations 
            if r.status in ["confirmed", "paid"]
        ])
    
    @property
    def available_spots(self) -> int:
        """Get available spots for registration."""
        return max(0, self.max_participants - self.current_registrations)
    
    @property
    def is_full(self) -> bool:
        """Check if category is full."""
        return self.available_spots == 0
    
    @property
    def registration_percentage(self) -> float:
        """Get registration percentage."""
        if self.max_participants == 0:
            return 0.0
        return (self.current_registrations / self.max_participants) * 100
    
    def is_age_eligible(self, age: int) -> bool:
        """Check if age is eligible for this category."""
        if self.age_from and age < self.age_from:
            return False
        if self.age_to and age > self.age_to:
            return False
        return True
    
    def is_gender_eligible(self, gender: str) -> bool:
        """Check if gender is eligible for this category."""
        if self.gender_allowed == GenderAllowed.ANY:
            return True
        return gender.lower() == self.gender_allowed.lower()
    
    def can_register(self, age: int, gender: str) -> bool:
        """Check if student can register for this category."""
        return (
            self.is_active and
            not self.is_full and
            self.is_age_eligible(age) and
            self.is_gender_eligible(gender)
        )

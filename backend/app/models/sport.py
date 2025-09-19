"""
Sport and Sport Category models.
"""

from sqlalchemy import Column, String, Integer, ForeignKey, Enum, Boolean, DateTime, Numeric, Text
from sqlalchemy.dialects.mysql import CHAR
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base
import enum

class GenderAllowed(str, enum.Enum):
    MALE = "male"
    FEMALE = "female"
    MIXED = "mixed"

class Sport(Base):
    __tablename__ = "sports"
    
    id = Column(CHAR(36), primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    slug = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    categories = relationship("SportCategory", back_populates="sport")

class SportCategory(Base):
    __tablename__ = "sport_categories"
    
    id = Column(CHAR(36), primary_key=True, index=True)
    sport_id = Column(CHAR(36), ForeignKey("sports.id"), nullable=False)
    name = Column(String(100), nullable=False)
    age_from = Column(Integer, nullable=False)
    age_to = Column(Integer, nullable=False)
    gender_allowed = Column(String(20), nullable=False)
    fee = Column(Numeric(10, 2), nullable=False, default=0.00)
    max_participants = Column(Integer, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    sport = relationship("Sport", back_populates="categories")

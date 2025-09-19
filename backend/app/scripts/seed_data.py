"""
Seed data script.

Seeds the database with initial data for development and testing.
"""

import asyncio
import sys
from uuid import uuid4

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from app.core.config import get_settings
from app.db.base import Base
from app.db.models.user import User, UserRole
from app.db.models.sport import Sport, SportCategory, GenderAllowed
from app.db.models.institution import Institution

settings = get_settings()


async def seed_data():
    """Seed database with initial data."""
    # Create database engine
    engine = create_async_engine(settings.DATABASE_URL)
    
    # Create session
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        try:
            # Create test users
            await create_test_users(session)
            
            # Create test institutions
            await create_test_institutions(session)
            
            # Create sports and categories
            await create_sports_and_categories(session)
            
            await session.commit()
            print("Data seeded successfully!")
            
        except Exception as e:
            print(f"Error seeding data: {e}")
            await session.rollback()
            sys.exit(1)
        finally:
            await engine.dispose()


async def create_test_users(session: AsyncSession):
    """Create test users."""
    users_data = [
        {
            "id": uuid4(),
            "email": "student1@example.com",
            "role": UserRole.STUDENT,
            "is_active": True,
            "is_verified": True,
        },
        {
            "id": uuid4(),
            "email": "student2@example.com",
            "role": UserRole.STUDENT,
            "is_active": True,
            "is_verified": True,
        },
        {
            "id": uuid4(),
            "email": "institution1@example.com",
            "role": UserRole.INSTITUTION_ADMIN,
            "is_active": True,
            "is_verified": True,
        },
    ]
    
    for user_data in users_data:
        user = User(**user_data)
        session.add(user)
    
    print("Test users created!")


async def create_test_institutions(session: AsyncSession):
    """Create test institutions."""
    institutions_data = [
        {
            "id": uuid4(),
            "name": "Example University",
            "email": "admin@example.edu",
            "phone": "+1234567890",
            "institution_type": "university",
            "registration_number": "UNI123456",
            "website": "https://example.edu",
            "description": "A leading educational institution",
            "verified": True,
        },
        {
            "id": uuid4(),
            "name": "Sports Academy",
            "email": "admin@sportsacademy.com",
            "phone": "+1234567891",
            "institution_type": "academy",
            "registration_number": "SA123456",
            "website": "https://sportsacademy.com",
            "description": "Premier sports training academy",
            "verified": True,
        },
    ]
    
    for institution_data in institutions_data:
        institution = Institution(**institution_data)
        session.add(institution)
    
    print("Test institutions created!")


async def create_sports_and_categories(session: AsyncSession):
    """Create sports and categories."""
    # Create sports
    sports_data = [
        {
            "id": uuid4(),
            "name": "Football",
            "slug": "football",
            "description": "Association football",
            "sport_type": "team",
            "is_team_sport": True,
            "is_individual_sport": False,
            "is_active": True,
        },
        {
            "id": uuid4(),
            "name": "Basketball",
            "slug": "basketball",
            "description": "Basketball sport",
            "sport_type": "team",
            "is_team_sport": True,
            "is_individual_sport": False,
            "is_active": True,
        },
        {
            "id": uuid4(),
            "name": "Tennis",
            "slug": "tennis",
            "description": "Tennis sport",
            "sport_type": "individual",
            "is_team_sport": False,
            "is_individual_sport": True,
            "is_active": True,
        },
    ]
    
    sports = []
    for sport_data in sports_data:
        sport = Sport(**sport_data)
        session.add(sport)
        sports.append(sport)
    
    await session.flush()  # Flush to get IDs
    
    # Create sport categories
    categories_data = [
        {
            "id": uuid4(),
            "sport_id": sports[0].id,  # Football
            "name": "Under 18",
            "description": "Players under 18 years old",
            "age_from": 16,
            "age_to": 18,
            "gender_allowed": GenderAllowed.MIXED,
            "max_participants": 50,
            "fee": 1000.00,
            "currency": "INR",
            "requires_medical_certificate": True,
            "requires_guardian_consent": True,
            "requires_equipment": False,
            "equipment_provided": True,
            "is_active": True,
        },
        {
            "id": uuid4(),
            "sport_id": sports[0].id,  # Football
            "name": "Under 21",
            "description": "Players under 21 years old",
            "age_from": 18,
            "age_to": 21,
            "gender_allowed": GenderAllowed.MIXED,
            "max_participants": 40,
            "fee": 1200.00,
            "currency": "INR",
            "requires_medical_certificate": True,
            "requires_guardian_consent": False,
            "requires_equipment": False,
            "equipment_provided": True,
            "is_active": True,
        },
        {
            "id": uuid4(),
            "sport_id": sports[1].id,  # Basketball
            "name": "Senior",
            "description": "Senior players",
            "age_from": 18,
            "age_to": 35,
            "gender_allowed": GenderAllowed.MIXED,
            "max_participants": 30,
            "fee": 800.00,
            "currency": "INR",
            "requires_medical_certificate": True,
            "requires_guardian_consent": False,
            "requires_equipment": False,
            "equipment_provided": True,
            "is_active": True,
        },
        {
            "id": uuid4(),
            "sport_id": sports[2].id,  # Tennis
            "name": "Open",
            "description": "Open category",
            "age_from": 16,
            "age_to": 50,
            "gender_allowed": GenderAllowed.ANY,
            "max_participants": 20,
            "fee": 1500.00,
            "currency": "INR",
            "requires_medical_certificate": False,
            "requires_guardian_consent": False,
            "requires_equipment": True,
            "equipment_provided": False,
            "is_active": True,
        },
    ]
    
    for category_data in categories_data:
        category = SportCategory(**category_data)
        session.add(category)
    
    print("Sports and categories created!")


def main():
    """Main function."""
    asyncio.run(seed_data())


if __name__ == "__main__":
    main()

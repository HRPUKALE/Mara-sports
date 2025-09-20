"""
Create super admin user script.

Creates a super admin user for system administration.
"""

import asyncio
import sys
from uuid import uuid4

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select

from app.core.config import get_settings
from app.core.security import get_password_hash
from app.db.base import Base
from app.models.user import User, UserRole

settings = get_settings()


async def create_super_admin():
    """Create super admin user."""
    # Create database engine
    engine = create_async_engine(settings.DATABASE_URL)
    
    # Create session
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        try:
            # Check if admin already exists
            existing_admin = await session.execute(
                select(User).where(User.role == UserRole.ADMIN)
            )
            if existing_admin.scalar_one_or_none():
                print("Admin already exists!")
                return
            
            # Create admin
            admin_data = {
                "id": uuid4(),
                "email": settings.ADMIN_EMAIL,
                "hashed_password": get_password_hash(settings.ADMIN_PASSWORD),
                "role": UserRole.ADMIN,
                "is_active": True,
                "is_verified": True,
            }
            
            admin = User(**admin_data)
            session.add(admin)
            await session.commit()
            
            print("Admin created successfully!")
            print(f"Email: {admin_data['email']}")
            print(f"Password: {settings.ADMIN_PASSWORD}")
            print("Please change the password after first login.")
            
        except Exception as e:
            print(f"Error creating admin: {e}")
            await session.rollback()
            sys.exit(1)
        finally:
            await engine.dispose()


def main():
    """Main function."""
    asyncio.run(create_super_admin())


if __name__ == "__main__":
    main()

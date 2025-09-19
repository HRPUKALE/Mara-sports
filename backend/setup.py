#!/usr/bin/env python3
"""
Setup script for Mara Sports Festival Backend.

This script helps with initial setup and database configuration.
"""

import asyncio
import os
import sys
from pathlib import Path

# Add the app directory to Python path
sys.path.insert(0, str(Path(__file__).parent))

from app.core.config import get_settings
from app.scripts.create_super_admin import create_super_admin


def check_requirements():
    """Check if all required packages are installed."""
    try:
        import fastapi
        import sqlalchemy
        import aiomysql
        import redis
        import pydantic
        print("✅ All required packages are installed")
        return True
    except ImportError as e:
        print(f"❌ Missing required package: {e}")
        print("Please run: pip install -e .")
        return False


def check_database_connection():
    """Check if database connection is working."""
    try:
        settings = get_settings()
        print(f"Database URL: {settings.DATABASE_URL}")
        print("✅ Database configuration looks correct")
        return True
    except Exception as e:
        print(f"❌ Database configuration error: {e}")
        return False


def check_environment():
    """Check environment variables."""
    settings = get_settings()
    
    print("\n📋 Environment Configuration:")
    print(f"  Database: {settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}")
    print(f"  Redis: {settings.REDIS_URL}")
    print(f"  SMTP: {settings.SMTP_HOST}:{settings.SMTP_PORT}")
    print(f"  Admin Email: {settings.ADMIN_EMAIL}")
    
    return True


def create_env_file():
    """Create .env file from env.example if it doesn't exist."""
    env_file = Path(".env")
    env_example = Path("env.example")
    
    if not env_file.exists() and env_example.exists():
        print("📝 Creating .env file from env.example...")
        env_file.write_text(env_example.read_text())
        print("✅ .env file created. Please edit it with your configuration.")
        return True
    elif env_file.exists():
        print("✅ .env file already exists")
        return True
    else:
        print("❌ env.example file not found")
        return False


async def setup_database():
    """Set up database tables and create admin user."""
    try:
        print("\n🗄️  Setting up database...")
        
        # Import here to avoid circular imports
        from sqlalchemy.ext.asyncio import create_async_engine
        from app.db.base import Base
        
        settings = get_settings()
        engine = create_async_engine(settings.DATABASE_URL)
        
        # Create tables
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        
        print("✅ Database tables created")
        
        # Create admin user
        print("👤 Creating admin user...")
        await create_super_admin()
        
        await engine.dispose()
        return True
        
    except Exception as e:
        print(f"❌ Database setup failed: {e}")
        return False


def main():
    """Main setup function."""
    print("🚀 Mara Sports Festival Backend Setup")
    print("=" * 40)
    
    # Check requirements
    if not check_requirements():
        sys.exit(1)
    
    # Check environment
    if not check_environment():
        sys.exit(1)
    
    # Create .env file
    if not create_env_file():
        sys.exit(1)
    
    # Setup database
    try:
        asyncio.run(setup_database())
    except Exception as e:
        print(f"❌ Setup failed: {e}")
        sys.exit(1)
    
    print("\n🎉 Setup completed successfully!")
    print("\nNext steps:")
    print("1. Edit .env file with your configuration")
    print("2. Run: uvicorn app.main:app --reload")
    print("3. Visit: http://localhost:8000/docs")
    print("\nAdmin credentials:")
    settings = get_settings()
    print(f"  Email: {settings.ADMIN_EMAIL}")
    print(f"  Password: {settings.ADMIN_PASSWORD}")


if __name__ == "__main__":
    main()

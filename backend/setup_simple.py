#!/usr/bin/env python3
"""
Simple setup script for Mara Sports Backend
Creates .env file and provides setup instructions
"""

import os
import shutil

def create_env_file():
    """Create .env file from template."""
    if os.path.exists('.env'):
        print("✅ .env file already exists")
        return
    
    if os.path.exists('env.example'):
        shutil.copy('env.example', '.env')
        print("✅ Created .env file from env.example")
        print("📝 Please edit .env file with your database credentials")
    else:
        print("❌ env.example file not found")

def main():
    """Main setup function."""
    print("🏆 Mara Sports Backend Setup")
    print("=" * 40)
    
    # Create .env file
    create_env_file()
    
    print("\n📋 Next Steps:")
    print("1. Edit .env file with your database credentials")
    print("2. Create MySQL database: mysql -u root -p < database_schema.sql")
    print("3. Install dependencies: pip install -r requirements.txt")
    print("4. Start the server: python start.py")
    print("\n🎯 Your backend will be available at: http://localhost:8000")
    print("📚 API Documentation: http://localhost:8000/docs")

if __name__ == "__main__":
    main()

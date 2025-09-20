# Mara Sports Festival Backend

A FastAPI-based backend for the Mara Sports Festival registration and management system.

## Quick Start

### 1. Prerequisites
- Python 3.8+
- MySQL 8.0+
- Virtual environment (recommended)

### 2. Setup

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp env.example .env
# Edit .env with your database credentials

# Create database
mysql -u root -p < database_schema.sql

# Start the server
python start.py
```

### 3. Access
- API: http://localhost:8000
- Documentation: http://localhost:8000/docs
- Health Check: http://localhost:8000/healthz

## Environment Variables

The `.env` file contains only essential variables:

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=mara_sports_festival
DB_USER=root
DB_PASSWORD=your_password
DATABASE_URL=mysql+pymysql://root:password@localhost:3306/mara_sports_festival

# Admin Account
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin_password

# CORS (Frontend URLs)
CORS_ORIGINS=http://localhost:3000,http://localhost:8080
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/logout` - User logout

### Students
- `GET /api/v1/students` - Get all students
- `POST /api/v1/students` - Create student
- `GET /api/v1/students/{id}` - Get student by ID

### Institutions
- `GET /api/v1/institutions` - Get all institutions
- `POST /api/v1/institutions` - Create institution
- `GET /api/v1/institutions/{id}` - Get institution by ID

### Sports
- `GET /api/v1/sports` - Get all sports
- `GET /api/v1/sports/{id}` - Get sport by ID
- `GET /api/v1/sports/{id}/categories` - Get sport categories

### Dashboard
- `GET /api/v1/dashboard/stats` - Get dashboard statistics

## Database

The database includes:
- Pre-created admin user
- Sample sports and categories
- Proper relationships between all entities

## Development

```bash
# Run with auto-reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Run tests
pytest

# Check code style
flake8 app/
```

## Production

For production deployment, make sure to:
1. Change the `SECRET_KEY` in `.env`
2. Set `DEBUG=false`
3. Use a proper database (not localhost)
4. Configure proper CORS origins
5. Set up proper logging
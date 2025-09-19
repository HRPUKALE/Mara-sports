"""
Mara Sports Festival Backend API

A FastAPI application for sports event management with database integration.
"""

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import List
import uvicorn
import uuid
from datetime import datetime, timedelta

from app.core.config import get_settings
from app.db.database import get_db, engine, Base
from app.models.user import User
from app.models.student import Student
from app.models.institution import Institution
from app.models.sport import Sport, SportCategory
from app.schemas.user import UserResponse
from app.schemas.student import StudentResponse, StudentCreate, StudentUpdate, StudentRegistration
from app.schemas.institution import InstitutionResponse, InstitutionCreate
from app.schemas.sport import SportResponse, SportCategoryResponse, SportWithCategories
from app.schemas.auth import OTPRequest, OTPVerify, OTPResponse, TokenResponse
from app.core.security import generate_otp, hash_otp, verify_otp, is_otp_expired, create_access_token, create_refresh_token
from app.services.email_service import EmailService

# Get settings
settings = get_settings()

# Create database tables
Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="Mara Sports Festival Backend API",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/healthz")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "message": "Mara Sports API is running"}

@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Welcome to Mara Sports Festival API",
        "version": settings.VERSION,
        "docs": "/docs"
    }

# ==================== AUTHENTICATION ENDPOINTS ====================

@app.post("/api/v1/auth/login")
async def login_user(login_data: dict, db: Session = Depends(get_db)):
    """Login a user and return access token."""
    email = login_data.get("email")
    password = login_data.get("password")
    
    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password are required")
    
    # Find user by email
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Verify password
    if not User.verify_password(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Check if user is active
    if not user.is_active:
        raise HTTPException(status_code=401, detail="Account is deactivated")
    
    # Update last login
    user.last_login_at = datetime.utcnow()
    db.commit()
    
    # In a real app, generate JWT tokens here
    return {
        "message": "Login successful",
        "user_id": str(user.id),
        "email": user.email,
        "role": user.role,
        "is_verified": user.is_verified,
        "token": "mock_jwt_token"  # Replace with real JWT token
    }

@app.post("/api/v1/auth/logout")
async def logout_user():
    """Logout a user."""
    return {"message": "Logout successful"}

@app.post("/api/v1/auth/register")
async def register_user(user_data: dict, db: Session = Depends(get_db)):
    """Register a new user."""
    email = user_data.get("email")
    password = user_data.get("password")
    role = user_data.get("role", "student")
    
    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password are required")
    
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    hashed_password = User.hash_password(password)
    new_user = User(
        id=str(uuid.uuid4()),
        email=email,
        hashed_password=hashed_password,
        role=role,
        is_active=True,
        is_verified=False
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {
        "message": "User registered successfully",
        "user_id": str(new_user.id),
        "email": new_user.email,
        "role": new_user.role
    }

# ==================== USER ENDPOINTS ====================

@app.get("/api/v1/users", response_model=List[UserResponse])
async def get_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all users."""
    users = db.query(User).offset(skip).limit(limit).all()
    return users

@app.get("/api/v1/users/{user_id}", response_model=UserResponse)
async def get_user(user_id: str, db: Session = Depends(get_db)):
    """Get user by ID."""
    user_obj = db.query(User).filter(User.id == user_id).first()
    if not user_obj:
        raise HTTPException(status_code=404, detail="User not found")
    return user_obj

# ==================== STUDENT ENDPOINTS ====================

@app.get("/api/v1/students", response_model=List[StudentResponse])
async def get_students(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all students."""
    students = db.query(Student).offset(skip).limit(limit).all()
    return students

@app.get("/api/v1/students/{student_id}", response_model=StudentResponse)
async def get_student(student_id: str, db: Session = Depends(get_db)):
    """Get student by ID."""
    student_obj = db.query(Student).filter(Student.id == student_id).first()
    if not student_obj:
        raise HTTPException(status_code=404, detail="Student not found")
    return student_obj

@app.post("/api/v1/students", response_model=StudentResponse)
async def create_student(student_data: StudentCreate, db: Session = Depends(get_db)):
    """Create a new student."""
    # For now, just return a mock response
    # In a real implementation, you would create the student in the database
    return {
        "id": "mock-student-id",
        "user_id": student_data.user_id,
        "first_name": student_data.first_name,
        "last_name": student_data.last_name,
        "gender": student_data.gender,
        "date_of_birth": student_data.date_of_birth,
        "phone": student_data.phone,
        "address": student_data.address,
        "medical_info": student_data.medical_info,
        "guardian": student_data.guardian,
        "institution_id": student_data.institution_id,
        "student_id": student_data.student_id,
        "profile_picture": student_data.profile_picture,
        "is_active": True,
        "created_at": "2024-01-01T00:00:00",
        "updated_at": "2024-01-01T00:00:00"
    }

# ==================== INSTITUTION ENDPOINTS ====================

@app.get("/api/v1/institutions", response_model=List[InstitutionResponse])
async def get_institutions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all institutions."""
    institutions = db.query(Institution).offset(skip).limit(limit).all()
    return institutions

@app.get("/api/v1/institutions/{institution_id}", response_model=InstitutionResponse)
async def get_institution(institution_id: str, db: Session = Depends(get_db)):
    """Get institution by ID."""
    institution_obj = db.query(Institution).filter(Institution.id == institution_id).first()
    if not institution_obj:
        raise HTTPException(status_code=404, detail="Institution not found")
    return institution_obj

@app.post("/api/v1/institutions", response_model=InstitutionResponse)
async def create_institution(institution_data: InstitutionCreate, db: Session = Depends(get_db)):
    """Create a new institution."""
    # For now, just return a mock response
    return {
        "id": "mock-institution-id",
        "user_id": institution_data.user_id,
        "name": institution_data.name,
        "email": institution_data.email,
        "phone": institution_data.phone,
        "address": institution_data.address,
        "institution_type": institution_data.institution_type,
        "registration_number": institution_data.registration_number,
        "website": institution_data.website,
        "description": institution_data.description,
        "contact_person_name": institution_data.contact_person_name,
        "contact_person_phone": institution_data.contact_person_phone,
        "contact_person_email": institution_data.contact_person_email,
        "logo_url": institution_data.logo_url,
        "verified": False,
        "verification_date": None,
        "verification_notes": None,
        "billing_info": None,
        "is_active": True,
        "created_at": "2024-01-01T00:00:00",
        "updated_at": "2024-01-01T00:00:00"
    }

# ==================== SPORT ENDPOINTS ====================

@app.get("/api/v1/sports", response_model=List[SportResponse])
async def get_sports(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all sports."""
    sports = db.query(Sport).offset(skip).limit(limit).all()
    return sports

@app.get("/api/v1/sports/{sport_id}", response_model=SportResponse)
async def get_sport(sport_id: str, db: Session = Depends(get_db)):
    """Get sport by ID."""
    sport_obj = db.query(Sport).filter(Sport.id == sport_id).first()
    if not sport_obj:
        raise HTTPException(status_code=404, detail="Sport not found")
    return sport_obj

@app.get("/api/v1/sports/{sport_id}/categories", response_model=List[SportCategoryResponse])
async def get_sport_categories(sport_id: str, db: Session = Depends(get_db)):
    """Get categories for a specific sport."""
    categories = db.query(SportCategory).filter(SportCategory.sport_id == sport_id).all()
    return categories

# ==================== DASHBOARD ENDPOINTS ====================

@app.get("/api/v1/dashboard/stats")
async def get_dashboard_stats(db: Session = Depends(get_db)):
    """Get dashboard statistics."""
    total_students = db.query(Student).count()
    total_institutions = db.query(Institution).count()
    total_sports = db.query(Sport).count()
    
    return {
        "total_students": total_students,
        "total_institutions": total_institutions,
        "total_sports": total_sports,
        "active_registrations": 0,  # Mock data for now
        "pending_approvals": 0,     # Mock data for now
    }

# ==================== ADMIN DASHBOARD ENDPOINTS ====================

@app.get("/api/v1/admin/dashboard/stats")
async def get_admin_dashboard_stats(db: Session = Depends(get_db)):
    """Get admin dashboard statistics."""
    total_students = db.query(Student).count()
    total_institutions = db.query(Institution).count()
    total_sports = db.query(Sport).count()
    
    # Calculate additional stats
    active_institutions = db.query(Institution).filter(Institution.is_active == True).count()
    verified_institutions = db.query(Institution).filter(Institution.verified == True).count()
    
    return {
        "total_institutions": total_institutions,
        "active_institutions": active_institutions,
        "verified_institutions": verified_institutions,
        "total_students": total_students,
        "total_sports": total_sports,
        "total_sponsorships": 0,  # Mock data for now
        "total_payments": 0,      # Mock data for now
        "pending_payments": 0,    # Mock data for now
    }

@app.get("/api/v1/admin/institutions")
async def get_admin_institutions(
    search: str = None,
    sport: str = None,
    status: str = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get institutions for admin dashboard."""
    query = db.query(Institution)
    
    if search:
        query = query.filter(Institution.name.contains(search))
    
    if status == "active":
        query = query.filter(Institution.is_active == True)
    elif status == "inactive":
        query = query.filter(Institution.is_active == False)
    elif status == "verified":
        query = query.filter(Institution.verified == True)
    elif status == "pending":
        query = query.filter(Institution.verified == False)
    
    institutions = query.offset(skip).limit(limit).all()
    
    # Format response for admin dashboard
    result = []
    for inst in institutions:
        result.append({
            "id": inst.id,
            "name": inst.name,
            "contact_person": inst.contact_person_name or "N/A",
            "email": inst.email,
            "phone": inst.phone,
            "institution_type": inst.institution_type,
            "verified": inst.verified,
            "is_active": inst.is_active,
            "created_at": inst.created_at.isoformat() if inst.created_at else None,
            "sports_enrolled": 0,  # Mock data for now
            "payment_status": "Pending",  # Mock data for now
            "total_amount": 0,  # Mock data for now
            "paid_amount": 0,   # Mock data for now
        })
    
    return result

@app.get("/api/v1/admin/students")
async def get_admin_students(
    search: str = None,
    institution: str = None,
    status: str = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get students for admin dashboard."""
    query = db.query(Student)
    
    if search:
        query = query.filter(
            (Student.first_name.contains(search)) |
            (Student.last_name.contains(search)) |
            (Student.student_id.contains(search))
        )
    
    if institution:
        query = query.filter(Student.institution_id == institution)
    
    if status == "active":
        query = query.filter(Student.is_active == True)
    elif status == "inactive":
        query = query.filter(Student.is_active == False)
    
    students = query.offset(skip).limit(limit).all()
    
    # Format response for admin dashboard
    result = []
    for student in students:
        result.append({
            "id": student.id,
            "first_name": student.first_name,
            "last_name": student.last_name,
            "full_name": f"{student.first_name} {student.last_name}",
            "email": student.user.email if student.user else "N/A",
            "student_id": student.student_id,
            "gender": student.gender,
            "institution_name": student.institution.name if student.institution else "N/A",
            "is_active": student.is_active,
            "created_at": student.created_at.isoformat() if student.created_at else None,
        })
    
    return result

@app.get("/api/v1/admin/sports")
async def get_admin_sports(db: Session = Depends(get_db)):
    """Get sports for admin dashboard."""
    sports = db.query(Sport).all()
    
    result = []
    for sport in sports:
        # Get categories for each sport
        categories = db.query(SportCategory).filter(SportCategory.sport_id == sport.id).all()
        
        result.append({
            "id": sport.id,
            "name": sport.name,
            "slug": sport.slug,
            "description": sport.description,
            "is_active": sport.is_active,
            "total_participants": 0,  # Mock data for now
            "categories": [
                {
                    "id": cat.id,
                    "name": cat.name,
                    "age_from": cat.age_from,
                    "age_to": cat.age_to,
                    "gender_allowed": cat.gender_allowed,
                    "fee": float(cat.fee),
                    "max_participants": cat.max_participants,
                    "participants": 0,  # Mock data for now
                }
                for cat in categories
            ],
            "created_at": sport.created_at.isoformat() if sport.created_at else None,
        })
    
    return result

@app.get("/api/v1/admin/payments")
async def get_admin_payments(
    search: str = None,
    status: str = None,
    date_from: str = None,
    date_to: str = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get payments for admin dashboard."""
    # Mock data for now - implement when payment system is ready
    return []

@app.get("/api/v1/admin/invoices")
async def get_admin_invoices(
    search: str = None,
    status: str = None,
    institution: str = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get invoices for admin dashboard."""
    # Mock data for now - implement when invoice system is ready
    return []

@app.get("/api/v1/admin/sponsorships")
async def get_admin_sponsorships(db: Session = Depends(get_db)):
    """Get sponsorships for admin dashboard."""
    # Mock data for now - implement when sponsorship system is ready
    return []

# ===== OTP STORAGE (In-memory for demo) =====
# In production, use proper database table
otp_storage = {}

# ===== EMAIL SERVICE =====
email_service = EmailService()

# ===== OTP ENDPOINTS =====

@app.post("/api/v1/auth/otp/send", response_model=OTPResponse)
async def send_otp(request: OTPRequest, db: Session = Depends(get_db)):
    """Send OTP to email or phone."""
    try:
        # Get email or phone from request
        email_or_phone = request.email or request.phone
        if not email_or_phone:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email or phone is required"
            )
        
        # Generate OTP
        otp_code = generate_otp()
        hashed_otp = hash_otp(otp_code)
        expires_at = datetime.utcnow() + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)
        
        # Store OTP in memory (in production, use database)
        otp_id = str(uuid.uuid4())
        otp_storage[otp_id] = {
            "email_or_phone": email_or_phone,
            "code": otp_code,
            "hashed_code": hashed_otp,
            "expires_at": expires_at,
            "is_used": False,
            "purpose": request.purpose
        }
        
        # Send OTP via email
        user_type = "student" if request.purpose == "login" else "institution"
        email_sent = email_service.send_otp_email(email_or_phone, otp_code, user_type)
        
        if not email_sent:
            print(f"Failed to send email to {email_or_phone}")
            # Still return success to avoid exposing email failures to frontend
            # In production, you might want to handle this differently
        
        print(f"OTP sent to {email_or_phone} via email (ID: {otp_id})")
        
        return OTPResponse(
            otp_id=otp_id,
            expires_at=expires_at,
            message="OTP sent successfully"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send OTP: {str(e)}"
        )

# ===== STUDENT REGISTRATION ENDPOINTS =====

@app.post("/api/v1/students/register", response_model=StudentResponse)
async def register_student(student_data: StudentRegistration, db: Session = Depends(get_db)):
    """Register a new student with complete profile information."""
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == student_data.email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="User with this email already exists")
        
        # Create user account
        user = User(
            id=str(uuid.uuid4()),
            email=student_data.email,
            full_name=f"{student_data.first_name} {student_data.last_name}",
            role="student",
            is_active=True,
            is_verified=False
        )
        user.set_password(student_data.password)
        db.add(user)
        db.commit()
        db.refresh(user)
        
        # Create student profile
        student = Student(
            id=str(uuid.uuid4()),
            user_id=user.id,
            first_name=student_data.first_name,
            middle_name=student_data.middle_name,
            last_name=student_data.last_name,
            gender=student_data.gender,
            date_of_birth=student_data.date_of_birth,
            phone=student_data.phone,
            email=student_data.email,
            institution_id=student_data.institution_id,
            institution_name=student_data.institution_name,
            student_id=student_data.student_id,
            parent_guardian_name=student_data.parent_guardian_name,
            parent_phone=student_data.parent_phone,
            parent_email=student_data.parent_email,
            emergency_contact_name=student_data.emergency_contact_name,
            emergency_contact_relation=student_data.emergency_contact_relation,
            emergency_contact_phone=student_data.emergency_contact_phone,
            emergency_contact_email=student_data.emergency_contact_email,
            medical_question_1=student_data.medical_question_1,
            medical_question_2=student_data.medical_question_2,
            has_allergies=student_data.has_allergies,
            allergies_details=student_data.allergies_details,
            participation_type=student_data.participation_type,
            selected_sports=student_data.selected_sports,
            student_id_image=student_data.student_id_image,
            age_proof_image=student_data.age_proof_image,
            address=student_data.address,
            medical_info=student_data.medical_info,
            guardian=student_data.guardian,
            profile_picture=student_data.profile_picture,
            is_active=True,
            is_verified=False
        )
        
        db.add(student)
        db.commit()
        db.refresh(student)
        
        return student
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@app.get("/api/v1/students/{student_id}", response_model=StudentResponse)
async def get_student(student_id: str, db: Session = Depends(get_db)):
    """Get student profile by ID."""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student

@app.put("/api/v1/students/{student_id}", response_model=StudentResponse)
async def update_student(student_id: str, student_data: StudentUpdate, db: Session = Depends(get_db)):
    """Update student profile."""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Update fields
    update_data = student_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(student, field, value)
    
    student.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(student)
    
    return student

@app.get("/api/v1/students", response_model=List[StudentResponse])
async def get_students(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get list of students with pagination."""
    students = db.query(Student).offset(skip).limit(limit).all()
    return students

@app.delete("/api/v1/students/{student_id}")
async def delete_student(student_id: str, db: Session = Depends(get_db)):
    """Soft delete student (mark as inactive)."""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    student.is_active = False
    student.updated_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Student deleted successfully"}

@app.get("/api/v1/students/user/{user_id}", response_model=StudentResponse)
async def get_student_by_user_id(user_id: str, db: Session = Depends(get_db)):
    """Get student profile by user ID."""
    student = db.query(Student).filter(Student.user_id == user_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    return student

@app.post("/api/v1/auth/otp/verify", response_model=TokenResponse)
async def verify_otp_endpoint(request: OTPVerify, db: Session = Depends(get_db)):
    """Verify OTP and return authentication tokens."""
    try:
        # Get OTP from storage
        otp_data = otp_storage.get(str(request.otp_id))
        if not otp_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="OTP not found or expired"
            )
        
        # Check if OTP is expired
        if datetime.utcnow() > otp_data["expires_at"]:
            # Clean up expired OTP
            del otp_storage[str(request.otp_id)]
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="OTP has expired"
            )
        
        # Check if OTP is already used
        if otp_data["is_used"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="OTP has already been used"
            )
        
        # Verify OTP code
        if not verify_otp(request.code, otp_data["hashed_code"]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid OTP code"
            )
        
        # Mark OTP as used
        otp_data["is_used"] = True
        
        # Get or create user
        email_or_phone = otp_data["email_or_phone"]
        user = db.query(User).filter(User.email == email_or_phone).first()
        
        if not user:
            # Create a new user
            user = User(
                id=str(uuid.uuid4()),
                email=email_or_phone,
                role="student",  # Default role
                is_active=True,
                is_verified=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        
        # Create tokens
        access_token = create_access_token(data={"sub": user.email, "user_id": str(user.id)})
        refresh_token = create_refresh_token(data={"sub": user.email, "user_id": str(user.id)})
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            refresh_expires_in=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to verify OTP: {str(e)}"
        )

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
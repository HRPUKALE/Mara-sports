"""
Repository pattern implementation for database operations.

Provides base repository class with common CRUD operations and
specialized repositories for each model.
"""

from typing import Any, Dict, Generic, List, Optional, Type, TypeVar, Union
from uuid import UUID

from sqlalchemy import and_, desc, func, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.db.base import Base, SoftDeleteMixin

ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    """Base repository class with common CRUD operations."""
    
    def __init__(self, model: Type[ModelType], db: AsyncSession):
        self.model = model
        self.db = db
    
    async def create(self, obj_in: Dict[str, Any]) -> ModelType:
        """Create a new record."""
        db_obj = self.model(**obj_in)
        self.db.add(db_obj)
        await self.db.commit()
        await self.db.refresh(db_obj)
        return db_obj
    
    async def get(self, id: UUID) -> Optional[ModelType]:
        """Get a record by ID."""
        result = await self.db.execute(select(self.model).where(self.model.id == id))
        return result.scalar_one_or_none()
    
    async def get_multi(
        self,
        skip: int = 0,
        limit: int = 100,
        filters: Optional[Dict[str, Any]] = None,
        order_by: Optional[str] = None
    ) -> List[ModelType]:
        """Get multiple records with pagination and filtering."""
        query = select(self.model)
        
        # Apply filters
        if filters:
            for key, value in filters.items():
                if hasattr(self.model, key):
                    if isinstance(value, list):
                        query = query.where(getattr(self.model, key).in_(value))
                    else:
                        query = query.where(getattr(self.model, key) == value)
        
        # Apply soft delete filter if model supports it
        if hasattr(self.model, 'is_active'):
            query = query.where(self.model.is_active == True)
        
        # Apply ordering
        if order_by:
            if order_by.startswith('-'):
                query = query.order_by(desc(getattr(self.model, order_by[1:])))
            else:
                query = query.order_by(getattr(self.model, order_by))
        else:
            query = query.order_by(desc(self.model.created_at))
        
        # Apply pagination
        query = query.offset(skip).limit(limit)
        
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def update(self, id: UUID, obj_in: Dict[str, Any]) -> Optional[ModelType]:
        """Update a record by ID."""
        db_obj = await self.get(id)
        if not db_obj:
            return None
        
        for key, value in obj_in.items():
            if hasattr(db_obj, key):
                setattr(db_obj, key, value)
        
        await self.db.commit()
        await self.db.refresh(db_obj)
        return db_obj
    
    async def delete(self, id: UUID) -> bool:
        """Delete a record by ID."""
        db_obj = await self.get(id)
        if not db_obj:
            return False
        
        # Soft delete if model supports it
        if hasattr(db_obj, 'is_active'):
            db_obj.is_active = False
            await self.db.commit()
        else:
            await self.db.delete(db_obj)
            await self.db.commit()
        
        return True
    
    async def hard_delete(self, id: UUID) -> bool:
        """Hard delete a record by ID."""
        db_obj = await self.get(id)
        if not db_obj:
            return False
        
        await self.db.delete(db_obj)
        await self.db.commit()
        return True
    
    async def count(self, filters: Optional[Dict[str, Any]] = None) -> int:
        """Count records with optional filtering."""
        query = select(func.count(self.model.id))
        
        # Apply filters
        if filters:
            for key, value in filters.items():
                if hasattr(self.model, key):
                    if isinstance(value, list):
                        query = query.where(getattr(self.model, key).in_(value))
                    else:
                        query = query.where(getattr(self.model, key) == value)
        
        # Apply soft delete filter if model supports it
        if hasattr(self.model, 'is_active'):
            query = query.where(self.model.is_active == True)
        
        result = await self.db.execute(query)
        return result.scalar()
    
    async def exists(self, id: UUID) -> bool:
        """Check if a record exists by ID."""
        result = await self.db.execute(select(self.model.id).where(self.model.id == id))
        return result.scalar_one_or_none() is not None
    
    async def search(
        self,
        search_term: str,
        search_fields: List[str],
        skip: int = 0,
        limit: int = 100
    ) -> List[ModelType]:
        """Search records by term across multiple fields."""
        query = select(self.model)
        
        # Build search conditions
        search_conditions = []
        for field in search_fields:
            if hasattr(self.model, field):
                search_conditions.append(
                    getattr(self.model, field).ilike(f"%{search_term}%")
                )
        
        if search_conditions:
            query = query.where(or_(*search_conditions))
        
        # Apply soft delete filter if model supports it
        if hasattr(self.model, 'is_active'):
            query = query.where(self.model.is_active == True)
        
        query = query.order_by(desc(self.model.created_at))
        query = query.offset(skip).limit(limit)
        
        result = await self.db.execute(query)
        return result.scalars().all()


class UserRepository(BaseRepository):
    """User repository with specialized methods."""
    
    async def get_by_email(self, email: str) -> Optional[ModelType]:
        """Get user by email."""
        result = await self.db.execute(
            select(self.model).where(self.model.email == email)
        )
        return result.scalar_one_or_none()
    
    async def get_by_role(self, role: str) -> List[ModelType]:
        """Get users by role."""
        result = await self.db.execute(
            select(self.model).where(self.model.role == role)
        )
        return result.scalars().all()
    
    async def get_active_users(self) -> List[ModelType]:
        """Get all active users."""
        result = await self.db.execute(
            select(self.model).where(
                and_(
                    self.model.is_active == True,
                    self.model.is_verified == True
                )
            )
        )
        return result.scalars().all()


class StudentRepository(BaseRepository):
    """Student repository with specialized methods."""
    
    async def get_by_user_id(self, user_id: UUID) -> Optional[ModelType]:
        """Get student by user ID."""
        result = await self.db.execute(
            select(self.model).where(self.model.user_id == user_id)
        )
        return result.scalar_one_or_none()
    
    async def get_by_institution(self, institution_id: UUID) -> List[ModelType]:
        """Get students by institution."""
        result = await self.db.execute(
            select(self.model).where(self.model.institution_id == institution_id)
        )
        return result.scalars().all()
    
    async def get_by_name(self, name: str) -> List[ModelType]:
        """Search students by name."""
        result = await self.db.execute(
            select(self.model).where(
                or_(
                    self.model.first_name.ilike(f"%{name}%"),
                    self.model.last_name.ilike(f"%{name}%"),
                    func.concat(
                        self.model.first_name, " ", self.model.last_name
                    ).ilike(f"%{name}%")
                )
            )
        )
        return result.scalars().all()


class InstitutionRepository(BaseRepository):
    """Institution repository with specialized methods."""
    
    async def get_by_user_id(self, user_id: UUID) -> Optional[ModelType]:
        """Get institution by user ID."""
        result = await self.db.execute(
            select(self.model).where(self.model.user_id == user_id)
        )
        return result.scalar_one_or_none()
    
    async def get_verified(self) -> List[ModelType]:
        """Get verified institutions."""
        result = await self.db.execute(
            select(self.model).where(self.model.verified == True)
        )
        return result.scalars().all()
    
    async def get_pending_verification(self) -> List[ModelType]:
        """Get institutions pending verification."""
        result = await self.db.execute(
            select(self.model).where(self.model.verified == False)
        )
        return result.scalars().all()


class RegistrationRepository(BaseRepository):
    """Registration repository with specialized methods."""
    
    async def get_by_student(self, student_id: UUID) -> List[ModelType]:
        """Get registrations by student."""
        result = await self.db.execute(
            select(self.model).where(self.model.student_id == student_id)
        )
        return result.scalars().all()
    
    async def get_by_sport_category(self, sport_category_id: UUID) -> List[ModelType]:
        """Get registrations by sport category."""
        result = await self.db.execute(
            select(self.model).where(self.model.sport_category_id == sport_category_id)
        )
        return result.scalars().all()
    
    async def get_by_status(self, status: str) -> List[ModelType]:
        """Get registrations by status."""
        result = await self.db.execute(
            select(self.model).where(self.model.status == status)
        )
        return result.scalars().all()
    
    async def get_active_registrations(self, student_id: UUID) -> List[ModelType]:
        """Get active registrations for a student."""
        result = await self.db.execute(
            select(self.model).where(
                and_(
                    self.model.student_id == student_id,
                    self.model.status.in_(["confirmed", "paid"])
                )
            )
        )
        return result.scalars().all()


class PaymentRepository(BaseRepository):
    """Payment repository with specialized methods."""
    
    async def get_by_registration(self, registration_id: UUID) -> Optional[ModelType]:
        """Get payment by registration."""
        result = await self.db.execute(
            select(self.model).where(self.model.registration_id == registration_id)
        )
        return result.scalar_one_or_none()
    
    async def get_by_institution(self, institution_id: UUID) -> List[ModelType]:
        """Get payments by institution."""
        result = await self.db.execute(
            select(self.model).where(self.model.institution_id == institution_id)
        )
        return result.scalars().all()
    
    async def get_by_status(self, status: str) -> List[ModelType]:
        """Get payments by status."""
        result = await self.db.execute(
            select(self.model).where(self.model.status == status)
        )
        return result.scalars().all()
    
    async def get_successful_payments(self) -> List[ModelType]:
        """Get all successful payments."""
        result = await self.db.execute(
            select(self.model).where(self.model.status == "success")
        )
        return result.scalars().all()


class NotificationRepository(BaseRepository):
    """Notification repository with specialized methods."""
    
    async def get_by_user(self, user_id: UUID) -> List[ModelType]:
        """Get notifications by user."""
        result = await self.db.execute(
            select(self.model).where(self.model.user_id == user_id)
        )
        return result.scalars().all()
    
    async def get_unread_by_user(self, user_id: UUID) -> List[ModelType]:
        """Get unread notifications by user."""
        result = await self.db.execute(
            select(self.model).where(
                and_(
                    self.model.user_id == user_id,
                    self.model.is_read == False
                )
            )
        )
        return result.scalars().all()
    
    async def get_by_type(self, notification_type: str) -> List[ModelType]:
        """Get notifications by type."""
        result = await self.db.execute(
            select(self.model).where(self.model.notification_type == notification_type)
        )
        return result.scalars().all()


class OTPRepository(BaseRepository):
    """OTP repository with specialized methods."""
    
    async def get_by_email_or_phone(self, email_or_phone: str) -> List[ModelType]:
        """Get OTPs by email or phone."""
        result = await self.db.execute(
            select(self.model).where(self.model.email_or_phone == email_or_phone)
        )
        return result.scalars().all()
    
    async def get_valid_otp(self, email_or_phone: str, purpose: str) -> Optional[ModelType]:
        """Get valid OTP for email/phone and purpose."""
        result = await self.db.execute(
            select(self.model).where(
                and_(
                    self.model.email_or_phone == email_or_phone,
                    self.model.purpose == purpose,
                    self.model.is_used == False,
                    self.model.expires_at > func.now()
                )
            )
        )
        return result.scalar_one_or_none()
    
    async def get_expired_otps(self) -> List[ModelType]:
        """Get expired OTPs for cleanup."""
        result = await self.db.execute(
            select(self.model).where(
                self.model.expires_at < func.now()
            )
        )
        return result.scalars().all()


class AuditLogRepository(BaseRepository):
    """Audit log repository with specialized methods."""
    
    async def get_by_user(self, user_id: UUID) -> List[ModelType]:
        """Get audit logs by user."""
        result = await self.db.execute(
            select(self.model).where(self.model.actor_user_id == user_id)
        )
        return result.scalars().all()
    
    async def get_by_action(self, action: str) -> List[ModelType]:
        """Get audit logs by action."""
        result = await self.db.execute(
            select(self.model).where(self.model.action == action)
        )
        return result.scalars().all()
    
    async def get_by_resource(self, resource_type: str, resource_id: UUID) -> List[ModelType]:
        """Get audit logs by resource."""
        result = await self.db.execute(
            select(self.model).where(
                and_(
                    self.model.resource_type == resource_type,
                    self.model.resource_id == resource_id
                )
            )
        )
        return result.scalars().all()
    
    async def get_failed_actions(self) -> List[ModelType]:
        """Get failed audit actions."""
        result = await self.db.execute(
            select(self.model).where(self.model.success == False)
        )
        return result.scalars().all()

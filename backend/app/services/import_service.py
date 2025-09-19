"""
Import service for data import operations.

Handles CSV/Excel file processing and data import.
"""

import csv
import io
import uuid
from typing import Optional, Dict, Any, List, Tuple
from uuid import UUID

import pandas as pd
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.db.models.student import Student
from app.db.models.user import User, UserRole
from app.db.repository import StudentRepository, UserRepository

settings = get_settings()


class ImportService:
    """Import service for data import operations."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.student_repo = StudentRepository(Student, db)
        self.user_repo = UserRepository(User, db)
    
    async def import_students_from_csv(
        self,
        file_content: bytes,
        institution_id: Optional[UUID] = None
    ) -> Dict[str, Any]:
        """Import students from CSV file."""
        try:
            # Parse CSV
            df = pd.read_csv(io.BytesIO(file_content))
            
            # Validate required columns
            required_columns = ["first_name", "last_name", "email", "gender", "date_of_birth"]
            missing_columns = [col for col in required_columns if col not in df.columns]
            if missing_columns:
                return {
                    "success": False,
                    "error": f"Missing required columns: {', '.join(missing_columns)}",
                    "processed": 0,
                    "successful": 0,
                    "failed": 0,
                    "errors": []
                }
            
            processed = 0
            successful = 0
            failed = 0
            errors = []
            
            # Process each row
            for index, row in df.iterrows():
                processed += 1
                
                try:
                    # Create user
                    user_data = {
                        "email": row["email"],
                        "role": UserRole.STUDENT,
                        "is_verified": True,
                        "is_active": True,
                    }
                    user = await self.user_repo.create(user_data)
                    
                    # Create student
                    student_data = {
                        "user_id": user.id,
                        "first_name": row["first_name"],
                        "last_name": row["last_name"],
                        "gender": row["gender"],
                        "date_of_birth": pd.to_datetime(row["date_of_birth"]).date(),
                        "institution_id": institution_id,
                        "student_id": row.get("student_id"),
                        "phone": row.get("phone"),
                        "address": self._parse_address(row),
                        "medical_info": self._parse_medical_info(row),
                        "guardian": self._parse_guardian_info(row),
                    }
                    await self.student_repo.create(student_data)
                    successful += 1
                    
                except Exception as e:
                    failed += 1
                    errors.append({
                        "row": index + 1,
                        "error": str(e),
                        "data": row.to_dict()
                    })
            
            return {
                "success": True,
                "processed": processed,
                "successful": successful,
                "failed": failed,
                "errors": errors
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "processed": 0,
                "successful": 0,
                "failed": 0,
                "errors": []
            }
    
    async def import_students_from_excel(
        self,
        file_content: bytes,
        institution_id: Optional[UUID] = None,
        sheet_name: str = "Students"
    ) -> Dict[str, Any]:
        """Import students from Excel file."""
        try:
            # Parse Excel
            df = pd.read_excel(io.BytesIO(file_content), sheet_name=sheet_name)
            
            # Convert to CSV format and process
            csv_content = df.to_csv(index=False).encode('utf-8')
            return await self.import_students_from_csv(csv_content, institution_id)
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "processed": 0,
                "successful": 0,
                "failed": 0,
                "errors": []
            }
    
    def _parse_address(self, row: pd.Series) -> Optional[Dict[str, Any]]:
        """Parse address information from row."""
        address_fields = ["street", "city", "state", "postal_code", "country"]
        address = {}
        
        for field in address_fields:
            if field in row and pd.notna(row[field]):
                address[field] = str(row[field])
        
        return address if address else None
    
    def _parse_medical_info(self, row: pd.Series) -> Optional[Dict[str, Any]]:
        """Parse medical information from row."""
        medical_fields = ["medical_conditions", "allergies", "medications"]
        medical_info = {}
        
        for field in medical_fields:
            if field in row and pd.notna(row[field]):
                medical_info[field] = str(row[field])
        
        return medical_info if medical_info else None
    
    def _parse_guardian_info(self, row: pd.Series) -> Optional[Dict[str, Any]]:
        """Parse guardian information from row."""
        guardian_fields = ["guardian_name", "guardian_phone", "guardian_email", "guardian_relation"]
        guardian = {}
        
        for field in guardian_fields:
            if field in row and pd.notna(row[field]):
                # Remove 'guardian_' prefix
                key = field.replace("guardian_", "")
                guardian[key] = str(row[field])
        
        return guardian if guardian else None
    
    async def validate_csv_structure(self, file_content: bytes) -> Dict[str, Any]:
        """Validate CSV file structure."""
        try:
            df = pd.read_csv(io.BytesIO(file_content))
            
            required_columns = ["first_name", "last_name", "email", "gender", "date_of_birth"]
            optional_columns = [
                "student_id", "phone", "street", "city", "state", "postal_code", "country",
                "medical_conditions", "allergies", "medications",
                "guardian_name", "guardian_phone", "guardian_email", "guardian_relation"
            ]
            
            missing_required = [col for col in required_columns if col not in df.columns]
            present_optional = [col for col in optional_columns if col in df.columns]
            
            return {
                "valid": len(missing_required) == 0,
                "missing_required": missing_required,
                "present_optional": present_optional,
                "total_columns": len(df.columns),
                "total_rows": len(df)
            }
            
        except Exception as e:
            return {
                "valid": False,
                "error": str(e),
                "missing_required": [],
                "present_optional": [],
                "total_columns": 0,
                "total_rows": 0
            }
    
    async def get_import_template(self) -> bytes:
        """Get CSV import template."""
        template_data = {
            "first_name": ["John", "Jane"],
            "last_name": ["Doe", "Smith"],
            "email": ["john.doe@example.com", "jane.smith@example.com"],
            "gender": ["male", "female"],
            "date_of_birth": ["2000-01-15", "2001-05-20"],
            "student_id": ["STU001", "STU002"],
            "phone": ["+1234567890", "+1234567891"],
            "street": ["123 Main St", "456 Oak Ave"],
            "city": ["New York", "Los Angeles"],
            "state": ["NY", "CA"],
            "postal_code": ["10001", "90210"],
            "country": ["USA", "USA"],
            "medical_conditions": ["None", "Asthma"],
            "allergies": ["None", "Peanuts"],
            "medications": ["None", "Inhaler"],
            "guardian_name": ["Jane Doe", "John Smith"],
            "guardian_phone": ["+1234567892", "+1234567893"],
            "guardian_email": ["jane.doe@example.com", "john.smith@example.com"],
            "guardian_relation": ["Mother", "Father"]
        }
        
        df = pd.DataFrame(template_data)
        return df.to_csv(index=False).encode('utf-8')
    
    async def get_import_stats(self) -> Dict[str, Any]:
        """Get import statistics."""
        total_students = await self.student_repo.count()
        total_users = await self.user_repo.count()
        
        return {
            "total_students": total_students,
            "total_users": total_users,
            "import_success_rate": 95.0  # TODO: Calculate actual success rate
        }

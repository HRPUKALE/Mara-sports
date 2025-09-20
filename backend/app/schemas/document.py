"""
Document schemas for request/response validation.

Handles file upload and document management data serialization.
"""

from enum import Enum
from typing import Optional, Dict, Any
from uuid import UUID

from pydantic import BaseModel, Field, validator

from app.schemas.common import BaseResponse


class DocumentType(str, Enum):
    """Document type enumeration."""
    PROFILE_PICTURE = "profile_picture"
    ID_PROOF = "id_proof"
    ADDRESS_PROOF = "address_proof"
    MEDICAL_CERTIFICATE = "medical_certificate"
    BIRTH_CERTIFICATE = "birth_certificate"
    GUARDIAN_ID = "guardian_id"
    INSTITUTION_REGISTRATION = "institution_registration"
    SPONSORSHIP_DOCUMENT = "sponsorship_document"
    PAYMENT_RECEIPT = "payment_receipt"
    GENERAL = "general"


class DocumentOwnerType(str, Enum):
    """Document owner type enumeration."""
    STUDENT = "student"
    INSTITUTION = "institution"
    REGISTRATION = "registration"


class DocumentUpload(BaseModel):
    """Document upload schema."""
    
    owner_type: DocumentOwnerType = Field(description="Document owner type")
    owner_id: UUID = Field(description="Owner ID")
    document_type: DocumentType = Field(description="Document type")
    description: Optional[str] = Field(default=None, description="Document description")
    is_public: bool = Field(default=False, description="Is public document")
    metadata: Optional[Dict[str, Any]] = Field(default=None, description="Additional metadata")
    
    class Config:
        json_schema_extra = {
            "example": {
                "owner_type": "student",
                "owner_id": "123e4567-e89b-12d3-a456-426614174000",
                "document_type": "id_proof",
                "description": "Government issued ID",
                "is_public": False,
                "metadata": {
                    "expiry_date": "2025-12-31",
                    "document_number": "ID123456789"
                }
            }
        }


class DocumentResponse(BaseModel):
    """Document response schema."""
    
    id: UUID = Field(description="Document ID")
    owner_type: DocumentOwnerType = Field(description="Document owner type")
    owner_id: UUID = Field(description="Owner ID")
    filename: str = Field(description="Filename")
    original_filename: str = Field(description="Original filename")
    mime_type: str = Field(description="MIME type")
    file_size: int = Field(description="File size in bytes")
    storage_path: str = Field(description="Storage path")
    storage_provider: str = Field(description="Storage provider")
    storage_bucket: Optional[str] = Field(default=None, description="Storage bucket")
    document_type: DocumentType = Field(description="Document type")
    description: Optional[str] = Field(default=None, description="Document description")
    uploaded_by: Optional[UUID] = Field(default=None, description="Uploaded by user ID")
    is_verified: bool = Field(description="Is verified")
    is_public: bool = Field(description="Is public")
    virus_scan_status: Optional[str] = Field(default=None, description="Virus scan status")
    metadata: Optional[Dict[str, Any]] = Field(default=None, description="Additional metadata")
    file_extension: str = Field(description="File extension")
    is_image: bool = Field(description="Is image file")
    is_pdf: bool = Field(description="Is PDF file")
    is_document: bool = Field(description="Is document file")
    is_spreadsheet: bool = Field(description="Is spreadsheet file")
    file_size_mb: float = Field(description="File size in MB")
    file_size_kb: float = Field(description="File size in KB")
    is_virus_clean: bool = Field(description="Is virus clean")
    is_virus_infected: bool = Field(description="Is virus infected")
    virus_scan_pending: bool = Field(description="Virus scan pending")
    can_be_downloaded: bool = Field(description="Can be downloaded")
    created_at: str = Field(description="Creation timestamp")
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "123e4567-e89b-12d3-a456-426614174000",
                "owner_type": "student",
                "owner_id": "123e4567-e89b-12d3-a456-426614174001",
                "filename": "doc_1234567890_id_proof.pdf",
                "original_filename": "id_proof.pdf",
                "mime_type": "application/pdf",
                "file_size": 1024000,
                "storage_path": "documents/student/1234567890_id_proof.pdf",
                "storage_provider": "s3",
                "storage_bucket": "mara-sports-documents",
                "document_type": "id_proof",
                "description": "Government issued ID",
                "uploaded_by": "123e4567-e89b-12d3-a456-426614174002",
                "is_verified": True,
                "is_public": False,
                "virus_scan_status": "clean",
                "metadata": {
                    "expiry_date": "2025-12-31",
                    "document_number": "ID123456789"
                },
                "file_extension": "pdf",
                "is_image": False,
                "is_pdf": True,
                "is_document": True,
                "is_spreadsheet": False,
                "file_size_mb": 1.0,
                "file_size_kb": 1024.0,
                "is_virus_clean": True,
                "is_virus_infected": False,
                "virus_scan_pending": False,
                "can_be_downloaded": True,
                "created_at": "2024-01-01T00:00:00Z"
            }
        }

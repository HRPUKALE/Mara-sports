"""
Document model for file storage and management.

Supports multiple document types and owners (student, institution, registration)
with secure storage and metadata tracking.
"""

from enum import Enum
from typing import Optional
from uuid import UUID

from sqlalchemy import String, Integer, ForeignKey, Text, Boolean
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class DocumentOwnerType(str, Enum):
    """Document owner type enumeration."""
    STUDENT = "student"
    INSTITUTION = "institution"
    REGISTRATION = "registration"


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


class Document(Base):
    """Document model for file storage and management."""
    
    __tablename__ = "documents"
    
    # Owner information
    owner_type: Mapped[DocumentOwnerType] = mapped_column(
        String(20),
        nullable=False,
        index=True
    )
    owner_id: Mapped[UUID] = mapped_column(
        PostgresUUID(as_uuid=True),
        nullable=False,
        index=True
    )
    
    # File information
    filename: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )
    original_filename: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )
    mime_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )
    file_size: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )
    
    # Storage information
    storage_path: Mapped[str] = mapped_column(
        String(500),
        nullable=False
    )
    storage_provider: Mapped[str] = mapped_column(
        String(50),
        default="local",
        nullable=False
    )
    storage_bucket: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True
    )
    
    # Document metadata
    document_type: Mapped[DocumentType] = mapped_column(
        String(50),
        default=DocumentType.GENERAL,
        nullable=False
    )
    description: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
    )
    
    # Upload information
    uploaded_by: Mapped[UUID] = mapped_column(
        PostgresUUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    
    # Security and validation
    is_verified: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False
    )
    is_public: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False
    )
    virus_scan_status: Mapped[Optional[str]] = mapped_column(
        String(20),
        nullable=True
    )
    
    # Additional metadata
    metadata: Mapped[Optional[dict]] = mapped_column(
        Text,
        nullable=True
    )
    
    # Relationships
    uploaded_by_user = relationship("User", foreign_keys=[uploaded_by])
    student_owner = relationship(
        "Student",
        foreign_keys=[owner_id],
        primaryjoin="and_(Document.owner_id == Student.id, Document.owner_type == 'student')"
    )
    institution_owner = relationship(
        "Institution",
        foreign_keys=[owner_id],
        primaryjoin="and_(Document.owner_id == Institution.id, Document.owner_type == 'institution')"
    )
    registration_owner = relationship(
        "Registration",
        foreign_keys=[owner_id],
        primaryjoin="and_(Document.owner_id == Registration.id, Document.owner_type == 'registration')"
    )
    
    def __repr__(self) -> str:
        return f"<Document(id={self.id}, filename={self.filename}, owner_type={self.owner_type}, owner_id={self.owner_id})>"
    
    @property
    def file_extension(self) -> str:
        """Get file extension from filename."""
        if '.' in self.filename:
            return self.filename.split('.')[-1].lower()
        return ''
    
    @property
    def is_image(self) -> bool:
        """Check if document is an image."""
        image_types = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp']
        return self.file_extension in image_types
    
    @property
    def is_pdf(self) -> bool:
        """Check if document is a PDF."""
        return self.file_extension == 'pdf'
    
    @property
    def is_document(self) -> bool:
        """Check if document is a document file."""
        doc_types = ['doc', 'docx', 'pdf', 'txt', 'rtf']
        return self.file_extension in doc_types
    
    @property
    def is_spreadsheet(self) -> bool:
        """Check if document is a spreadsheet."""
        sheet_types = ['xls', 'xlsx', 'csv']
        return self.file_extension in sheet_types
    
    @property
    def file_size_mb(self) -> float:
        """Get file size in MB."""
        return self.file_size / (1024 * 1024)
    
    @property
    def file_size_kb(self) -> float:
        """Get file size in KB."""
        return self.file_size / 1024
    
    @property
    def is_virus_clean(self) -> bool:
        """Check if document passed virus scan."""
        return self.virus_scan_status == "clean"
    
    @property
    def is_virus_infected(self) -> bool:
        """Check if document is infected with virus."""
        return self.virus_scan_status == "infected"
    
    @property
    def virus_scan_pending(self) -> bool:
        """Check if virus scan is pending."""
        return self.virus_scan_status is None or self.virus_scan_status == "pending"
    
    @property
    def can_be_downloaded(self) -> bool:
        """Check if document can be downloaded."""
        return (
            self.is_verified and
            not self.is_virus_infected and
            (self.is_public or self.uploaded_by is not None)
        )
    
    def get_metadata(self, key: str, default=None):
        """Get specific metadata value."""
        if not self.metadata:
            return default
        return self.metadata.get(key, default)
    
    def set_metadata(self, key: str, value):
        """Set specific metadata value."""
        if not self.metadata:
            self.metadata = {}
        self.metadata[key] = value
    
    def mark_verified(self):
        """Mark document as verified."""
        self.is_verified = True
    
    def mark_unverified(self):
        """Mark document as unverified."""
        self.is_verified = False
    
    def set_virus_scan_status(self, status: str):
        """Set virus scan status."""
        valid_statuses = ["pending", "clean", "infected", "error"]
        if status not in valid_statuses:
            raise ValueError(f"Invalid virus scan status: {status}")
        self.virus_scan_status = status
    
    def get_download_url(self, base_url: str = None) -> str:
        """Get download URL for the document."""
        if base_url:
            return f"{base_url}/api/v1/documents/{self.id}/download"
        return f"/api/v1/documents/{self.id}/download"
    
    def get_preview_url(self, base_url: str = None) -> str:
        """Get preview URL for the document."""
        if base_url:
            return f"{base_url}/api/v1/documents/{self.id}/preview"
        return f"/api/v1/documents/{self.id}/preview"
    
    def get_document_summary(self) -> dict:
        """Get document summary for display."""
        return {
            "id": str(self.id),
            "filename": self.filename,
            "original_filename": self.original_filename,
            "mime_type": self.mime_type,
            "file_size": self.file_size,
            "file_size_mb": round(self.file_size_mb, 2),
            "owner_type": self.owner_type,
            "owner_id": str(self.owner_id),
            "document_type": self.document_type,
            "description": self.description,
            "is_verified": self.is_verified,
            "is_public": self.is_public,
            "virus_scan_status": self.virus_scan_status,
            "created_at": self.created_at.isoformat(),
            "can_be_downloaded": self.can_be_downloaded,
        }

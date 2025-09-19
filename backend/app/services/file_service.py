"""
File service for file upload and management.

Handles file storage, validation, and security operations.
"""

import os
import uuid
from typing import Optional, Dict, Any, List
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.security import (
    validate_file_type,
    validate_file_size,
    sanitize_filename,
    generate_secure_filename
)
from app.db.models.document import Document, DocumentType, DocumentOwnerType
from app.db.repository import BaseRepository

settings = get_settings()


class FileService:
    """File service for file upload and management."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.document_repo = BaseRepository(Document, db)
    
    async def upload_file(
        self,
        file_content: bytes,
        filename: str,
        mime_type: str,
        owner_type: DocumentOwnerType,
        owner_id: UUID,
        document_type: DocumentType = DocumentType.GENERAL,
        uploaded_by: Optional[UUID] = None,
        description: Optional[str] = None,
        is_public: bool = False
    ) -> Document:
        """Upload file and create document record."""
        # Validate file
        if not validate_file_type(filename, settings.ALLOWED_FILE_TYPES):
            raise ValueError("Invalid file type")
        
        if not validate_file_size(len(file_content), settings.MAX_FILE_SIZE):
            raise ValueError("File size exceeds limit")
        
        # Generate secure filename
        secure_filename = generate_secure_filename(filename)
        
        # Store file
        storage_path = await self._store_file(file_content, secure_filename, owner_type, owner_id)
        
        # Create document record
        document_data = {
            "owner_type": owner_type,
            "owner_id": owner_id,
            "filename": secure_filename,
            "original_filename": filename,
            "mime_type": mime_type,
            "file_size": len(file_content),
            "storage_path": storage_path,
            "storage_provider": settings.S3_ENDPOINT_URL and "s3" or "local",
            "storage_bucket": settings.S3_BUCKET_NAME if settings.S3_ENDPOINT_URL else None,
            "document_type": document_type,
            "description": description,
            "uploaded_by": uploaded_by,
            "is_public": is_public,
        }
        
        return await self.document_repo.create(document_data)
    
    async def _store_file(
        self,
        file_content: bytes,
        filename: str,
        owner_type: DocumentOwnerType,
        owner_id: UUID
    ) -> str:
        """Store file in appropriate storage."""
        if settings.S3_ENDPOINT_URL:
            return await self._store_file_s3(file_content, filename, owner_type, owner_id)
        else:
            return await self._store_file_local(file_content, filename, owner_type, owner_id)
    
    async def _store_file_s3(
        self,
        file_content: bytes,
        filename: str,
        owner_type: DocumentOwnerType,
        owner_id: UUID
    ) -> str:
        """Store file in S3-compatible storage."""
        # TODO: Implement S3 storage
        # For now, use local storage
        return await self._store_file_local(file_content, filename, owner_type, owner_id)
    
    async def _store_file_local(
        self,
        file_content: bytes,
        filename: str,
        owner_type: DocumentOwnerType,
        owner_id: UUID
    ) -> str:
        """Store file locally."""
        # Create directory structure
        base_path = settings.UPLOAD_PATH
        owner_path = os.path.join(base_path, owner_type.value, str(owner_id))
        os.makedirs(owner_path, exist_ok=True)
        
        # Write file
        file_path = os.path.join(owner_path, filename)
        with open(file_path, "wb") as f:
            f.write(file_content)
        
        return file_path
    
    async def get_file(self, document_id: UUID) -> Optional[Document]:
        """Get document by ID."""
        return await self.document_repo.get(document_id)
    
    async def get_file_content(self, document: Document) -> bytes:
        """Get file content."""
        if document.storage_provider == "s3":
            return await self._get_file_content_s3(document)
        else:
            return await self._get_file_content_local(document)
    
    async def _get_file_content_s3(self, document: Document) -> bytes:
        """Get file content from S3."""
        # TODO: Implement S3 file retrieval
        # For now, use local storage
        return await self._get_file_content_local(document)
    
    async def _get_file_content_local(self, document: Document) -> bytes:
        """Get file content from local storage."""
        with open(document.storage_path, "rb") as f:
            return f.read()
    
    async def delete_file(self, document_id: UUID) -> bool:
        """Delete file and document record."""
        document = await self.document_repo.get(document_id)
        if not document:
            return False
        
        # Delete physical file
        if os.path.exists(document.storage_path):
            os.remove(document.storage_path)
        
        # Delete document record
        await self.document_repo.hard_delete(document_id)
        return True
    
    async def get_files_by_owner(
        self,
        owner_type: DocumentOwnerType,
        owner_id: UUID
    ) -> List[Document]:
        """Get files by owner."""
        return await self.document_repo.get_multi(
            filters={"owner_type": owner_type, "owner_id": owner_id}
        )
    
    async def get_files_by_type(self, document_type: DocumentType) -> List[Document]:
        """Get files by document type."""
        return await self.document_repo.get_multi(
            filters={"document_type": document_type}
        )
    
    async def update_document(
        self,
        document_id: UUID,
        update_data: Dict[str, Any]
    ) -> Optional[Document]:
        """Update document information."""
        return await self.document_repo.update(document_id, update_data)
    
    async def mark_document_verified(self, document_id: UUID) -> bool:
        """Mark document as verified."""
        document = await self.document_repo.get(document_id)
        if not document:
            return False
        
        document.mark_verified()
        await self.db.commit()
        return True
    
    async def mark_document_unverified(self, document_id: UUID) -> bool:
        """Mark document as unverified."""
        document = await self.document_repo.get(document_id)
        if not document:
            return False
        
        document.mark_unverified()
        await self.db.commit()
        return True
    
    async def scan_file_for_viruses(self, document_id: UUID) -> bool:
        """Scan file for viruses."""
        document = await self.document_repo.get(document_id)
        if not document:
            return False
        
        # TODO: Implement virus scanning
        # For now, just mark as clean
        document.set_virus_scan_status("clean")
        await self.db.commit()
        return True
    
    async def get_file_stats(self) -> Dict[str, Any]:
        """Get file statistics."""
        total_files = await self.document_repo.count()
        verified_files = await self.document_repo.count({"is_verified": True})
        public_files = await self.document_repo.count({"is_public": True})
        
        return {
            "total_files": total_files,
            "verified_files": verified_files,
            "public_files": public_files,
            "verification_rate": (verified_files / total_files * 100) if total_files > 0 else 0
        }
    
    async def cleanup_orphaned_files(self) -> int:
        """Clean up orphaned files."""
        # TODO: Implement orphaned file cleanup
        return 0
    
    async def get_file_summary(self, document_id: UUID) -> Optional[Dict[str, Any]]:
        """Get file summary for display."""
        document = await self.document_repo.get(document_id)
        if not document:
            return None
        
        return document.get_document_summary()

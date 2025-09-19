"""
Common Pydantic schemas used across the application.

Provides base response models, pagination, error handling,
and common data structures.
"""

from datetime import datetime
from typing import Any, Dict, List, Optional, TypeVar, Generic
from uuid import UUID

from pydantic import BaseModel, Field, validator


T = TypeVar('T')


class BaseResponse(BaseModel):
    """Base response model for all API responses."""
    
    success: bool = Field(default=True, description="Whether the request was successful")
    message: Optional[str] = Field(default=None, description="Response message")
    data: Optional[Any] = Field(default=None, description="Response data")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            UUID: lambda v: str(v),
        }


class ErrorResponse(BaseModel):
    """Error response model for API errors."""
    
    success: bool = Field(default=False, description="Whether the request was successful")
    error: Dict[str, Any] = Field(description="Error details")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            UUID: lambda v: str(v),
        }


class PaginationParams(BaseModel):
    """Pagination parameters for list endpoints."""
    
    page: int = Field(default=1, ge=1, description="Page number")
    size: int = Field(default=20, ge=1, le=100, description="Page size")
    sort_by: Optional[str] = Field(default=None, description="Sort field")
    sort_order: str = Field(default="desc", pattern="^(asc|desc)$", description="Sort order")
    
    @property
    def skip(self) -> int:
        """Calculate skip value for pagination."""
        return (self.page - 1) * self.size
    
    @property
    def limit(self) -> int:
        """Get limit value for pagination."""
        return self.size


class PaginatedResponse(BaseModel, Generic[T]):
    """Paginated response model."""
    
    success: bool = Field(default=True, description="Whether the request was successful")
    data: List[T] = Field(description="List of items")
    pagination: Dict[str, Any] = Field(description="Pagination metadata")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            UUID: lambda v: str(v),
        }


class HealthCheck(BaseModel):
    """Health check response model."""
    
    status: str = Field(description="Service status")
    timestamp: datetime = Field(description="Check timestamp")
    version: str = Field(description="API version")
    uptime: Optional[float] = Field(default=None, description="Service uptime in seconds")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat(),
        }


class FileUploadResponse(BaseModel):
    """File upload response model."""
    
    success: bool = Field(default=True, description="Whether upload was successful")
    file_id: UUID = Field(description="Uploaded file ID")
    filename: str = Field(description="Original filename")
    file_size: int = Field(description="File size in bytes")
    mime_type: str = Field(description="File MIME type")
    download_url: str = Field(description="File download URL")
    preview_url: Optional[str] = Field(default=None, description="File preview URL")
    
    class Config:
        json_encoders = {
            UUID: lambda v: str(v),
        }


class ExportResponse(BaseModel):
    """Export response model."""
    
    success: bool = Field(default=True, description="Whether export was successful")
    job_id: str = Field(description="Export job ID")
    status: str = Field(description="Export status")
    download_url: Optional[str] = Field(default=None, description="Download URL when ready")
    expires_at: Optional[datetime] = Field(default=None, description="Download expiration time")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat(),
        }


class ImportResponse(BaseModel):
    """Import response model."""
    
    success: bool = Field(default=True, description="Whether import was successful")
    job_id: str = Field(description="Import job ID")
    status: str = Field(description="Import status")
    total_records: int = Field(description="Total records to process")
    processed_records: int = Field(description="Records processed so far")
    successful_records: int = Field(description="Successfully processed records")
    failed_records: int = Field(description="Failed records")
    errors: List[Dict[str, Any]] = Field(default=[], description="Import errors")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat(),
        }


class SearchParams(BaseModel):
    """Search parameters for search endpoints."""
    
    query: str = Field(description="Search query")
    fields: Optional[List[str]] = Field(default=None, description="Fields to search in")
    filters: Optional[Dict[str, Any]] = Field(default=None, description="Additional filters")
    page: int = Field(default=1, ge=1, description="Page number")
    size: int = Field(default=20, ge=1, le=100, description="Page size")
    
    @property
    def skip(self) -> int:
        """Calculate skip value for pagination."""
        return (self.page - 1) * self.size
    
    @property
    def limit(self) -> int:
        """Get limit value for pagination."""
        return self.size


class BulkActionRequest(BaseModel):
    """Bulk action request model."""
    
    action: str = Field(description="Action to perform")
    ids: List[UUID] = Field(description="List of IDs to perform action on")
    data: Optional[Dict[str, Any]] = Field(default=None, description="Additional data for action")
    
    class Config:
        json_encoders = {
            UUID: lambda v: str(v),
        }


class BulkActionResponse(BaseModel):
    """Bulk action response model."""
    
    success: bool = Field(default=True, description="Whether action was successful")
    processed: int = Field(description="Number of items processed")
    successful: int = Field(description="Number of successful operations")
    failed: int = Field(description="Number of failed operations")
    errors: List[Dict[str, Any]] = Field(default=[], description="Operation errors")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            UUID: lambda v: str(v),
        }


class AuditLogResponse(BaseModel):
    """Audit log response model."""
    
    id: UUID = Field(description="Audit log ID")
    action: str = Field(description="Action performed")
    resource_type: str = Field(description="Resource type")
    resource_id: Optional[UUID] = Field(default=None, description="Resource ID")
    description: str = Field(description="Action description")
    actor_user_id: Optional[UUID] = Field(default=None, description="Actor user ID")
    actor_email: Optional[str] = Field(default=None, description="Actor email")
    success: bool = Field(description="Whether action was successful")
    timestamp: datetime = Field(description="Action timestamp")
    details: Optional[Dict[str, Any]] = Field(default=None, description="Action details")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            UUID: lambda v: str(v),
        }


class StatsResponse(BaseModel):
    """Statistics response model."""
    
    success: bool = Field(default=True, description="Whether request was successful")
    data: Dict[str, Any] = Field(description="Statistics data")
    timestamp: datetime = Field(description="Stats timestamp")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat(),
        }

"""
Structured logging configuration using Loguru.

Provides JSON-formatted logs with request tracing, correlation IDs,
and proper log levels for production monitoring.
"""

import sys
from typing import Any, Dict, Optional

from loguru import logger
from pydantic import BaseModel

from app.core.config import Settings


class LogContext(BaseModel):
    """Log context model for structured logging."""
    request_id: Optional[str] = None
    user_id: Optional[str] = None
    endpoint: Optional[str] = None
    method: Optional[str] = None
    status_code: Optional[int] = None
    duration: Optional[float] = None
    error_code: Optional[str] = None
    error_message: Optional[str] = None


def setup_logging(settings: Settings) -> None:
    """Configure structured logging with Loguru."""
    # Remove default handler
    logger.remove()
    
    # Configure log format based on environment
    if settings.LOG_FORMAT == "json":
        log_format = _get_json_format()
    else:
        log_format = _get_text_format()
    
    # Add console handler
    logger.add(
        sys.stdout,
        format=log_format,
        level=settings.LOG_LEVEL,
        colorize=settings.LOG_FORMAT != "json",
        serialize=settings.LOG_FORMAT == "json",
        backtrace=True,
        diagnose=settings.DEBUG,
    )
    
    # Add file handler for production
    if not settings.DEBUG:
        logger.add(
            "logs/app.log",
            format=log_format,
            level=settings.LOG_LEVEL,
            rotation="1 day",
            retention="30 days",
            compression="zip",
            serialize=settings.LOG_FORMAT == "json",
            backtrace=True,
            diagnose=False,
        )
        
        # Add error log file
        logger.add(
            "logs/error.log",
            format=log_format,
            level="ERROR",
            rotation="1 day",
            retention="90 days",
            compression="zip",
            serialize=settings.LOG_FORMAT == "json",
            backtrace=True,
            diagnose=True,
        )


def _get_json_format() -> str:
    """Get JSON log format string."""
    return (
        "{"
        '"timestamp": "{time:YYYY-MM-DD HH:mm:ss.SSS}", '
        '"level": "{level}", '
        '"logger": "{name}", '
        '"module": "{module}", '
        '"function": "{function}", '
        '"line": {line}, '
        '"message": "{message}", '
        '"extra": {extra}'
        "}"
    )


def _get_text_format() -> str:
    """Get text log format string."""
    return (
        "<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | "
        "<level>{level: <8}</level> | "
        "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> | "
        "<level>{message}</level>"
    )


def log_request(
    request_id: str,
    method: str,
    endpoint: str,
    status_code: int,
    duration: float,
    user_id: Optional[str] = None,
) -> None:
    """Log HTTP request with structured data."""
    logger.info(
        "HTTP Request",
        extra={
            "request_id": request_id,
            "method": method,
            "endpoint": endpoint,
            "status_code": status_code,
            "duration": duration,
            "user_id": user_id,
            "event_type": "http_request",
        }
    )


def log_error(
    request_id: str,
    error: Exception,
    context: Optional[Dict[str, Any]] = None,
) -> None:
    """Log error with structured data."""
    extra = {
        "request_id": request_id,
        "error_type": type(error).__name__,
        "error_message": str(error),
        "event_type": "error",
    }
    
    if context:
        extra.update(context)
    
    logger.error(
        f"Error occurred: {error}",
        exc_info=True,
        extra=extra,
    )


def log_auth_event(
    event_type: str,
    user_id: Optional[str] = None,
    email: Optional[str] = None,
    success: bool = True,
    request_id: Optional[str] = None,
    error_message: Optional[str] = None,
) -> None:
    """Log authentication events."""
    extra = {
        "event_type": "auth",
        "auth_event": event_type,
        "success": success,
        "user_id": user_id,
        "email": email,
        "request_id": request_id,
    }
    
    if error_message:
        extra["error_message"] = error_message
    
    if success:
        logger.info(f"Auth event: {event_type}", extra=extra)
    else:
        logger.warning(f"Auth event failed: {event_type}", extra=extra)


def log_business_event(
    event_type: str,
    user_id: str,
    resource_type: str,
    resource_id: str,
    action: str,
    details: Optional[Dict[str, Any]] = None,
    request_id: Optional[str] = None,
) -> None:
    """Log business events for audit trail."""
    extra = {
        "event_type": "business",
        "business_event": event_type,
        "user_id": user_id,
        "resource_type": resource_type,
        "resource_id": resource_id,
        "action": action,
        "request_id": request_id,
    }
    
    if details:
        extra["details"] = details
    
    logger.info(f"Business event: {event_type}", extra=extra)


def log_security_event(
    event_type: str,
    severity: str = "medium",
    user_id: Optional[str] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None,
    request_id: Optional[str] = None,
) -> None:
    """Log security events."""
    extra = {
        "event_type": "security",
        "security_event": event_type,
        "severity": severity,
        "user_id": user_id,
        "ip_address": ip_address,
        "user_agent": user_agent,
        "request_id": request_id,
    }
    
    if details:
        extra["details"] = details
    
    if severity == "high":
        logger.error(f"High severity security event: {event_type}", extra=extra)
    elif severity == "medium":
        logger.warning(f"Medium severity security event: {event_type}", extra=extra)
    else:
        logger.info(f"Security event: {event_type}", extra=extra)


def log_performance(
    operation: str,
    duration: float,
    user_id: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None,
    request_id: Optional[str] = None,
) -> None:
    """Log performance metrics."""
    extra = {
        "event_type": "performance",
        "operation": operation,
        "duration": duration,
        "user_id": user_id,
        "request_id": request_id,
    }
    
    if details:
        extra.update(details)
    
    logger.info(f"Performance: {operation} took {duration:.3f}s", extra=extra)

"""
Services package for business logic and external integrations.

Provides service classes for authentication, OTP, payments, file management,
notifications, and data import/export operations.
"""

from .email_service import EmailService

__all__ = [
    "EmailService",
]

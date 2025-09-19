"""
Helper utility functions.

Provides common utility functions used across the application.
"""

import json
import re
import uuid
from datetime import datetime, date
from typing import Any, Optional, Union, List, Dict
from decimal import Decimal

from app.core.security import validate_email as security_validate_email, validate_phone as security_validate_phone


def generate_uuid() -> str:
    """Generate a new UUID string."""
    return str(uuid.uuid4())


def format_currency(amount: Union[float, Decimal], currency: str = "INR") -> str:
    """Format currency amount."""
    if currency == "INR":
        return f"₹{amount:,.2f}"
    elif currency == "USD":
        return f"${amount:,.2f}"
    else:
        return f"{amount:,.2f} {currency}"


def format_date(date_obj: Union[date, datetime, str]) -> str:
    """Format date object to string."""
    if isinstance(date_obj, str):
        return date_obj
    elif isinstance(date_obj, datetime):
        return date_obj.date().isoformat()
    elif isinstance(date_obj, date):
        return date_obj.isoformat()
    else:
        return str(date_obj)


def format_datetime(datetime_obj: Union[datetime, str]) -> str:
    """Format datetime object to string."""
    if isinstance(datetime_obj, str):
        return datetime_obj
    elif isinstance(datetime_obj, datetime):
        return datetime_obj.isoformat()
    else:
        return str(datetime_obj)


def validate_email(email: str) -> bool:
    """Validate email format."""
    return security_validate_email(email)


def validate_phone(phone: str) -> bool:
    """Validate phone number format."""
    return security_validate_phone(phone)


def sanitize_string(text: str) -> str:
    """Sanitize string by removing special characters."""
    return re.sub(r'[^\w\s-]', '', text).strip()


def truncate_string(text: str, max_length: int = 100, suffix: str = "...") -> str:
    """Truncate string to specified length."""
    if len(text) <= max_length:
        return text
    return text[:max_length - len(suffix)] + suffix


def generate_random_string(length: int = 8) -> str:
    """Generate random string of specified length."""
    import secrets
    import string
    return ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(length))


def hash_string(text: str) -> str:
    """Hash string using SHA-256."""
    import hashlib
    return hashlib.sha256(text.encode()).hexdigest()


def compare_strings(str1: str, str2: str) -> bool:
    """Compare strings securely."""
    import secrets
    return secrets.compare_digest(str1, str2)


def get_file_extension(filename: str) -> str:
    """Get file extension from filename."""
    return filename.split('.')[-1].lower() if '.' in filename else ''


def get_mime_type(filename: str) -> str:
    """Get MIME type from filename."""
    import mimetypes
    mime_type, _ = mimetypes.guess_type(filename)
    return mime_type or 'application/octet-stream'


def calculate_age(birth_date: Union[date, datetime, str]) -> int:
    """Calculate age from birth date."""
    if isinstance(birth_date, str):
        birth_date = datetime.fromisoformat(birth_date).date()
    elif isinstance(birth_date, datetime):
        birth_date = birth_date.date()
    
    today = date.today()
    return today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))


def is_valid_date(date_string: str) -> bool:
    """Check if string is a valid date."""
    try:
        datetime.fromisoformat(date_string)
        return True
    except ValueError:
        return False


def is_valid_email(email: str) -> bool:
    """Check if string is a valid email."""
    return validate_email(email)


def is_valid_phone(phone: str) -> bool:
    """Check if string is a valid phone number."""
    return validate_phone(phone)


def is_valid_url(url: str) -> bool:
    """Check if string is a valid URL."""
    import re
    pattern = re.compile(
        r'^https?://'  # http:// or https://
        r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|'  # domain...
        r'localhost|'  # localhost...
        r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  # ...or ip
        r'(?::\d+)?'  # optional port
        r'(?:/?|[/?]\S+)$', re.IGNORECASE)
    return pattern.match(url) is not None


def is_valid_uuid(uuid_string: str) -> bool:
    """Check if string is a valid UUID."""
    try:
        uuid.UUID(uuid_string)
        return True
    except ValueError:
        return False


def parse_json_safe(json_string: str, default: Any = None) -> Any:
    """Parse JSON string safely."""
    try:
        return json.loads(json_string)
    except (json.JSONDecodeError, TypeError):
        return default


def serialize_json_safe(obj: Any, default: str = "{}") -> str:
    """Serialize object to JSON string safely."""
    try:
        return json.dumps(obj, default=str)
    except (TypeError, ValueError):
        return default


def get_client_ip(request) -> str:
    """Get client IP address from request."""
    # This would be implemented based on your web framework
    return "127.0.0.1"  # Placeholder


def get_user_agent(request) -> str:
    """Get user agent from request."""
    # This would be implemented based on your web framework
    return "Mozilla/5.0"  # Placeholder


def format_file_size(size_bytes: int) -> str:
    """Format file size in human readable format."""
    if size_bytes == 0:
        return "0 B"
    
    size_names = ["B", "KB", "MB", "GB", "TB"]
    i = 0
    while size_bytes >= 1024 and i < len(size_names) - 1:
        size_bytes /= 1024.0
        i += 1
    
    return f"{size_bytes:.1f} {size_names[i]}"


def format_duration(seconds: int) -> str:
    """Format duration in human readable format."""
    if seconds < 60:
        return f"{seconds}s"
    elif seconds < 3600:
        minutes = seconds // 60
        remaining_seconds = seconds % 60
        return f"{minutes}m {remaining_seconds}s"
    else:
        hours = seconds // 3600
        remaining_minutes = (seconds % 3600) // 60
        return f"{hours}h {remaining_minutes}m"


def format_percentage(value: float, total: float) -> str:
    """Format percentage."""
    if total == 0:
        return "0%"
    return f"{(value / total * 100):.1f}%"


def format_number(number: Union[int, float]) -> str:
    """Format number with commas."""
    return f"{number:,}"


def format_boolean(value: bool) -> str:
    """Format boolean value."""
    return "Yes" if value else "No"


def format_list(items: List[Any], separator: str = ", ") -> str:
    """Format list as string."""
    return separator.join(str(item) for item in items)


def format_dict(data: Dict[str, Any], separator: str = ", ") -> str:
    """Format dictionary as string."""
    return separator.join(f"{key}: {value}" for key, value in data.items())


def format_object(obj: Any) -> str:
    """Format object as string."""
    if obj is None:
        return "None"
    elif isinstance(obj, (str, int, float, bool)):
        return str(obj)
    elif isinstance(obj, (list, tuple)):
        return format_list(obj)
    elif isinstance(obj, dict):
        return format_dict(obj)
    else:
        return str(obj)


def format_none(value: Any) -> str:
    """Format None value."""
    return "None" if value is None else str(value)


def format_empty(value: Any) -> str:
    """Format empty value."""
    return "" if not value else str(value)


def format_default(value: Any, default: str = "N/A") -> str:
    """Format value with default."""
    return str(value) if value is not None else default


def format_custom(value: Any, formatter: callable) -> str:
    """Format value with custom formatter."""
    try:
        return formatter(value)
    except Exception:
        return str(value)


def format_any(value: Any) -> str:
    """Format any value."""
    return format_object(value)


def format_all(values: List[Any]) -> str:
    """Format all values."""
    return format_list(values)


def format_some(values: List[Any], count: int = 3) -> str:
    """Format some values."""
    if len(values) <= count:
        return format_list(values)
    else:
        return format_list(values[:count]) + f" and {len(values) - count} more"


def format_none_safe(value: Any) -> str:
    """Format None value safely."""
    try:
        return format_none(value)
    except Exception:
        return "None"


def format_empty_safe(value: Any) -> str:
    """Format empty value safely."""
    try:
        return format_empty(value)
    except Exception:
        return ""


def format_default_safe(value: Any, default: str = "N/A") -> str:
    """Format value with default safely."""
    try:
        return format_default(value, default)
    except Exception:
        return default


def format_custom_safe(value: Any, formatter: callable) -> str:
    """Format value with custom formatter safely."""
    try:
        return format_custom(value, formatter)
    except Exception:
        return str(value)


def format_any_safe(value: Any) -> str:
    """Format any value safely."""
    try:
        return format_any(value)
    except Exception:
        return str(value)


def format_all_safe(values: List[Any]) -> str:
    """Format all values safely."""
    try:
        return format_all(values)
    except Exception:
        return str(values)


def format_some_safe(values: List[Any], count: int = 3) -> str:
    """Format some values safely."""
    try:
        return format_some(values, count)
    except Exception:
        return str(values)


def format_none_safe_safe(value: Any) -> str:
    """Format None value safely safely."""
    try:
        return format_none_safe(value)
    except Exception:
        return "None"


def format_empty_safe_safe(value: Any) -> str:
    """Format empty value safely safely."""
    try:
        return format_empty_safe(value)
    except Exception:
        return ""


def format_default_safe_safe(value: Any, default: str = "N/A") -> str:
    """Format value with default safely safely."""
    try:
        return format_default_safe(value, default)
    except Exception:
        return default


def format_custom_safe_safe(value: Any, formatter: callable) -> str:
    """Format value with custom formatter safely safely."""
    try:
        return format_custom_safe(value, formatter)
    except Exception:
        return str(value)


def format_any_safe_safe(value: Any) -> str:
    """Format any value safely safely."""
    try:
        return format_any_safe(value)
    except Exception:
        return str(value)


def format_all_safe_safe(values: List[Any]) -> str:
    """Format all values safely safely."""
    try:
        return format_all_safe(values)
    except Exception:
        return str(values)


def format_some_safe_safe(values: List[Any], count: int = 3) -> str:
    """Format some values safely safely."""
    try:
        return format_some_safe(values, count)
    except Exception:
        return str(values)

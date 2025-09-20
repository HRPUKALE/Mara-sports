"""
Scripts package for management commands.

Provides CLI commands for database management, user creation, and data seeding.
"""

from .create_super_admin import main as create_super_admin
from .seed_data import main as seed_data

__all__ = [
    "create_super_admin",
    "seed_data",
]

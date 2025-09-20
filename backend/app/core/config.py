"""
Simplified configuration management for Mara Sports Backend.
"""

from pydantic import Field
from pydantic_settings import BaseSettings
from typing import List, Optional, Union
import os


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Application
    APP_NAME: str = "Mara Sports Backend API"
    DEBUG: bool = False
    VERSION: str = "0.1.0"
    
    # Security
    SECRET_KEY: str = "your-secret-key-here-change-this-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    ALGORITHM: str = "HS256"
    
    # OTP Settings
    OTP_LENGTH: int = 6
    OTP_EXPIRE_MINUTES: int = 10
    RATE_LIMIT_OTP_REQUESTS: int = 5
    
    # Email Settings
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = "harshadpukale131@gmail.com"
    SMTP_PASSWORD: str = "kvai gpir qivv gif"
    SMTP_USE_TLS: bool = True
    SMTP_FROM: str = "harshadpukale131@gmail.com"
    
    # Database
    DB_HOST: str = "localhost"
    DB_PORT: int = 3306
    DB_NAME: str = "mara_sports_festival"
    DB_USER: str = "root"
    DB_PASSWORD: str = "Hrpukale@131"
    DATABASE_URL: str = "mysql+pymysql://root:Hrpukale%40131@localhost:3306/mara_sports_festival"
    DATABASE_ECHO: bool = False
    DATABASE_POOL_SIZE: int = 10
    DATABASE_MAX_OVERFLOW: int = 20
    
    # CORS
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:8080"
    ALLOWED_HOSTS: str = "localhost,127.0.0.1"
    
    # Email Configuration
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = "harshadpukale131@gmail.com"
    SMTP_PASSWORD: str = "kvai gpir qivv gif"
    SMTP_USE_TLS: bool = True
    SMTP_FROM: str = "harshadpukale131@gmail.com"
    
    # Admin Configuration
    ADMIN_EMAIL: str = "harshadpukale131@gmail.com"
    ADMIN_PASSWORD: str = "Hrpukale@131"
    
    # File Upload
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    UPLOAD_PATH: str = "./uploads"
    
    # Logging
    LOG_LEVEL: str = "INFO"
    
    def get_cors_origins(self) -> List[str]:
        """Get CORS origins as a list."""
        if not self.CORS_ORIGINS:
            return []
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
    
    def get_allowed_hosts(self) -> List[str]:
        """Get allowed hosts as a list."""
        if not self.ALLOWED_HOSTS:
            return []
        return [host.strip() for host in self.ALLOWED_HOSTS.split(",")]
    
    class Config:
        env_file = ".env"  # Enable .env file loading
        case_sensitive = True


def get_settings() -> Settings:
    """Get settings instance."""
    return Settings()
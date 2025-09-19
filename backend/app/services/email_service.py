"""
Email service for sending OTP and notification emails.
"""

import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
from datetime import datetime

from app.core.config import get_settings

settings = get_settings()


class EmailService:
    """Email service for sending emails via SMTP."""
    
    def __init__(self):
        self.smtp_host = settings.SMTP_HOST
        self.smtp_port = settings.SMTP_PORT
        self.smtp_user = settings.SMTP_USER
        self.smtp_password = settings.SMTP_PASSWORD
        self.smtp_use_tls = settings.SMTP_USE_TLS
        self.smtp_from = settings.SMTP_FROM
    
    def send_email(self, to_email: str, subject: str, html_content: str, text_content: str = None) -> bool:
        """Send email via SMTP."""
        try:
            # Create message
            message = MIMEMultipart("alternative")
            message["Subject"] = subject
            message["From"] = self.smtp_from
            message["To"] = to_email
            
            # Create text and HTML parts
            if text_content:
                text_part = MIMEText(text_content, "plain")
                message.attach(text_part)
            
            html_part = MIMEText(html_content, "html")
            message.attach(html_part)
            
            # Create SMTP session
            context = ssl.create_default_context()
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                if self.smtp_use_tls:
                    server.starttls(context=context)
                server.login(self.smtp_user, self.smtp_password)
                server.sendmail(self.smtp_from, to_email, message.as_string())
            
            return True
        except Exception as e:
            print(f"Email sending failed: {str(e)}")
            return False
    
    def send_otp_email(self, to_email: str, otp_code: str, user_type: str = "student") -> bool:
        """Send OTP email with appropriate template."""
        subject = f"Mara Sports Festival - {user_type.title()} Registration OTP"
        
        if user_type == "student":
            html_content = self._get_student_otp_template(otp_code)
            text_content = self._get_student_otp_text_template(otp_code)
        else:
            html_content = self._get_institution_otp_template(otp_code)
            text_content = self._get_institution_otp_text_template(otp_code)
        
        return self.send_email(to_email, subject, html_content, text_content)
    
    def _get_student_otp_template(self, otp_code: str) -> str:
        """Get HTML template for student OTP email."""
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Student Registration OTP</title>
            <style>
                body {{
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #f4f4f4;
                }}
                .container {{
                    background: white;
                    padding: 30px;
                    border-radius: 10px;
                    box-shadow: 0 0 20px rgba(0,0,0,0.1);
                }}
                .header {{
                    text-align: center;
                    margin-bottom: 30px;
                }}
                .logo {{
                    font-size: 28px;
                    font-weight: bold;
                    color: #2563eb;
                    margin-bottom: 10px;
                }}
                .otp-box {{
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 20px;
                    border-radius: 8px;
                    text-align: center;
                    margin: 20px 0;
                }}
                .otp-code {{
                    font-size: 32px;
                    font-weight: bold;
                    letter-spacing: 5px;
                    margin: 10px 0;
                }}
                .footer {{
                    text-align: center;
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #eee;
                    color: #666;
                    font-size: 14px;
                }}
                .warning {{
                    background: #fff3cd;
                    border: 1px solid #ffeaa7;
                    color: #856404;
                    padding: 15px;
                    border-radius: 5px;
                    margin: 20px 0;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">🏆 Mara Sports Festival</div>
                    <h2>Student Registration Verification</h2>
                </div>
                
                <p>Hello Student,</p>
                
                <p>Welcome to the Mara Sports Festival! You're just one step away from completing your registration.</p>
                
                <div class="otp-box">
                    <h3>Your Verification Code</h3>
                    <div class="otp-code">{otp_code}</div>
                    <p>This code will expire in 10 minutes</p>
                </div>
                
                <div class="warning">
                    <strong>⚠️ Important:</strong> Never share this code with anyone. Our team will never ask for your OTP code.
                </div>
                
                <p>If you didn't request this code, please ignore this email or contact our support team.</p>
                
                <div class="footer">
                    <p>© 2024 Mara Sports Festival. All rights reserved.</p>
                    <p>This is an automated message, please do not reply.</p>
                </div>
            </div>
        </body>
        </html>
        """
    
    def _get_student_otp_text_template(self, otp_code: str) -> str:
        """Get text template for student OTP email."""
        return f"""
        Mara Sports Festival - Student Registration OTP
        
        Hello Student,
        
        Welcome to the Mara Sports Festival! You're just one step away from completing your registration.
        
        Your Verification Code: {otp_code}
        This code will expire in 10 minutes.
        
        Important: Never share this code with anyone. Our team will never ask for your OTP code.
        
        If you didn't request this code, please ignore this email or contact our support team.
        
        © 2024 Mara Sports Festival. All rights reserved.
        This is an automated message, please do not reply.
        """
    
    def _get_institution_otp_template(self, otp_code: str) -> str:
        """Get HTML template for institution OTP email."""
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Institution Registration OTP</title>
            <style>
                body {{
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #f4f4f4;
                }}
                .container {{
                    background: white;
                    padding: 30px;
                    border-radius: 10px;
                    box-shadow: 0 0 20px rgba(0,0,0,0.1);
                }}
                .header {{
                    text-align: center;
                    margin-bottom: 30px;
                }}
                .logo {{
                    font-size: 28px;
                    font-weight: bold;
                    color: #059669;
                    margin-bottom: 10px;
                }}
                .otp-box {{
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    color: white;
                    padding: 20px;
                    border-radius: 8px;
                    text-align: center;
                    margin: 20px 0;
                }}
                .otp-code {{
                    font-size: 32px;
                    font-weight: bold;
                    letter-spacing: 5px;
                    margin: 10px 0;
                }}
                .footer {{
                    text-align: center;
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #eee;
                    color: #666;
                    font-size: 14px;
                }}
                .warning {{
                    background: #d1fae5;
                    border: 1px solid #a7f3d0;
                    color: #065f46;
                    padding: 15px;
                    border-radius: 5px;
                    margin: 20px 0;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">🏫 Mara Sports Festival</div>
                    <h2>Institution Registration Verification</h2>
                </div>
                
                <p>Hello Institution Administrator,</p>
                
                <p>Welcome to the Mara Sports Festival platform! We're excited to have your institution join our sports management system.</p>
                
                <div class="otp-box">
                    <h3>Your Verification Code</h3>
                    <div class="otp-code">{otp_code}</div>
                    <p>This code will expire in 10 minutes</p>
                </div>
                
                <div class="warning">
                    <strong>🔒 Security Notice:</strong> This code is confidential and should not be shared. Our support team will never request your OTP code.
                </div>
                
                <p>Once verified, you'll be able to:</p>
                <ul>
                    <li>Register your students for sports events</li>
                    <li>Manage team registrations</li>
                    <li>Track payments and invoices</li>
                    <li>Access detailed analytics and reports</li>
                </ul>
                
                <p>If you didn't request this code, please ignore this email or contact our support team immediately.</p>
                
                <div class="footer">
                    <p>© 2024 Mara Sports Festival. All rights reserved.</p>
                    <p>This is an automated message, please do not reply.</p>
                </div>
            </div>
        </body>
        </html>
        """
    
    def _get_institution_otp_text_template(self, otp_code: str) -> str:
        """Get text template for institution OTP email."""
        return f"""
        Mara Sports Festival - Institution Registration OTP
        
        Hello Institution Administrator,
        
        Welcome to the Mara Sports Festival platform! We're excited to have your institution join our sports management system.
        
        Your Verification Code: {otp_code}
        This code will expire in 10 minutes.
        
        Security Notice: This code is confidential and should not be shared. Our support team will never request your OTP code.
        
        Once verified, you'll be able to:
        - Register your students for sports events
        - Manage team registrations
        - Track payments and invoices
        - Access detailed analytics and reports
        
        If you didn't request this code, please ignore this email or contact our support team immediately.
        
        © 2024 Mara Sports Festival. All rights reserved.
        This is an automated message, please do not reply.
        """

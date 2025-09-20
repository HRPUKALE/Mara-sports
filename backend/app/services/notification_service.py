"""
Notification service for notification management and delivery.

Handles notification creation, delivery, and management.
"""

from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.db.models.notification import Notification, NotificationType, NotificationStatus, NotificationPriority
from app.db.repository import NotificationRepository

settings = get_settings()


class NotificationService:
    """Notification service for notification management and delivery."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.notification_repo = NotificationRepository(Notification, db)
    
    async def create_notification(
        self,
        user_id: UUID,
        title: str,
        message: str,
        notification_type: NotificationType,
        priority: NotificationPriority = NotificationPriority.NORMAL,
        data: Optional[Dict[str, Any]] = None,
        metadata: Optional[Dict[str, Any]] = None,
        expires_at: Optional[datetime] = None
    ) -> Notification:
        """Create a new notification."""
        notification_data = {
            "user_id": user_id,
            "title": title,
            "message": message,
            "notification_type": notification_type,
            "priority": priority,
            "data": data,
            "metadata": metadata,
            "expires_at": expires_at.isoformat() if expires_at else None,
        }
        
        notification = await self.notification_repo.create(notification_data)
        
        # Send notification
        await self._send_notification(notification)
        
        return notification
    
    async def _send_notification(self, notification: Notification) -> None:
        """Send notification via appropriate channels."""
        # Send email if configured
        if settings.SMTP_HOST:
            await self._send_email_notification(notification)
        
        # Send SMS if configured
        if settings.SMS_PROVIDER != "local":
            await self._send_sms_notification(notification)
        
        # Send push notification
        await self._send_push_notification(notification)
    
    async def _send_email_notification(self, notification: Notification) -> None:
        """Send email notification."""
        # TODO: Implement email sending
        notification.mark_sent("email")
        await self.db.commit()
    
    async def _send_sms_notification(self, notification: Notification) -> None:
        """Send SMS notification."""
        # TODO: Implement SMS sending
        notification.mark_sent("sms")
        await self.db.commit()
    
    async def _send_push_notification(self, notification: Notification) -> None:
        """Send push notification."""
        # TODO: Implement push notification
        notification.mark_sent("push")
        await self.db.commit()
    
    async def get_notification(self, notification_id: UUID) -> Optional[Notification]:
        """Get notification by ID."""
        return await self.notification_repo.get(notification_id)
    
    async def get_user_notifications(
        self,
        user_id: UUID,
        limit: int = 20,
        offset: int = 0
    ) -> List[Notification]:
        """Get user notifications."""
        return await self.notification_repo.get_by_user(user_id)
    
    async def get_unread_notifications(self, user_id: UUID) -> List[Notification]:
        """Get unread notifications for user."""
        return await self.notification_repo.get_unread_by_user(user_id)
    
    async def mark_notification_read(self, notification_id: UUID) -> bool:
        """Mark notification as read."""
        notification = await self.notification_repo.get(notification_id)
        if not notification:
            return False
        
        notification.mark_read()
        await self.db.commit()
        return True
    
    async def mark_notification_unread(self, notification_id: UUID) -> bool:
        """Mark notification as unread."""
        notification = await self.notification_repo.get(notification_id)
        if not notification:
            return False
        
        notification.mark_unread()
        await self.db.commit()
        return True
    
    async def mark_all_notifications_read(self, user_id: UUID) -> int:
        """Mark all notifications as read for user."""
        notifications = await self.notification_repo.get_unread_by_user(user_id)
        count = 0
        
        for notification in notifications:
            notification.mark_read()
            count += 1
        
        await self.db.commit()
        return count
    
    async def delete_notification(self, notification_id: UUID) -> bool:
        """Delete notification."""
        return await self.notification_repo.hard_delete(notification_id)
    
    async def get_notifications_by_type(
        self,
        notification_type: NotificationType
    ) -> List[Notification]:
        """Get notifications by type."""
        return await self.notification_repo.get_by_type(notification_type)
    
    async def retry_failed_notifications(self) -> int:
        """Retry failed notifications."""
        failed_notifications = await self.notification_repo.get_multi(
            filters={"status": NotificationStatus.FAILED}
        )
        count = 0
        
        for notification in failed_notifications:
            if notification.can_be_retried:
                await self._send_notification(notification)
                count += 1
        
        return count
    
    async def cleanup_expired_notifications(self) -> int:
        """Clean up expired notifications."""
        # TODO: Implement expired notification cleanup
        return 0
    
    async def get_notification_stats(self) -> Dict[str, Any]:
        """Get notification statistics."""
        total_notifications = await self.notification_repo.count()
        sent_notifications = await self.notification_repo.count({"status": NotificationStatus.SENT})
        delivered_notifications = await self.notification_repo.count({"status": NotificationStatus.DELIVERED})
        failed_notifications = await self.notification_repo.count({"status": NotificationStatus.FAILED})
        read_notifications = await self.notification_repo.count({"is_read": True})
        
        return {
            "total_notifications": total_notifications,
            "sent_notifications": sent_notifications,
            "delivered_notifications": delivered_notifications,
            "failed_notifications": failed_notifications,
            "read_notifications": read_notifications,
            "delivery_rate": (delivered_notifications / total_notifications * 100) if total_notifications > 0 else 0,
            "read_rate": (read_notifications / total_notifications * 100) if total_notifications > 0 else 0
        }
    
    async def get_notification_summary(self, notification_id: UUID) -> Optional[Dict[str, Any]]:
        """Get notification summary for display."""
        notification = await self.notification_repo.get(notification_id)
        if not notification:
            return None
        
        return notification.get_notification_summary()
    
    async def send_bulk_notification(
        self,
        user_ids: List[UUID],
        title: str,
        message: str,
        notification_type: NotificationType,
        priority: NotificationPriority = NotificationPriority.NORMAL,
        data: Optional[Dict[str, Any]] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> List[Notification]:
        """Send notification to multiple users."""
        notifications = []
        
        for user_id in user_ids:
            notification = await self.create_notification(
                user_id=user_id,
                title=title,
                message=message,
                notification_type=notification_type,
                priority=priority,
                data=data,
                metadata=metadata
            )
            notifications.append(notification)
        
        return notifications

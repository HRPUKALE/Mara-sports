"""
Payment service for payment processing and management.

Handles payment creation, processing, and provider integrations.
"""

from decimal import Decimal
from typing import Optional, Dict, Any
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.db.models.payment import Payment, PaymentProvider, PaymentStatus
from app.db.repository import PaymentRepository

settings = get_settings()


class PaymentService:
    """Payment service for payment processing and management."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.payment_repo = PaymentRepository(Payment, db)
    
    async def create_payment(
        self,
        amount: Decimal,
        currency: str = "INR",
        provider: PaymentProvider = PaymentProvider.LOCAL,
        registration_id: Optional[UUID] = None,
        institution_id: Optional[UUID] = None,
        description: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Payment:
        """Create a new payment."""
        payment_data = {
            "amount": amount,
            "currency": currency,
            "provider": provider,
            "registration_id": registration_id,
            "institution_id": institution_id,
            "description": description,
            "status": PaymentStatus.INITIATED,
            "provider_payload": metadata or {},
        }
        
        payment = await self.payment_repo.create(payment_data)
        
        # TODO: Integrate with payment provider
        if provider != PaymentProvider.LOCAL:
            await self._process_payment_with_provider(payment)
        
        return payment
    
    async def _process_payment_with_provider(self, payment: Payment) -> None:
        """Process payment with external provider."""
        if payment.provider == PaymentProvider.RAZORPAY:
            await self._process_razorpay_payment(payment)
        elif payment.provider == PaymentProvider.STRIPE:
            await self._process_stripe_payment(payment)
    
    async def _process_razorpay_payment(self, payment: Payment) -> None:
        """Process payment with Razorpay."""
        # TODO: Implement Razorpay integration
        # For now, just mark as successful
        payment.mark_successful("razorpay_payment_123", {"razorpay_order_id": "order_123"})
        await self.db.commit()
    
    async def _process_stripe_payment(self, payment: Payment) -> None:
        """Process payment with Stripe."""
        # TODO: Implement Stripe integration
        # For now, just mark as successful
        payment.mark_successful("stripe_payment_123", {"stripe_payment_intent_id": "pi_123"})
        await self.db.commit()
    
    async def get_payment(self, payment_id: UUID) -> Optional[Payment]:
        """Get payment by ID."""
        return await self.payment_repo.get(payment_id)
    
    async def get_payment_by_registration(self, registration_id: UUID) -> Optional[Payment]:
        """Get payment by registration ID."""
        return await self.payment_repo.get_by_registration(registration_id)
    
    async def get_payments_by_institution(self, institution_id: UUID) -> list[Payment]:
        """Get payments by institution ID."""
        return await self.payment_repo.get_by_institution(institution_id)
    
    async def get_payments_by_status(self, status: PaymentStatus) -> list[Payment]:
        """Get payments by status."""
        return await self.payment_repo.get_by_status(status)
    
    async def update_payment_status(
        self,
        payment_id: UUID,
        status: PaymentStatus,
        provider_data: Optional[Dict[str, Any]] = None
    ) -> bool:
        """Update payment status."""
        payment = await self.payment_repo.get(payment_id)
        if not payment:
            return False
        
        if status == PaymentStatus.SUCCESS:
            payment.mark_successful(provider_data.get("payment_id") if provider_data else None, provider_data)
        elif status == PaymentStatus.FAILED:
            payment.mark_failed(provider_data.get("error_message") if provider_data else None, provider_data)
        elif status == PaymentStatus.CANCELLED:
            payment.mark_cancelled(provider_data.get("reason") if provider_data else None)
        
        await self.db.commit()
        return True
    
    async def process_refund(
        self,
        payment_id: UUID,
        refund_amount: Optional[Decimal] = None,
        reason: Optional[str] = None
    ) -> bool:
        """Process payment refund."""
        payment = await self.payment_repo.get(payment_id)
        if not payment:
            return False
        
        if not payment.can_be_refunded:
            return False
        
        refund_amount = refund_amount or payment.amount
        payment.process_refund(refund_amount, reason)
        await self.db.commit()
        
        # TODO: Process refund with payment provider
        if payment.provider != PaymentProvider.LOCAL:
            await self._process_refund_with_provider(payment, refund_amount, reason)
        
        return True
    
    async def _process_refund_with_provider(
        self,
        payment: Payment,
        refund_amount: Decimal,
        reason: Optional[str]
    ) -> None:
        """Process refund with external provider."""
        if payment.provider == PaymentProvider.RAZORPAY:
            await self._process_razorpay_refund(payment, refund_amount, reason)
        elif payment.provider == PaymentProvider.STRIPE:
            await self._process_stripe_refund(payment, refund_amount, reason)
    
    async def _process_razorpay_refund(
        self,
        payment: Payment,
        refund_amount: Decimal,
        reason: Optional[str]
    ) -> None:
        """Process refund with Razorpay."""
        # TODO: Implement Razorpay refund
        pass
    
    async def _process_stripe_refund(
        self,
        payment: Payment,
        refund_amount: Decimal,
        reason: Optional[str]
    ) -> None:
        """Process Stripe refund."""
        # TODO: Implement Stripe refund
        pass
    
    async def handle_webhook(
        self,
        provider: PaymentProvider,
        webhook_data: Dict[str, Any]
    ) -> bool:
        """Handle payment webhook from provider."""
        # TODO: Implement webhook signature verification
        # TODO: Process webhook data and update payment status
        
        if provider == PaymentProvider.RAZORPAY:
            return await self._handle_razorpay_webhook(webhook_data)
        elif provider == PaymentProvider.STRIPE:
            return await self._handle_stripe_webhook(webhook_data)
        
        return False
    
    async def _handle_razorpay_webhook(self, webhook_data: Dict[str, Any]) -> bool:
        """Handle Razorpay webhook."""
        # TODO: Implement Razorpay webhook handling
        return True
    
    async def _handle_stripe_webhook(self, webhook_data: Dict[str, Any]) -> bool:
        """Handle Stripe webhook."""
        # TODO: Implement Stripe webhook handling
        return True
    
    async def get_payment_stats(self) -> Dict[str, Any]:
        """Get payment statistics."""
        total_payments = await self.payment_repo.count()
        successful_payments = await self.payment_repo.count({"status": PaymentStatus.SUCCESS})
        failed_payments = await self.payment_repo.count({"status": PaymentStatus.FAILED})
        pending_payments = await self.payment_repo.count({"status": PaymentStatus.PENDING})
        
        return {
            "total_payments": total_payments,
            "successful_payments": successful_payments,
            "failed_payments": failed_payments,
            "pending_payments": pending_payments,
            "success_rate": (successful_payments / total_payments * 100) if total_payments > 0 else 0
        }
    
    async def get_payment_summary(self, payment_id: UUID) -> Optional[Dict[str, Any]]:
        """Get payment summary for display."""
        payment = await self.payment_repo.get(payment_id)
        if not payment:
            return None
        
        return payment.get_payment_summary()

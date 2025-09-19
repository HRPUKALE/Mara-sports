"""
Payment API endpoints.

Handles payment processing, webhooks, and payment management.
"""

from typing import Dict, List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.base import get_db
from app.db.models.payment import Payment
from app.db.models.user import User
from app.db.repository import PaymentRepository
from app.schemas.payment import (
    PaymentCreate,
    PaymentResponse,
    PaymentStatus,
    PaymentWebhook,
)
from app.schemas.common import BaseResponse, PaginationParams
from app.api.v1.auth import get_current_user_dependency, get_admin_user_dependency

router = APIRouter()


@router.post("/create", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
async def create_payment(
    payment_data: PaymentCreate,
    current_user: User = Depends(get_current_user_dependency),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new payment.
    
    Creates payment record and initiates payment with provider.
    """
    payment_repo = PaymentRepository(Payment, db)
    
    # Create payment
    payment_dict = payment_data.dict()
    payment_dict["created_by"] = current_user.id
    payment = await payment_repo.create(payment_dict)
    
    # TODO: Integrate with payment provider (Razorpay/Stripe)
    # For now, just return the payment record
    
    return PaymentResponse(
        id=payment.id,
        registration_id=payment.registration_id,
        institution_id=payment.institution_id,
        amount=float(payment.amount),
        currency=payment.currency,
        status=payment.status,
        provider=payment.provider,
        provider_payment_id=payment.provider_payment_id,
        provider_order_id=payment.provider_order_id,
        payment_method=payment.payment_method,
        payment_gateway=payment.payment_gateway,
        description=payment.description,
        notes=payment.notes,
        refund_amount=float(payment.refund_amount) if payment.refund_amount else None,
        refund_reason=payment.refund_reason,
        refund_id=payment.refund_id,
        webhook_received=payment.webhook_received,
        webhook_processed=payment.webhook_processed,
        created_at=payment.created_at,
        updated_at=payment.updated_at,
    )


@router.get("/{payment_id}", response_model=PaymentResponse)
async def get_payment(
    payment_id: UUID,
    current_user: User = Depends(get_current_user_dependency),
    db: AsyncSession = Depends(get_db)
):
    """
    Get payment by ID.
    
    Returns payment information.
    """
    payment_repo = PaymentRepository(Payment, db)
    
    # Get payment
    payment = await payment_repo.get(payment_id)
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    # Check permissions
    if not current_user.is_admin and payment.created_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    return PaymentResponse(
        id=payment.id,
        registration_id=payment.registration_id,
        institution_id=payment.institution_id,
        amount=float(payment.amount),
        currency=payment.currency,
        status=payment.status,
        provider=payment.provider,
        provider_payment_id=payment.provider_payment_id,
        provider_order_id=payment.provider_order_id,
        payment_method=payment.payment_method,
        payment_gateway=payment.payment_gateway,
        description=payment.description,
        notes=payment.notes,
        refund_amount=float(payment.refund_amount) if payment.refund_amount else None,
        refund_reason=payment.refund_reason,
        refund_id=payment.refund_id,
        webhook_received=payment.webhook_received,
        webhook_processed=payment.webhook_processed,
        created_at=payment.created_at,
        updated_at=payment.updated_at,
    )


@router.get("/", response_model=List[PaymentResponse])
async def list_payments(
    pagination: PaginationParams = Depends(),
    status: Optional[str] = Query(None, description="Filter by status"),
    provider: Optional[str] = Query(None, description="Filter by provider"),
    current_user: User = Depends(get_current_user_dependency),
    db: AsyncSession = Depends(get_db)
):
    """
    List payments with pagination and filtering.
    
    Returns paginated list of payments.
    """
    payment_repo = PaymentRepository(Payment, db)
    
    # Build filters
    filters = {}
    if status:
        filters["status"] = status
    if provider:
        filters["provider"] = provider
    
    # Get payments
    payments = await payment_repo.get_multi(
        pagination.skip,
        pagination.limit,
        filters,
        pagination.sort_by
    )
    
    # Convert to response format
    payment_responses = []
    for payment in payments:
        payment_responses.append(PaymentResponse(
            id=payment.id,
            registration_id=payment.registration_id,
            institution_id=payment.institution_id,
            amount=float(payment.amount),
            currency=payment.currency,
            status=payment.status,
            provider=payment.provider,
            provider_payment_id=payment.provider_payment_id,
            provider_order_id=payment.provider_order_id,
            payment_method=payment.payment_method,
            payment_gateway=payment.payment_gateway,
            description=payment.description,
            notes=payment.notes,
            refund_amount=float(payment.refund_amount) if payment.refund_amount else None,
            refund_reason=payment.refund_reason,
            refund_id=payment.refund_id,
            webhook_received=payment.webhook_received,
            webhook_processed=payment.webhook_processed,
            created_at=payment.created_at,
            updated_at=payment.updated_at,
        ))
    
    return payment_responses


@router.post("/webhook/{provider}", response_model=BaseResponse)
async def payment_webhook(
    provider: str,
    webhook_data: PaymentWebhook,
    db: AsyncSession = Depends(get_db)
):
    """
    Handle payment webhook from provider.
    
    Processes webhook notifications from payment providers.
    """
    payment_repo = PaymentRepository(Payment, db)
    
    # TODO: Implement webhook signature verification
    # TODO: Process webhook data and update payment status
    
    return BaseResponse(
        success=True,
        message="Webhook processed successfully"
    )


@router.post("/{payment_id}/refund", response_model=BaseResponse)
async def process_refund(
    payment_id: UUID,
    refund_amount: Optional[float] = None,
    reason: Optional[str] = None,
    current_user: User = Depends(get_admin_user_dependency),
    db: AsyncSession = Depends(get_db)
):
    """
    Process payment refund.
    
    Initiates refund for successful payment.
    """
    payment_repo = PaymentRepository(Payment, db)
    
    # Get payment
    payment = await payment_repo.get(payment_id)
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    # Check if payment can be refunded
    if not payment.can_be_refunded:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment cannot be refunded"
        )
    
    # TODO: Integrate with payment provider for refund
    # For now, just update the payment record
    
    refund_amount = refund_amount or float(payment.amount)
    payment.process_refund(refund_amount, reason)
    await db.commit()
    
    return BaseResponse(
        success=True,
        message="Refund processed successfully"
    )


@router.get("/{payment_id}/status", response_model=Dict[str, str])
async def get_payment_status(
    payment_id: UUID,
    current_user: User = Depends(get_current_user_dependency),
    db: AsyncSession = Depends(get_db)
):
    """
    Get payment status.
    
    Returns current payment status and details.
    """
    payment_repo = PaymentRepository(Payment, db)
    
    # Get payment
    payment = await payment_repo.get(payment_id)
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    # Check permissions
    if not current_user.is_admin and payment.created_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    return {
        "status": payment.status,
        "provider": payment.provider,
        "amount": str(payment.amount),
        "currency": payment.currency,
        "created_at": payment.created_at.isoformat(),
        "updated_at": payment.updated_at.isoformat(),
    }

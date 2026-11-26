import uuid
import datetime
from decimal import Decimal
from django.db import transaction
from django.utils import timezone
from django.core.exceptions import ValidationError
from apps.wallet.models import PaymentIntent, PaymentIntentStatus, TransactionType
from apps.wallet.services import LedgerService

class QRPaymentGateway:
    VPA = "veltrixarena@sandbox"
    MERCHANT_NAME = "Veltrix Arena Gaming"

    @classmethod
    def initiate_deposit(cls, user, amount, currency='INR'):
        amount = Decimal(str(amount))
        if amount < Decimal('50.0000'):
            raise ValidationError("Minimum deposit amount is ₹50.")
        if amount > Decimal('500000.0000'):
            raise ValidationError("Maximum deposit amount per transaction is ₹500,000.")

        intent_ref = f"VLTX-QR-{uuid.uuid4().hex[:10].upper()}"
        expires_at = timezone.now() + datetime.timedelta(minutes=15)

        # Standard NPCI UPI URI Scheme
        qr_payload = (
            f"upi://pay?pa={cls.VPA}"
            f"&pn={cls.MERCHANT_NAME}"
            f"&tr={intent_ref}"
            f"&am={amount:.2f}"
            f"&cu={currency}"
            f"&tn=Veltrix+Wallet+Deposit"
        )

        intent = PaymentIntent.objects.create(
            user=user,
            intent_reference=intent_ref,
            amount=amount,
            currency=currency,
            payment_method='UPI_QR',
            qr_payload=qr_payload,
            status=PaymentIntentStatus.PENDING,
            gateway_provider='SANDBOX_UPI',
            expires_at=expires_at
        )

        return intent

    @classmethod
    @transaction.atomic
    def process_webhook_callback(cls, intent_reference, gateway_reference=None, simulated_status='SUCCESS'):
        """
        Idempotent payment webhook processing.
        Atomically marks intent as COMPLETED and credits user's MAIN wallet balance once.
        """
        try:
            intent = PaymentIntent.objects.select_for_update().get(intent_reference=intent_reference)
        except PaymentIntent.DoesNotExist:
            raise ValidationError(f"PaymentIntent with reference '{intent_reference}' not found.")

        if intent.status == PaymentIntentStatus.COMPLETED:
            # Already processed (Idempotent safe response)
            return intent, False

        if intent.expires_at < timezone.now():
            intent.status = PaymentIntentStatus.EXPIRED
            intent.save(update_fields=['status'])
            raise ValidationError("Payment intent has expired.")

        if simulated_status != 'SUCCESS':
            intent.status = PaymentIntentStatus.FAILED
            intent.gateway_reference = gateway_reference
            intent.save(update_fields=['status', 'gateway_reference'])
            return intent, False

        # Mark intent completed
        intent.status = PaymentIntentStatus.COMPLETED
        intent.gateway_reference = gateway_reference or f"GW-{uuid.uuid4().hex[:12].upper()}"
        intent.save(update_fields=['status', 'gateway_reference'])

        # Double-entry ledger credit to MAIN account
        idempotency_key = f"PAYMENT_INTENT_{intent.intent_reference}"
        LedgerService.process_credit(
            user=intent.user,
            account_type='MAIN',
            amount=intent.amount,
            tx_type=TransactionType.DEPOSIT,
            reference_no=intent.intent_reference,
            idempotency_key=idempotency_key,
            description=f"Verified UPI Deposit via QR ({intent.gateway_provider})",
            metadata={'gateway_reference': intent.gateway_reference, 'provider': intent.gateway_provider}
        )

        return intent, True

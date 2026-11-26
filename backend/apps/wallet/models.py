import uuid
from decimal import Decimal
from django.db import models
from django.conf import settings
from django.utils import timezone

class AccountType(models.TextChoices):
    MAIN = 'MAIN', 'Main Real/Deposit Balance'
    DEMO = 'DEMO', 'Demo Credits Balance'
    BONUS = 'BONUS', 'Promotional Bonus Balance'
    ESCROW = 'ESCROW', 'In-Play Escrow Balance'

class WalletAccount(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='wallet_accounts')
    account_type = models.CharField(max_length=20, choices=AccountType.choices, default=AccountType.DEMO)
    currency = models.CharField(max_length=10, default='INR')
    balance = models.DecimalField(max_digits=18, decimal_places=4, default=Decimal('0.0000'))
    locked_balance = models.DecimalField(max_digits=18, decimal_places=4, default=Decimal('0.0000'))
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'account_type', 'currency')

    def __str__(self):
        return f"{self.user.username} - {self.account_type}: {self.balance} {self.currency}"

class TransactionType(models.TextChoices):
    DEPOSIT = 'DEPOSIT', 'Deposit'
    WITHDRAWAL = 'WITHDRAWAL', 'Withdrawal'
    GAME_BET = 'GAME_BET', 'Game Bet Placed'
    GAME_WIN = 'GAME_WIN', 'Game Win Settlement'
    GAME_REFUND = 'GAME_REFUND', 'Game Stake Refund'
    BONUS_CREDIT = 'BONUS_CREDIT', 'Bonus / Daily Reward Credit'
    REFERRAL_PAYOUT = 'REFERRAL_PAYOUT', 'Referral Commission Payout'

class TransactionStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pending'
    COMPLETED = 'COMPLETED', 'Completed'
    FAILED = 'FAILED', 'Failed'
    CANCELLED = 'CANCELLED', 'Cancelled'

class Transaction(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    reference_no = models.CharField(max_length=64, unique=True, db_index=True)
    idempotency_key = models.CharField(max_length=128, unique=True, null=True, blank=True, db_index=True)
    transaction_type = models.CharField(max_length=30, choices=TransactionType.choices)
    status = models.CharField(max_length=20, choices=TransactionStatus.choices, default=TransactionStatus.PENDING)
    total_amount = models.DecimalField(max_digits=18, decimal_places=4)
    description = models.TextField(blank=True, default='')
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(default=timezone.now, db_index=True)

    def __str__(self):
        return f"{self.reference_no} | {self.transaction_type} | {self.total_amount} [{self.status}]"

class EntryType(models.TextChoices):
    DEBIT = 'DEBIT', 'Debit'
    CREDIT = 'CREDIT', 'Credit'

class LedgerEntry(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    transaction = models.ForeignKey(Transaction, on_delete=models.CASCADE, related_name='ledger_entries')
    account = models.ForeignKey(WalletAccount, on_delete=models.RESTRICT, related_name='ledger_entries')
    entry_type = models.CharField(max_length=10, choices=EntryType.choices)
    amount = models.DecimalField(max_digits=18, decimal_places=4)
    balance_after = models.DecimalField(max_digits=18, decimal_places=4)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Ledger {self.entry_type} {self.amount} on {self.account.account_type} (Tx: {self.transaction.reference_no})"

class PaymentIntentStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pending Payment'
    COMPLETED = 'COMPLETED', 'Completed'
    EXPIRED = 'EXPIRED', 'Expired'
    FAILED = 'FAILED', 'Failed'

class PaymentIntent(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='payment_intents')
    intent_reference = models.CharField(max_length=64, unique=True, db_index=True)
    amount = models.DecimalField(max_digits=18, decimal_places=4)
    currency = models.CharField(max_length=10, default='INR')
    payment_method = models.CharField(max_length=30, default='UPI_QR')
    qr_payload = models.TextField()
    status = models.CharField(max_length=20, choices=PaymentIntentStatus.choices, default=PaymentIntentStatus.PENDING)
    gateway_provider = models.CharField(max_length=50, default='SANDBOX_UPI')
    gateway_reference = models.CharField(max_length=128, null=True, blank=True)
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"QR Intent {self.intent_reference} ({self.amount} {self.currency}) [{self.status}]"

class WithdrawalStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pending Admin Review'
    UNDER_REVIEW = 'UNDER_REVIEW', 'Under Review'
    APPROVED = 'APPROVED', 'Approved'
    REJECTED = 'REJECTED', 'Rejected'
    COMPLETED = 'COMPLETED', 'Payout Dispatched'

class WithdrawalRequest(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='withdrawals')
    amount = models.DecimalField(max_digits=18, decimal_places=4)
    payout_channel = models.CharField(max_length=30, default='UPI')
    payout_details = models.JSONField(default=dict)
    status = models.CharField(max_length=20, choices=WithdrawalStatus.choices, default=WithdrawalStatus.PENDING)
    reviewed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_withdrawals')
    reviewed_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Withdrawal {self.amount} for {self.user.username} [{self.status}]"

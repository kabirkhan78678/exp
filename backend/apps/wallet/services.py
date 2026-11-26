import uuid
from decimal import Decimal
from django.db import transaction
from django.core.exceptions import ValidationError
from django.utils import timezone
from apps.wallet.models import (
    WalletAccount, AccountType, Transaction, TransactionType,
    TransactionStatus, LedgerEntry, EntryType, PaymentIntent,
    PaymentIntentStatus, WithdrawalRequest, WithdrawalStatus
)

class LedgerService:
    @staticmethod
    def ensure_wallet_accounts(user):
        """Ensures that user has all standard wallet accounts (DEMO, MAIN, BONUS, ESCROW)."""
        accounts = {}
        for acc_type in [AccountType.DEMO, AccountType.MAIN, AccountType.BONUS, AccountType.ESCROW]:
            initial_balance = Decimal('10000.0000') if acc_type == AccountType.DEMO else Decimal('0.0000')
            account, created = WalletAccount.objects.get_or_create(
                user=user,
                account_type=acc_type,
                currency='INR',
                defaults={'balance': initial_balance}
            )
            accounts[acc_type] = account
        return accounts

    @staticmethod
    @transaction.atomic
    def process_credit(user, account_type, amount, tx_type, reference_no=None, idempotency_key=None, description='', metadata=None):
        """
        Credits a user's wallet account using double-entry principles.
        Amount must be positive Decimal.
        """
        amount = Decimal(str(amount))
        if amount <= 0:
            raise ValidationError("Credit amount must be greater than zero.")

        # Check idempotency
        if idempotency_key:
            existing_tx = Transaction.objects.filter(idempotency_key=idempotency_key).first()
            if existing_tx:
                return existing_tx

        if not reference_no:
            reference_no = f"TX-{uuid.uuid4().hex[:12].upper()}"

        account = WalletAccount.objects.select_for_update().get(
            user=user, account_type=account_type, currency='INR'
        )

        account.balance += amount
        account.save(update_fields=['balance', 'updated_at'])

        tx = Transaction.objects.create(
            reference_no=reference_no,
            idempotency_key=idempotency_key,
            transaction_type=tx_type,
            status=TransactionStatus.COMPLETED,
            total_amount=amount,
            description=description,
            metadata=metadata or {}
        )

        LedgerEntry.objects.create(
            transaction=tx,
            account=account,
            entry_type=EntryType.CREDIT,
            amount=amount,
            balance_after=account.balance
        )

        return tx

    @staticmethod
    @transaction.atomic
    def process_debit(user, account_type, amount, tx_type, reference_no=None, idempotency_key=None, description='', metadata=None):
        """
        Debits a user's wallet account with balance invariant check.
        Amount must be positive Decimal and <= account.balance.
        """
        amount = Decimal(str(amount))
        if amount <= 0:
            raise ValidationError("Debit amount must be greater than zero.")

        # Check idempotency
        if idempotency_key:
            existing_tx = Transaction.objects.filter(idempotency_key=idempotency_key).first()
            if existing_tx:
                return existing_tx

        if not reference_no:
            reference_no = f"TX-{uuid.uuid4().hex[:12].upper()}"

        account = WalletAccount.objects.select_for_update().get(
            user=user, account_type=account_type, currency='INR'
        )

        if account.balance < amount:
            raise ValidationError(f"Insufficient funds in {account_type} balance. Available: {account.balance}, Requested: {amount}")

        account.balance -= amount
        account.save(update_fields=['balance', 'updated_at'])

        tx = Transaction.objects.create(
            reference_no=reference_no,
            idempotency_key=idempotency_key,
            transaction_type=tx_type,
            status=TransactionStatus.COMPLETED,
            total_amount=amount,
            description=description,
            metadata=metadata or {}
        )

        LedgerEntry.objects.create(
            transaction=tx,
            account=account,
            entry_type=EntryType.DEBIT,
            amount=amount,
            balance_after=account.balance
        )

        return tx

    @staticmethod
    @transaction.atomic
    def settle_game_bet(user, account_type, stake_amount, payout_amount, game_slug, round_number, idempotency_key=None):
        """
        Atomically settles game outcome:
        - If stake was already debited at bet placement, credits payout.
        - Returns resulting transaction.
        """
        payout = Decimal(str(payout_amount))
        if payout > 0:
            tx = LedgerService.process_credit(
                user=user,
                account_type=account_type,
                amount=payout,
                tx_type=TransactionType.GAME_WIN,
                idempotency_key=idempotency_key,
                description=f"Win on {game_slug.upper()} Round #{round_number}",
                metadata={'game': game_slug, 'round': round_number, 'payout': str(payout)}
            )
            # Update user profile total won
            profile = user.profile
            profile.total_won += payout
            profile.save(update_fields=['total_won'])
            return tx
        return None

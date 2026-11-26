from rest_framework import serializers
from apps.wallet.models import WalletAccount, Transaction, LedgerEntry, PaymentIntent, WithdrawalRequest

class WalletAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = WalletAccount
        fields = ['id', 'account_type', 'currency', 'balance', 'locked_balance', 'updated_at']

class LedgerEntrySerializer(serializers.ModelSerializer):
    account_type = serializers.CharField(source='account.account_type', read_only=True)

    class Meta:
        model = LedgerEntry
        fields = ['id', 'account_type', 'entry_type', 'amount', 'balance_after', 'created_at']

class TransactionSerializer(serializers.ModelSerializer):
    ledger_entries = LedgerEntrySerializer(many=True, read_only=True)

    class Meta:
        model = Transaction
        fields = [
            'id', 'reference_no', 'idempotency_key', 'transaction_type',
            'status', 'total_amount', 'description', 'metadata', 'created_at', 'ledger_entries'
        ]

class PaymentIntentSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentIntent
        fields = [
            'id', 'intent_reference', 'amount', 'currency', 'payment_method',
            'qr_payload', 'status', 'gateway_provider', 'expires_at', 'created_at'
        ]

class WithdrawalRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = WithdrawalRequest
        fields = [
            'id', 'amount', 'payout_channel', 'payout_details',
            'status', 'reviewed_at', 'rejection_reason', 'created_at'
        ]

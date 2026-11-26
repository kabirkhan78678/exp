from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.core.exceptions import ValidationError
from decimal import Decimal
from apps.wallet.models import WalletAccount, Transaction, PaymentIntent, WithdrawalRequest, AccountType, TransactionType
from apps.wallet.serializers import (
    WalletAccountSerializer, TransactionSerializer,
    PaymentIntentSerializer, WithdrawalRequestSerializer
)
from apps.wallet.services import LedgerService
from apps.wallet.gateways import QRPaymentGateway

class WalletBalanceView(APIView):
    def get(self, request):
        accounts = LedgerService.ensure_wallet_accounts(request.user)
        serialized = {
            acc_type: str(account.balance)
            for acc_type, account in accounts.items()
        }
        return Response({
            'balances': serialized,
            'currency': 'INR',
            'total_wagered': str(request.user.profile.total_wagered),
            'total_won': str(request.user.profile.total_won),
            'vip_tier': request.user.profile.vip_tier,
            'loyalty_points': str(request.user.profile.loyalty_points)
        })

class TransactionHistoryView(APIView):
    def get(self, request):
        txs = Transaction.objects.filter(
            ledger_entries__account__user=request.user
        ).distinct().order_by('-created_at')[:50]
        serializer = TransactionSerializer(txs, many=True)
        return Response({'transactions': serializer.data})

class InitiateDepositView(APIView):
    def post(self, request):
        amount = request.data.get('amount')
        if not amount:
            return Response({'error': 'Amount is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            intent = QRPaymentGateway.initiate_deposit(
                user=request.user,
                amount=amount,
                currency='INR'
            )
            return Response({
                'message': 'QR code generated successfully.',
                'intent': PaymentIntentSerializer(intent).data
            }, status=status.HTTP_201_CREATED)
        except ValidationError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': f"Failed to generate QR: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SandboxConfirmPaymentView(APIView):
    """
    Simulated gateway callback or sandbox manual confirm endpoint.
    Verifies and atomically credits user's MAIN wallet balance once.
    """
    def post(self, request):
        intent_reference = request.data.get('intent_reference')
        if not intent_reference:
            return Response({'error': 'intent_reference is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            intent, was_credited = QRPaymentGateway.process_webhook_callback(
                intent_reference=intent_reference,
                gateway_reference=request.data.get('gateway_reference'),
                simulated_status=request.data.get('status', 'SUCCESS')
            )
            # Re-fetch balances
            accounts = LedgerService.ensure_wallet_accounts(request.user)
            return Response({
                'message': 'Payment successfully verified and credited.' if was_credited else 'Payment already settled.',
                'intent': PaymentIntentSerializer(intent).data,
                'new_main_balance': str(accounts[AccountType.MAIN].balance)
            })
        except ValidationError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class RequestWithdrawalView(APIView):
    def post(self, request):
        amount_val = request.data.get('amount')
        payout_channel = request.data.get('payout_channel', 'UPI')
        payout_details = request.data.get('payout_details', {})

        if not amount_val:
            return Response({'error': 'Withdrawal amount is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            amount = Decimal(str(amount_val))
            if amount < Decimal('500.0000'):
                return Response({'error': 'Minimum withdrawal amount is ₹500.'}, status=status.HTTP_400_BAD_REQUEST)

            # Atomic debit from MAIN account to reserve funds
            idempotency_key = f"WITHDRAW_REQ_{request.user.id}_{amount}_{uuid.uuid4().hex[:6]}"
            LedgerService.process_debit(
                user=request.user,
                account_type=AccountType.MAIN,
                amount=amount,
                tx_type=TransactionType.WITHDRAWAL,
                idempotency_key=idempotency_key,
                description=f"Withdrawal request pending admin review ({payout_channel})",
                metadata={'channel': payout_channel, 'details': payout_details}
            )

            req = WithdrawalRequest.objects.create(
                user=request.user,
                amount=amount,
                payout_channel=payout_channel,
                payout_details=payout_details
            )

            return Response({
                'message': 'Withdrawal request submitted for compliance verification.',
                'withdrawal': WithdrawalRequestSerializer(req).data
            }, status=status.HTTP_201_CREATED)
        except ValidationError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class ResetDemoBalanceView(APIView):
    """Allows players to top up / reset their demo credits back to 10,000 for continuous testing."""
    def post(self, request):
        account = WalletAccount.objects.get(user=request.user, account_type=AccountType.DEMO)
        diff = Decimal('10000.0000') - account.balance
        if diff > 0:
            LedgerService.process_credit(
                user=request.user,
                account_type=AccountType.DEMO,
                amount=diff,
                tx_type=TransactionType.BONUS_CREDIT,
                description="Demo Credits Refresh to 10,000"
            )
        return Response({'message': 'Demo balance reset to 10,000.00', 'balance': '10000.0000'})

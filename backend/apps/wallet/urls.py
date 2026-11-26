from django.urls import path
from apps.wallet.views import (
    WalletBalanceView, TransactionHistoryView,
    InitiateDepositView, SandboxConfirmPaymentView,
    RequestWithdrawalView, ResetDemoBalanceView
)

urlpatterns = [
    path('balance/', WalletBalanceView.as_view(), name='wallet_balance'),
    path('transactions/', TransactionHistoryView.as_view(), name='wallet_transactions'),
    path('deposit/initiate/', InitiateDepositView.as_view(), name='wallet_deposit_initiate'),
    path('deposit/sandbox-confirm/', SandboxConfirmPaymentView.as_view(), name='wallet_deposit_sandbox_confirm'),
    path('withdraw/request/', RequestWithdrawalView.as_view(), name='wallet_withdraw_request'),
    path('demo/reset/', ResetDemoBalanceView.as_view(), name='wallet_demo_reset'),
]

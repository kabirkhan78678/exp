from django.urls import path
from apps.admin_center.views import (
    AdminOverviewView, AdminUsersListView, AdminUserActionView,
    AdminGameConfigView, AdminWithdrawalsListView,
    AdminWithdrawalActionView, AdminAuditLogsView
)

urlpatterns = [
    path('overview/', AdminOverviewView.as_view(), name='admin_overview'),
    path('users/', AdminUsersListView.as_view(), name='admin_users_list'),
    path('users/<uuid:user_id>/action/', AdminUserActionView.as_view(), name='admin_user_action'),
    path('games/<slug:slug>/', AdminGameConfigView.as_view(), name='admin_game_config'),
    path('withdrawals/', AdminWithdrawalsListView.as_view(), name='admin_withdrawals'),
    path('withdrawals/<uuid:req_id>/action/', AdminWithdrawalActionView.as_view(), name='admin_withdrawal_action'),
    path('audit-logs/', AdminAuditLogsView.as_view(), name='admin_audit_logs'),
]

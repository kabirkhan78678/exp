from decimal import Decimal
from django.db.models import Sum, Count
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from apps.admin_center.permissions import IsAdminUser
from apps.admin_center.models import AuditLog
from apps.accounts.models import User, UserProfile, UserRole
from apps.accounts.serializers import UserSerializer
from apps.wallet.models import (
    Transaction, TransactionType, TransactionStatus,
    WithdrawalRequest, WithdrawalStatus, WalletAccount, AccountType
)
from apps.wallet.services import LedgerService
from apps.games.models import Game, GameRound, Bet, BetStatus
from apps.games.serializers import GameSerializer

class AdminOverviewView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        now = timezone.now()
        total_users = User.objects.count()
        total_players = User.objects.filter(role=UserRole.PLAYER).count()
        
        # Financial aggregations
        total_deposits = Transaction.objects.filter(
            transaction_type=TransactionType.DEPOSIT,
            status=TransactionStatus.COMPLETED
        ).aggregate(total=Sum('total_amount'))['total'] or Decimal('0.0000')

        total_withdrawals = Transaction.objects.filter(
            transaction_type=TransactionType.WITHDRAWAL,
            status=TransactionStatus.COMPLETED
        ).aggregate(total=Sum('total_amount'))['total'] or Decimal('0.0000')

        pending_withdrawals = WithdrawalRequest.objects.filter(
            status=WithdrawalStatus.PENDING
        )
        pending_withdrawals_count = pending_withdrawals.count()
        pending_withdrawals_amount = pending_withdrawals.aggregate(total=Sum('amount'))['total'] or Decimal('0.0000')

        # Gaming statistics
        total_stakes = Bet.objects.aggregate(total=Sum('stake_amount'))['total'] or Decimal('0.0000')
        total_payouts = Bet.objects.aggregate(total=Sum('payout_amount'))['total'] or Decimal('0.0000')
        ggr = total_stakes - total_payouts

        # Game breakdown
        games_stats = []
        for g in Game.objects.all():
            bets = Bet.objects.filter(round__game=g)
            g_stakes = bets.aggregate(total=Sum('stake_amount'))['total'] or Decimal('0.0000')
            g_payouts = bets.aggregate(total=Sum('payout_amount'))['total'] or Decimal('0.0000')
            margin = (g_stakes - g_payouts)
            games_stats.append({
                'slug': g.slug,
                'name': g.name,
                'category': g.category,
                'total_rounds': g.rounds.count(),
                'total_stakes': str(g_stakes),
                'total_payouts': str(g_payouts),
                'margin': str(margin),
                'is_active': g.is_active,
                'is_maintenance': g.is_maintenance
            })

        # Recent transactions
        recent_txs = Transaction.objects.order_by('-created_at')[:10]
        recent_txs_data = [
            {
                'reference_no': t.reference_no,
                'type': t.transaction_type,
                'amount': str(t.total_amount),
                'status': t.status,
                'created_at': t.created_at
            }
            for t in recent_txs
        ]

        return Response({
            'kpis': {
                'total_users': total_users,
                'total_players': total_players,
                'total_deposits': str(total_deposits),
                'total_withdrawals': str(total_withdrawals),
                'pending_withdrawals_count': pending_withdrawals_count,
                'pending_withdrawals_amount': str(pending_withdrawals_amount),
                'total_stakes': str(total_stakes),
                'total_payouts': str(total_payouts),
                'ggr': str(ggr),
                'system_health': 'OPERATIONAL',
                'uptime': '99.98%'
            },
            'games_stats': games_stats,
            'recent_transactions': recent_txs_data
        })

class AdminUsersListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        query = request.query_params.get('q', '').strip()
        users = User.objects.all().select_related('profile')
        if query:
            users = users.filter(username__icontains=query) | users.filter(email__icontains=query)

        data = []
        for u in users.order_by('-created_at')[:100]:
            demo_acc = WalletAccount.objects.filter(user=u, account_type=AccountType.DEMO).first()
            main_acc = WalletAccount.objects.filter(user=u, account_type=AccountType.MAIN).first()
            data.append({
                'id': u.id,
                'username': u.username,
                'email': u.email,
                'phone': u.phone,
                'role': u.role,
                'is_active': u.is_active,
                'is_frozen': u.is_frozen,
                'is_verified': u.is_verified,
                'vip_tier': u.profile.vip_tier,
                'kyc_status': u.profile.kyc_status,
                'kyc_notes': u.profile.kyc_notes,
                'demo_balance': str(demo_acc.balance) if demo_acc else '0.0000',
                'main_balance': str(main_acc.balance) if main_acc else '0.0000',
                'total_wagered': str(u.profile.total_wagered),
                'total_won': str(u.profile.total_won),
                'created_at': u.created_at
            })
        return Response({'users': data})

class AdminUserActionView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, user_id):
        action = request.data.get('action') # 'freeze', 'unfreeze', 'update_vip', 'update_kyc'
        try:
            target_user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        if action == 'freeze':
            target_user.is_frozen = True
            target_user.save(update_fields=['is_frozen'])
            AuditLog.objects.create(
                actor=request.user,
                action='USER_FROZEN',
                resource_type='USER',
                resource_id=str(target_user.id),
                payload={'reason': request.data.get('reason', 'Administrative freeze')}
            )
            return Response({'message': f"User {target_user.username} frozen."})

        elif action == 'unfreeze':
            target_user.is_frozen = False
            target_user.save(update_fields=['is_frozen'])
            AuditLog.objects.create(
                actor=request.user,
                action='USER_UNFROZEN',
                resource_type='USER',
                resource_id=str(target_user.id)
            )
            return Response({'message': f"User {target_user.username} unfrozen."})

        elif action == 'update_vip':
            new_vip = request.data.get('vip_tier')
            target_user.profile.vip_tier = new_vip
            target_user.profile.save(update_fields=['vip_tier'])
            AuditLog.objects.create(
                actor=request.user,
                action='VIP_TIER_UPDATED',
                resource_type='USER',
                resource_id=str(target_user.id),
                payload={'new_vip': new_vip}
            )
            return Response({'message': f"VIP tier updated to {new_vip}."})

        elif action == 'update_kyc':
            new_status = request.data.get('kyc_status')
            notes = request.data.get('kyc_notes', '')
            target_user.profile.kyc_status = new_status
            target_user.profile.kyc_notes = notes
            target_user.profile.save(update_fields=['kyc_status', 'kyc_notes'])
            AuditLog.objects.create(
                actor=request.user,
                action='KYC_STATUS_UPDATED',
                resource_type='USER',
                resource_id=str(target_user.id),
                payload={'kyc_status': new_status, 'notes': notes}
            )
            return Response({'message': f"KYC status updated to {new_status}."})

        return Response({'error': f"Unknown action: {action}"}, status=status.HTTP_400_BAD_REQUEST)

class AdminGameConfigView(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, slug):
        try:
            game = Game.objects.get(slug=slug)
        except Game.DoesNotExist:
            return Response({'error': 'Game not found'}, status=status.HTTP_404_NOT_FOUND)

        min_stake = request.data.get('min_stake')
        max_stake = request.data.get('max_stake')
        house_edge = request.data.get('house_edge')
        is_active = request.data.get('is_active')
        is_maintenance = request.data.get('is_maintenance')

        if min_stake is not None:
            game.min_stake = Decimal(str(min_stake))
        if max_stake is not None:
            game.max_stake = Decimal(str(max_stake))
        if house_edge is not None:
            game.house_edge = Decimal(str(house_edge))
        if is_active is not None:
            game.is_active = bool(is_active)
        if is_maintenance is not None:
            game.is_maintenance = bool(is_maintenance)

        game.save()
        AuditLog.objects.create(
            actor=request.user,
            action='GAME_CONFIG_UPDATED',
            resource_type='GAME',
            resource_id=game.slug,
            payload=request.data
        )

        return Response({
            'message': f"Game {game.name} configuration updated successfully.",
            'game': GameSerializer(game).data
        })

class AdminWithdrawalsListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        status_filter = request.query_params.get('status')
        reqs = WithdrawalRequest.objects.all().select_related('user')
        if status_filter:
            reqs = reqs.filter(status=status_filter)

        data = [
            {
                'id': w.id,
                'username': w.user.username,
                'email': w.user.email,
                'amount': str(w.amount),
                'payout_channel': w.payout_channel,
                'payout_details': w.payout_details,
                'status': w.status,
                'rejection_reason': w.rejection_reason,
                'created_at': w.created_at
            }
            for w in reqs.order_by('-created_at')[:100]
        ]
        return Response({'withdrawals': data})

class AdminWithdrawalActionView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, req_id):
        action = request.data.get('action') # 'approve' or 'reject'
        try:
            req = WithdrawalRequest.objects.get(id=req_id)
        except WithdrawalRequest.DoesNotExist:
            return Response({'error': 'Withdrawal request not found'}, status=status.HTTP_404_NOT_FOUND)

        if req.status != WithdrawalStatus.PENDING:
            return Response({'error': f"Request is already {req.status}."}, status=status.HTTP_400_BAD_REQUEST)

        if action == 'approve':
            req.status = WithdrawalStatus.COMPLETED
            req.reviewed_by = request.user
            req.reviewed_at = timezone.now()
            req.save(update_fields=['status', 'reviewed_by', 'reviewed_at'])

            AuditLog.objects.create(
                actor=request.user,
                action='WITHDRAWAL_APPROVED',
                resource_type='WITHDRAWAL',
                resource_id=str(req.id),
                payload={'amount': str(req.amount), 'user': req.user.username}
            )
            return Response({'message': f"Withdrawal #{req.id} approved and completed."})

        elif action == 'reject':
            reason = request.data.get('reason', 'Compliance criteria not met')
            req.status = WithdrawalStatus.REJECTED
            req.rejection_reason = reason
            req.reviewed_by = request.user
            req.reviewed_at = timezone.now()
            req.save(update_fields=['status', 'rejection_reason', 'reviewed_by', 'reviewed_at'])

            # Refund reserved amount back to user's MAIN account
            LedgerService.process_credit(
                user=req.user,
                account_type=AccountType.MAIN,
                amount=req.amount,
                tx_type=TransactionType.GAME_REFUND,
                description=f"Withdrawal #{str(req.id)[:8]} rejected and refunded. Reason: {reason}"
            )

            AuditLog.objects.create(
                actor=request.user,
                action='WITHDRAWAL_REJECTED',
                resource_type='WITHDRAWAL',
                resource_id=str(req.id),
                payload={'amount': str(req.amount), 'reason': reason}
            )
            return Response({'message': f"Withdrawal rejected and amount refunded to player."})

        return Response({'error': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)

class AdminAuditLogsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        logs = AuditLog.objects.all().select_related('actor')[:100]
        data = [
            {
                'id': log.id,
                'actor': log.actor.username if log.actor else 'SYSTEM',
                'action': log.action,
                'resource_type': log.resource_type,
                'resource_id': log.resource_id,
                'payload': log.payload,
                'created_at': log.created_at
            }
            for log in logs
        ]
        return Response({'audit_logs': data})

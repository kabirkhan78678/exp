import uuid
from decimal import Decimal
from django.db import transaction
from django.db.models import Sum
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from apps.accounts.models import UserProfile
from apps.cms.models import (
    Banner, Announcement, SupportTicket, TicketMessage,
    PromotionCampaign, PromoRedemption, Tournament, TournamentEntry,
    RainDrop, RainClaim, LoungeMessage
)
from apps.cms.serializers import (
    BannerSerializer, AnnouncementSerializer,
    SupportTicketSerializer, TicketMessageSerializer, PromotionCampaignSerializer,
    PromoRedemptionSerializer, TournamentSerializer, LoungeMessageSerializer
)
from apps.wallet.services import LedgerService
from apps.wallet.models import AccountType, TransactionType

class BannersView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        banners = Banner.objects.filter(is_active=True).order_by('order', '-created_at')
        return Response({'banners': BannerSerializer(banners, many=True).data})

class AnnouncementsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        announcements = Announcement.objects.filter(is_active=True).order_by('-created_at')[:10]
        return Response({'announcements': AnnouncementSerializer(announcements, many=True).data})

class SupportTicketsView(APIView):
    def get(self, request):
        if request.user.is_admin:
            tickets = SupportTicket.objects.all().order_by('-updated_at')[:50]
        else:
            tickets = SupportTicket.objects.filter(user=request.user).order_by('-updated_at')
        return Response({'tickets': SupportTicketSerializer(tickets, many=True).data})

    def post(self, request):
        subject = request.data.get('subject')
        message = request.data.get('message')
        category = request.data.get('category', 'TECHNICAL')
        priority = request.data.get('priority', 'MEDIUM')

        if not subject or not message:
            return Response({'error': 'Subject and message are required.'}, status=status.HTTP_400_BAD_REQUEST)

        ticket_no = f"TCK-{uuid.uuid4().hex[:8].upper()}"
        ticket = SupportTicket.objects.create(
            user=request.user,
            ticket_number=ticket_no,
            category=category,
            priority=priority,
            subject=subject,
            status='OPEN'
        )

        TicketMessage.objects.create(
            ticket=ticket,
            sender=request.user,
            is_admin_reply=False,
            message=message
        )

        return Response({
            'message': 'Support ticket submitted.',
            'ticket': SupportTicketSerializer(ticket).data
        }, status=status.HTTP_201_CREATED)

class TicketReplyView(APIView):
    def post(self, request, ticket_id):
        message_text = request.data.get('message')
        if not message_text:
            return Response({'error': 'Message is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            if request.user.is_admin:
                ticket = SupportTicket.objects.get(id=ticket_id)
            else:
                ticket = SupportTicket.objects.get(id=ticket_id, user=request.user)

            is_admin = request.user.is_admin
            msg = TicketMessage.objects.create(
                ticket=ticket,
                sender=request.user,
                is_admin_reply=is_admin,
                message=message_text
            )

            if is_admin:
                ticket.status = 'IN_PROGRESS'
            ticket.save(update_fields=['status', 'updated_at'])

            return Response({
                'message': 'Reply sent successfully.',
                'reply': TicketMessageSerializer(msg).data
            }, status=status.HTTP_201_CREATED)

        except SupportTicket.DoesNotExist:
            return Response({'error': 'Ticket not found.'}, status=status.HTTP_404_NOT_FOUND)

class DailyRewardClaimView(APIView):
    """
    Allows player to claim daily loyalty & demo bonus once every 24 hours.
    """
    def post(self, request):
        user = request.user
        profile = user.profile
        
        # Check last claim in user preferences
        last_claim_str = profile.preferences.get('last_daily_claim')
        now = timezone.now()

        if last_claim_str:
            import datetime
            last_claim = datetime.datetime.fromisoformat(last_claim_str)
            if (now - last_claim).total_seconds() < 86400:
                hours_left = int((86400 - (now - last_claim).total_seconds()) // 3600)
                mins_left = int(((86400 - (now - last_claim).total_seconds()) % 3600) // 60)
                return Response({
                    'error': f'Daily reward already claimed. Next claim available in {hours_left}h {mins_left}m.'
                }, status=status.HTTP_400_BAD_REQUEST)

        # Award 500 Demo Credits + 25 Loyalty Points
        demo_reward = Decimal('500.0000')
        LedgerService.process_credit(
            user=user,
            account_type=AccountType.DEMO,
            amount=demo_reward,
            tx_type=TransactionType.BONUS_CREDIT,
            description="Daily Login Streak Demo Reward"
        )

        profile.loyalty_points += Decimal('25.0000')
        profile.preferences['last_daily_claim'] = now.isoformat()
        profile.save(update_fields=['loyalty_points', 'preferences'])

        return Response({
            'message': 'Daily reward claimed! +500 Demo Credits and +25 Loyalty Points awarded.',
            'reward_credits': '500.00',
            'loyalty_points': str(profile.loyalty_points)
        })

class PromotionsListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        promos = PromotionCampaign.objects.filter(is_active=True)
        return Response({'promotions': PromotionCampaignSerializer(promos, many=True).data})


class PromoRedeemView(APIView):
    """Validates and atomically credits a promo code bonus once per user."""

    def get(self, request):
        redemptions = PromoRedemption.objects.filter(user=request.user).order_by('-redeemed_at')[:15]
        return Response({'redemptions': PromoRedemptionSerializer(redemptions, many=True).data})

    def post(self, request):
        raw_code = str(request.data.get('code', '')).strip().upper()
        if not raw_code:
            return Response({'error': 'Please enter a valid promo code.'}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            campaign = PromotionCampaign.objects.select_for_update().filter(
                code__iexact=raw_code, is_active=True
            ).first()

            if not campaign:
                return Response({'error': f'Promo code "{raw_code}" is invalid or expired.'}, status=status.HTTP_400_BAD_REQUEST)

            if campaign.expires_at and campaign.expires_at < timezone.now():
                return Response({'error': f'Promo code "{raw_code}" has expired.'}, status=status.HTTP_400_BAD_REQUEST)

            if PromoRedemption.objects.filter(user=request.user, campaign=campaign).exists():
                return Response({'error': f'You have already redeemed {campaign.code}.'}, status=status.HTTP_400_BAD_REQUEST)

            reward = campaign.bonus_fixed_amount if campaign.bonus_fixed_amount > 0 else Decimal('250.0000')
            LedgerService.ensure_wallet_accounts(request.user)
            LedgerService.process_credit(
                user=request.user,
                account_type=AccountType.BONUS,
                amount=reward,
                tx_type=TransactionType.BONUS_CREDIT,
                idempotency_key=f"PROMO_{campaign.code}_{request.user.id}",
                description=f"Promo Code Redeemed: {campaign.code}",
                metadata={'code': campaign.code, 'title': campaign.title},
            )
            redemption = PromoRedemption.objects.create(
                user=request.user,
                campaign=campaign,
                code=campaign.code,
                reward_amount=reward,
                account_type=AccountType.BONUS,
            )

        accounts = LedgerService.ensure_wallet_accounts(request.user)
        return Response({
            'message': f'Code {campaign.code} applied! +₹{reward:.0f} credited to your Bonus Vault.',
            'redemption': PromoRedemptionSerializer(redemption).data,
            'balances': {k: str(v.balance) for k, v in accounts.items()},
        }, status=status.HTTP_201_CREATED)


class ReferralStatsView(APIView):
    """Computes 3-tier referral tree commissions (5% Tier-1, 2% Tier-2, 1% Tier-3) and claimable payout."""

    def _compute_stats(self, user):
        t1_profiles = UserProfile.objects.filter(referred_by=user).select_related('user')
        t1_users = [p.user for p in t1_profiles]
        t2_profiles = UserProfile.objects.filter(referred_by__in=t1_users).select_related('user')
        t2_users = [p.user for p in t2_profiles]
        t3_profiles = UserProfile.objects.filter(referred_by__in=t2_users)

        t1_vol = t1_profiles.aggregate(s=Sum('total_wagered'))['s'] or Decimal('0')
        t2_vol = t2_profiles.aggregate(s=Sum('total_wagered'))['s'] or Decimal('0')
        t3_vol = t3_profiles.aggregate(s=Sum('total_wagered'))['s'] or Decimal('0')

        t1_earned = (t1_vol * Decimal('0.05')) + Decimal(len(t1_users) * 50)
        t2_earned = t2_vol * Decimal('0.02')
        t3_earned = t3_vol * Decimal('0.01')
        gross_earned = (t1_earned + t2_earned + t3_earned).quantize(Decimal('0.01'))

        claimed_str = str(user.profile.preferences.get('referral_claimed_total', '0.00'))
        claimed = Decimal(claimed_str)
        claimable = max(Decimal('0.00'), (gross_earned - claimed).quantize(Decimal('0.01')))

        return {
            'referral_code': user.profile.referral_code,
            'gross_earned': str(gross_earned),
            'claimed_total': str(claimed),
            'claimable': str(claimable),
            'tiers': [
                {'tier': 1, 'label': 'Direct VIPs', 'rate': '5.0% + ₹50/signup', 'count': t1_profiles.count(), 'volume': str(t1_vol), 'earned': str(t1_earned.quantize(Decimal('0.01')))},
                {'tier': 2, 'label': 'Sub-Partners', 'rate': '2.0% Turnover', 'count': t2_profiles.count(), 'volume': str(t2_vol), 'earned': str(t2_earned.quantize(Decimal('0.01')))},
                {'tier': 3, 'label': 'Extended Guild', 'rate': '1.0% Turnover', 'count': t3_profiles.count(), 'volume': str(t3_vol), 'earned': str(t3_earned.quantize(Decimal('0.01')))},
            ],
        }

    def get(self, request):
        return Response(self._compute_stats(request.user))

    def post(self, request):
        with transaction.atomic():
            profile = UserProfile.objects.select_for_update().get(user=request.user)
            stats = self._compute_stats(request.user)
            claimable = Decimal(stats['claimable'])
            if claimable < Decimal('10.00'):
                return Response({'error': 'Minimum claimable commission is ₹10. Invite players or wager to unlock.'}, status=status.HTTP_400_BAD_REQUEST)

            LedgerService.ensure_wallet_accounts(request.user)
            LedgerService.process_credit(
                user=request.user,
                account_type=AccountType.MAIN,
                amount=claimable,
                tx_type=TransactionType.REFERRAL_PAYOUT,
                description="Multi-Tier Referral Commission Claim",
                metadata={'claimed': str(claimable)},
            )
            new_claimed = Decimal(stats['claimed_total']) + claimable
            profile.preferences['referral_claimed_total'] = str(new_claimed)
            profile.save(update_fields=['preferences'])

        accounts = LedgerService.ensure_wallet_accounts(request.user)
        stats_after = self._compute_stats(request.user)
        stats_after['message'] = f'₹{claimable} commission credited to your Real Cash wallet!'
        stats_after['balances'] = {k: str(v.balance) for k, v in accounts.items()}
        return Response(stats_after)


class TournamentsListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        tournaments = Tournament.objects.all().order_by('ends_at')
        serializer = TournamentSerializer(tournaments, many=True, context={'user': request.user})
        return Response({'tournaments': serializer.data})


class TournamentJoinView(APIView):
    """Enrolls user into an Hourly/Weekend Carrom or Ludo tournament bracket."""

    def post(self, request):
        t_id = request.data.get('tournament_id')
        account_type = request.data.get('account_type', AccountType.DEMO)
        if not t_id:
            return Response({'error': 'tournament_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            tourney = Tournament.objects.select_for_update().filter(id=t_id).first()
            if not tourney:
                return Response({'error': 'Tournament not found.'}, status=status.HTTP_404_NOT_FOUND)

            if TournamentEntry.objects.filter(tournament=tourney, user=request.user).exists():
                return Response({'error': 'You are already registered in this tournament.'}, status=status.HTTP_400_BAD_REQUEST)

            if tourney.entry_fee > 0:
                LedgerService.ensure_wallet_accounts(request.user)
                LedgerService.process_debit(
                    user=request.user,
                    account_type=account_type,
                    amount=tourney.entry_fee,
                    tx_type=TransactionType.GAME_BET,
                    idempotency_key=f"TRN_{tourney.slug}_{request.user.id}",
                    description=f"Tournament Entry: {tourney.title}",
                    metadata={'tournament': tourney.slug},
                )

            TournamentEntry.objects.create(
                tournament=tourney,
                user=request.user,
                account_type=account_type,
            )

        accounts = LedgerService.ensure_wallet_accounts(request.user)
        return Response({
            'message': f'Registered for {tourney.title}! Bracket seed locked.',
            'tournament': TournamentSerializer(tourney, context={'user': request.user}).data,
            'balances': {k: str(v.balance) for k, v in accounts.items()},
        }, status=status.HTTP_201_CREATED)


class LoungeFeedView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        messages = LoungeMessage.objects.all().order_by('-created_at')[:30]
        ordered = list(reversed(messages))
        return Response({
            'messages': LoungeMessageSerializer(ordered, many=True, context={'user': request.user}).data
        })

    def post(self, request):
        if not request.user.is_authenticated:
            return Response({'error': 'Please sign in to chat in Lounge.'}, status=status.HTTP_401_UNAUTHORIZED)

        text = str(request.data.get('message', '')).strip()[:240]
        if not text:
            return Response({'error': 'Message cannot be empty.'}, status=status.HTTP_400_BAD_REQUEST)

        msg = LoungeMessage.objects.create(
            sender=request.user,
            sender_name=request.user.username,
            vip_tier=getattr(request.user.profile, 'vip_tier', 'BRONZE'),
            message=text,
            msg_type='CHAT',
        )
        return Response({
            'message': LoungeMessageSerializer(msg, context={'user': request.user}).data
        }, status=status.HTTP_201_CREATED)


class LoungeRainView(APIView):
    """Supports dropping a bonus Rain to lounge players or claiming an active Rain Drop."""

    def post(self, request):
        action = request.data.get('action', 'claim')
        if action == 'drop':
            amount = Decimal(str(request.data.get('amount', '100')))
            account_type = request.data.get('account_type', AccountType.DEMO)
            if amount < Decimal('50') or amount > Decimal('5000'):
                return Response({'error': 'Rain amount must be between ₹50 and ₹5,000.'}, status=status.HTTP_400_BAD_REQUEST)

            with transaction.atomic():
                LedgerService.ensure_wallet_accounts(request.user)
                LedgerService.process_debit(
                    user=request.user,
                    account_type=account_type,
                    amount=amount,
                    tx_type=TransactionType.BONUS_CREDIT,
                    description=f"High-Roller Lounge Rain Drop (₹{amount})",
                )
                per_claim = (amount / Decimal('5')).quantize(Decimal('0.01'))
                drop = RainDrop.objects.create(
                    creator=request.user,
                    creator_name=request.user.username,
                    total_amount=amount,
                    per_claim_amount=per_claim,
                    max_claims=5,
                )
                msg = LoungeMessage.objects.create(
                    sender=request.user,
                    sender_name=request.user.username,
                    vip_tier=getattr(request.user.profile, 'vip_tier', 'GOLD'),
                    message=f"☔ Dropped ₹{amount:.0f} Bonus Rain! First 5 players grab ₹{per_claim:.0f} each!",
                    msg_type='RAIN',
                    rain_amount=amount,
                    rain_drop=drop,
                )

            accounts = LedgerService.ensure_wallet_accounts(request.user)
            return Response({
                'message': f'₹{amount:.0f} Rain dropped into Lounge!',
                'lounge_message': LoungeMessageSerializer(msg, context={'user': request.user}).data,
                'balances': {k: str(v.balance) for k, v in accounts.items()},
            }, status=status.HTTP_201_CREATED)

        # Claim action
        drop_id = request.data.get('rain_drop_id')
        if not drop_id:
            return Response({'error': 'rain_drop_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            drop = RainDrop.objects.select_for_update().filter(id=drop_id, is_active=True).first()
            if not drop or drop.claimed_count >= drop.max_claims:
                return Response({'error': 'This Rain Drop has already been fully claimed!'}, status=status.HTTP_400_BAD_REQUEST)

            if RainClaim.objects.filter(rain_drop=drop, user=request.user).exists():
                return Response({'error': 'You already grabbed this Rain Drop!'}, status=status.HTTP_400_BAD_REQUEST)

            RainClaim.objects.create(rain_drop=drop, user=request.user, amount=drop.per_claim_amount)
            drop.claimed_count += 1
            if drop.claimed_count >= drop.max_claims:
                drop.is_active = False
            drop.save(update_fields=['claimed_count', 'is_active'])

            LedgerService.ensure_wallet_accounts(request.user)
            LedgerService.process_credit(
                user=request.user,
                account_type=AccountType.BONUS,
                amount=drop.per_claim_amount,
                tx_type=TransactionType.BONUS_CREDIT,
                idempotency_key=f"RAIN_{drop.id}_{request.user.id}",
                description=f"Caught Lounge Rain from @{drop.creator_name}",
            )

        accounts = LedgerService.ensure_wallet_accounts(request.user)
        return Response({
            'message': f'Caught Rain! +₹{drop.per_claim_amount:.0f} credited to Bonus Vault.',
            'claimed_amount': str(drop.per_claim_amount),
            'balances': {k: str(v.balance) for k, v in accounts.items()},
        })

import uuid
from decimal import Decimal
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from apps.cms.models import Banner, Announcement, SupportTicket, TicketMessage, PromotionCampaign
from apps.cms.serializers import (
    BannerSerializer, AnnouncementSerializer,
    SupportTicketSerializer, TicketMessageSerializer, PromotionCampaignSerializer
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

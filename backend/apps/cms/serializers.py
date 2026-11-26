from rest_framework import serializers
from apps.cms.models import (
    Banner, Announcement, SupportTicket, TicketMessage,
    PromotionCampaign, PromoRedemption, Tournament, TournamentEntry,
    RainDrop, LoungeMessage
)

class BannerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Banner
        fields = ['id', 'title', 'subtitle', 'image_url', 'link_url', 'badge_text', 'order']

class AnnouncementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Announcement
        fields = ['id', 'title', 'content', 'announcement_type', 'created_at']

class TicketMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.username', read_only=True)

    class Meta:
        model = TicketMessage
        fields = ['id', 'sender_name', 'is_admin_reply', 'message', 'created_at']

class SupportTicketSerializer(serializers.ModelSerializer):
    messages = TicketMessageSerializer(many=True, read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = SupportTicket
        fields = [
            'id', 'ticket_number', 'username', 'category', 'priority',
            'subject', 'status', 'created_at', 'updated_at', 'messages'
        ]

class PromotionCampaignSerializer(serializers.ModelSerializer):
    class Meta:
        model = PromotionCampaign
        fields = [
            'id', 'title', 'code', 'bonus_percentage', 'bonus_fixed_amount',
            'min_deposit', 'max_bonus', 'is_active', 'expires_at'
        ]


class PromoRedemptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PromoRedemption
        fields = ['id', 'code', 'reward_amount', 'account_type', 'redeemed_at']


class TournamentSerializer(serializers.ModelSerializer):
    participants_count = serializers.SerializerMethodField()
    is_joined = serializers.SerializerMethodField()

    class Meta:
        model = Tournament
        fields = [
            'id', 'slug', 'title', 'game_slug', 'schedule_type',
            'prize_pool', 'entry_fee', 'max_players', 'participants_count',
            'status', 'ends_at', 'bracket_json', 'is_joined'
        ]

    def get_participants_count(self, obj):
        return min(obj.max_players, obj.base_joined_count + obj.entries.count())

    def get_is_joined(self, obj):
        user = self.context.get('user')
        if not user or not user.is_authenticated:
            return False
        return obj.entries.filter(user=user).exists()


class LoungeMessageSerializer(serializers.ModelSerializer):
    rain_info = serializers.SerializerMethodField()

    class Meta:
        model = LoungeMessage
        fields = [
            'id', 'sender_name', 'vip_tier', 'message',
            'msg_type', 'rain_amount', 'rain_drop', 'rain_info', 'created_at'
        ]

    def get_rain_info(self, obj):
        if not obj.rain_drop:
            return None
        rd = obj.rain_drop
        user = self.context.get('user')
        already_claimed = False
        if user and user.is_authenticated:
            already_claimed = rd.claims.filter(user=user).exists()
        return {
            'id': str(rd.id),
            'per_claim_amount': str(rd.per_claim_amount),
            'claimed_count': rd.claimed_count,
            'max_claims': rd.max_claims,
            'is_active': rd.is_active and rd.claimed_count < rd.max_claims,
            'already_claimed': already_claimed,
        }

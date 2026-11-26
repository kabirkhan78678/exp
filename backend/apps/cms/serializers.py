from rest_framework import serializers
from apps.cms.models import Banner, Announcement, SupportTicket, TicketMessage, PromotionCampaign

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

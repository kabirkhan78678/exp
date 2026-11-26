from django.urls import path
from apps.cms.views import (
    BannersView, AnnouncementsView, SupportTicketsView,
    TicketReplyView, DailyRewardClaimView, PromotionsListView
)

urlpatterns = [
    path('banners/', BannersView.as_view(), name='cms_banners'),
    path('announcements/', AnnouncementsView.as_view(), name='cms_announcements'),
    path('tickets/', SupportTicketsView.as_view(), name='cms_tickets'),
    path('tickets/<uuid:ticket_id>/reply/', TicketReplyView.as_view(), name='cms_ticket_reply'),
    path('daily-reward/claim/', DailyRewardClaimView.as_view(), name='cms_daily_reward'),
    path('promotions/', PromotionsListView.as_view(), name='cms_promotions'),
]

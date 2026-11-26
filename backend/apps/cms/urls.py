from django.urls import path
from apps.cms.views import (
    BannersView, AnnouncementsView, SupportTicketsView,
    TicketReplyView, DailyRewardClaimView, PromotionsListView,
    PromoRedeemView, ReferralStatsView, TournamentsListView,
    TournamentJoinView, LoungeFeedView, LoungeRainView
)

urlpatterns = [
    path('banners/', BannersView.as_view(), name='cms_banners'),
    path('announcements/', AnnouncementsView.as_view(), name='cms_announcements'),
    path('tickets/', SupportTicketsView.as_view(), name='cms_tickets'),
    path('tickets/<uuid:ticket_id>/reply/', TicketReplyView.as_view(), name='cms_ticket_reply'),
    path('daily-reward/claim/', DailyRewardClaimView.as_view(), name='cms_daily_reward'),
    path('promotions/', PromotionsListView.as_view(), name='cms_promotions'),
    path('promo/redeem/', PromoRedeemView.as_view(), name='cms_promo_redeem'),
    path('referrals/', ReferralStatsView.as_view(), name='cms_referrals'),
    path('tournaments/', TournamentsListView.as_view(), name='cms_tournaments'),
    path('tournaments/join/', TournamentJoinView.as_view(), name='cms_tournaments_join'),
    path('lounge/', LoungeFeedView.as_view(), name='cms_lounge'),
    path('lounge/rain/', LoungeRainView.as_view(), name='cms_lounge_rain'),
]

import uuid
from decimal import Decimal
from django.db import models
from django.conf import settings
from django.utils import timezone

class Banner(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    subtitle = models.CharField(max_length=300, blank=True, default='')
    image_url = models.CharField(max_length=500, blank=True, default='')
    link_url = models.CharField(max_length=200, default='/games')
    badge_text = models.CharField(max_length=50, default='FEATURED')
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['order', '-created_at']

    def __str__(self):
        return self.title

class Announcement(models.Model):
    class Type(models.TextChoices):
        INFO = 'INFO', 'Information'
        PROMO = 'PROMO', 'Promotion'
        MAINTENANCE = 'MAINTENANCE', 'System Maintenance'
        WINNER = 'WINNER', 'Big Winner Alert'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    content = models.TextField()
    announcement_type = models.CharField(max_length=20, choices=Type.choices, default=Type.INFO)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.announcement_type}: {self.title}"

class SupportTicket(models.Model):
    class Category(models.TextChoices):
        DEPOSIT = 'DEPOSIT', 'Deposit Inquiry'
        WITHDRAWAL = 'WITHDRAWAL', 'Withdrawal Request'
        GAME = 'GAME', 'Game Outcome / Rule'
        ACCOUNT = 'ACCOUNT', 'Account Security & KYC'
        TECHNICAL = 'TECHNICAL', 'Technical Glitch'

    class Priority(models.TextChoices):
        LOW = 'LOW', 'Low'
        MEDIUM = 'MEDIUM', 'Medium'
        HIGH = 'HIGH', 'High'
        CRITICAL = 'CRITICAL', 'Critical'

    class Status(models.TextChoices):
        OPEN = 'OPEN', 'Open'
        IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
        RESOLVED = 'RESOLVED', 'Resolved'
        CLOSED = 'CLOSED', 'Closed'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='support_tickets')
    ticket_number = models.CharField(max_length=32, unique=True, db_index=True)
    category = models.CharField(max_length=20, choices=Category.choices, default=Category.TECHNICAL)
    priority = models.CharField(max_length=20, choices=Priority.choices, default=Priority.MEDIUM)
    subject = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.OPEN)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Ticket #{self.ticket_number} ({self.status}) - {self.subject}"

class TicketMessage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ticket = models.ForeignKey(SupportTicket, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    is_admin_reply = models.BooleanField(default=False)
    message = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Message by {self.sender.username} on Ticket #{self.ticket.ticket_number}"

class PromotionCampaign(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    code = models.CharField(max_length=32, unique=True)
    bonus_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=50.00)
    bonus_fixed_amount = models.DecimalField(max_digits=18, decimal_places=4, default=0.0000)
    min_deposit = models.DecimalField(max_digits=18, decimal_places=4, default=100.0000)
    max_bonus = models.DecimalField(max_digits=18, decimal_places=4, default=5000.0000)
    is_active = models.BooleanField(default=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.title} ({self.code})"


class PromoRedemption(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='promo_redemptions')
    campaign = models.ForeignKey(PromotionCampaign, on_delete=models.CASCADE, related_name='redemptions')
    code = models.CharField(max_length=32)
    reward_amount = models.DecimalField(max_digits=18, decimal_places=4)
    account_type = models.CharField(max_length=20, default='BONUS')
    redeemed_at = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ('user', 'campaign')

    def __str__(self):
        return f"{self.user.username} redeemed {self.code} (+{self.reward_amount})"


class Tournament(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    slug = models.CharField(max_length=64, unique=True)
    title = models.CharField(max_length=160)
    game_slug = models.CharField(max_length=32, default='carrom')
    schedule_type = models.CharField(max_length=20, default='HOURLY')
    prize_pool = models.DecimalField(max_digits=18, decimal_places=4)
    entry_fee = models.DecimalField(max_digits=18, decimal_places=4, default=Decimal('0.0000'))
    max_players = models.PositiveIntegerField(default=64)
    base_joined_count = models.PositiveIntegerField(default=24)
    status = models.CharField(max_length=20, default='LIVE')
    ends_at = models.DateTimeField()
    bracket_json = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['ends_at', '-prize_pool']

    def __str__(self):
        return f"{self.title} (₹{self.prize_pool})"


class TournamentEntry(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name='entries')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='tournament_entries')
    score = models.IntegerField(default=0)
    account_type = models.CharField(max_length=20, default='DEMO')
    joined_at = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ('tournament', 'user')

    def __str__(self):
        return f"{self.user.username} @ {self.tournament.slug} ({self.score} pts)"


class RainDrop(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    creator = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    creator_name = models.CharField(max_length=64, default='VELTRIX_VAULT')
    total_amount = models.DecimalField(max_digits=18, decimal_places=4)
    per_claim_amount = models.DecimalField(max_digits=18, decimal_places=4)
    max_claims = models.PositiveIntegerField(default=10)
    claimed_count = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)


class RainClaim(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    rain_drop = models.ForeignKey(RainDrop, on_delete=models.CASCADE, related_name='claims')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='rain_claims')
    amount = models.DecimalField(max_digits=18, decimal_places=4)
    claimed_at = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ('rain_drop', 'user')


class LoungeMessage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    sender_name = models.CharField(max_length=64)
    vip_tier = models.CharField(max_length=24, default='BRONZE')
    message = models.CharField(max_length=280)
    msg_type = models.CharField(max_length=20, default='CHAT')
    rain_amount = models.DecimalField(max_digits=18, decimal_places=4, default=Decimal('0.0000'))
    rain_drop = models.ForeignKey(RainDrop, null=True, blank=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(default=timezone.now, db_index=True)

    class Meta:
        ordering = ['created_at']

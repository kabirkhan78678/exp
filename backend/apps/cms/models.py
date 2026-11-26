import uuid
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

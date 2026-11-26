import uuid
from decimal import Decimal
from django.db import models
from django.conf import settings
from django.utils import timezone

class GameCategory(models.TextChoices):
    CRASH = 'CRASH', 'AeroCrash / Multiplier'
    TABLE = 'TABLE', 'Table Games'
    CARDS = 'CARDS', 'Card Games'
    SKILL = 'SKILL', 'Skill & Physics'

class Game(models.Model):
    slug = models.SlugField(max_length=50, primary_key=True)
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=20, choices=GameCategory.choices)
    thumbnail_url = models.CharField(max_length=500, blank=True, default='')
    description = models.TextField(blank=True, default='')
    min_stake = models.DecimalField(max_digits=18, decimal_places=4, default=Decimal('10.0000'))
    max_stake = models.DecimalField(max_digits=18, decimal_places=4, default=Decimal('10000.0000'))
    house_edge = models.DecimalField(max_digits=5, decimal_places=4, default=Decimal('0.0300')) # 3%
    is_active = models.BooleanField(default=True)
    is_maintenance = models.BooleanField(default=False)
    config = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.name} ({self.slug})"

class RoundStatus(models.TextChoices):
    SCHEDULED = 'SCHEDULED', 'Scheduled'
    BETTING_OPEN = 'BETTING_OPEN', 'Betting Open'
    IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
    SETTLED = 'SETTLED', 'Settled'
    CANCELLED = 'CANCELLED', 'Cancelled'

class GameRound(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name='rounds')
    round_number = models.CharField(max_length=64, unique=True, db_index=True)
    server_seed = models.CharField(max_length=128)
    server_seed_hash = models.CharField(max_length=64, db_index=True)
    client_seed = models.CharField(max_length=128, default='veltrix-community-seed-1')
    nonce = models.PositiveIntegerField(default=1)
    final_outcome = models.DecimalField(max_digits=18, decimal_places=4, null=True, blank=True)
    outcome_payload = models.JSONField(default=dict, blank=True)
    status = models.CharField(max_length=20, choices=RoundStatus.choices, default=RoundStatus.BETTING_OPEN)
    started_at = models.DateTimeField(default=timezone.now)
    ended_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.game.name} - Round {self.round_number} [{self.status}]"

class BetStatus(models.TextChoices):
    PLACED = 'PLACED', 'Bet Placed'
    WON = 'WON', 'Won'
    LOST = 'LOST', 'Lost'
    CASHED_OUT = 'CASHED_OUT', 'Cashed Out'
    CANCELLED = 'CANCELLED', 'Cancelled'

class Bet(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    round = models.ForeignKey(GameRound, on_delete=models.CASCADE, related_name='bets')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='bets')
    account = models.ForeignKey('wallet.WalletAccount', on_delete=models.CASCADE, related_name='bets')
    stake_amount = models.DecimalField(max_digits=18, decimal_places=4)
    bet_choice = models.CharField(max_length=50, default='CRASH') # 'CRASH', 'DRAGON', 'TIGER', 'TIE', 'CHAAL'
    auto_cashout = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    cashout_multiplier = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    payout_amount = models.DecimalField(max_digits=18, decimal_places=4, default=Decimal('0.0000'))
    status = models.CharField(max_length=20, choices=BetStatus.choices, default=BetStatus.PLACED)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Bet by {self.user.username} on {self.round.round_number}: {self.stake_amount} [{self.status}]"

class MultiplayerRoom(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name='rooms')
    room_code = models.CharField(max_length=16, unique=True, db_index=True)
    room_type = models.CharField(max_length=20, default='PUBLIC') # PUBLIC, PRIVATE
    max_players = models.PositiveIntegerField(default=5)
    boot_amount = models.DecimalField(max_digits=18, decimal_places=4, default=Decimal('50.0000'))
    status = models.CharField(max_length=20, default='WAITING') # WAITING, ACTIVE, FINISHED
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    room_state = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Room {self.room_code} ({self.game.name})"

class RoomParticipant(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    room = models.ForeignKey(MultiplayerRoom, on_delete=models.CASCADE, related_name='participants')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    seat_number = models.PositiveIntegerField()
    is_ready = models.BooleanField(default=False)
    is_folded = models.BooleanField(default=False)
    cards = models.JSONField(default=list, blank=True)
    current_stake = models.DecimalField(max_digits=18, decimal_places=4, default=Decimal('0.0000'))
    joined_at = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = (('room', 'seat_number'), ('room', 'user'))

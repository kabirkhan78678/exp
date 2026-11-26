import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone

class UserManager(BaseUserManager):
    def create_user(self, email, username, password=None, **extra_fields):
        if not email:
            raise ValueError('Email address is required')
        if not username:
            raise ValueError('Username is required')
        email = self.normalize_email(email)
        user = self.model(email=email, username=username, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'super_admin')
        return self.create_user(email, username, password, **extra_fields)

class UserRole(models.TextChoices):
    PLAYER = 'player', 'Player'
    SUPPORT = 'support', 'Support Agent'
    FINANCE = 'finance_manager', 'Finance Manager'
    GAME_MANAGER = 'game_manager', 'Game Manager'
    OPERATIONS = 'operations_admin', 'Operations Admin'
    SUPER_ADMIN = 'super_admin', 'Super Admin'

class User(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, db_index=True)
    username = models.CharField(max_length=50, unique=True, db_index=True)
    phone = models.CharField(max_length=30, blank=True, null=True)
    role = models.CharField(max_length=30, choices=UserRole.choices, default=UserRole.PLAYER)
    
    is_active = models.BooleanField(default=True)
    is_frozen = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)
    two_factor_enabled = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    def __str__(self):
        return f"{self.username} ({self.role})"

    @property
    def is_admin(self):
        return self.role in [
            UserRole.SUPER_ADMIN,
            UserRole.OPERATIONS,
            UserRole.FINANCE,
            UserRole.GAME_MANAGER,
            UserRole.SUPPORT
        ]

class VIPTier(models.TextChoices):
    BRONZE = 'BRONZE', 'Bronze'
    SILVER = 'SILVER', 'Silver'
    GOLD = 'GOLD', 'Gold'
    PLATINUM = 'PLATINUM', 'Platinum'
    DIAMOND = 'DIAMOND', 'Diamond'
    ELITE = 'ELITE', 'Elite'

class KYCStatus(models.TextChoices):
    UNVERIFIED = 'UNVERIFIED', 'Unverified'
    PENDING = 'PENDING', 'Pending Review'
    VERIFIED = 'VERIFIED', 'Verified'
    REJECTED = 'REJECTED', 'Rejected'

class UserProfile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    avatar_url = models.CharField(max_length=500, blank=True, null=True)
    vip_tier = models.CharField(max_length=30, choices=VIPTier.choices, default=VIPTier.BRONZE)
    loyalty_points = models.DecimalField(max_digits=18, decimal_places=4, default=0.0)
    total_wagered = models.DecimalField(max_digits=18, decimal_places=4, default=0.0)
    total_won = models.DecimalField(max_digits=18, decimal_places=4, default=0.0)
    kyc_status = models.CharField(max_length=30, choices=KYCStatus.choices, default=KYCStatus.UNVERIFIED)
    kyc_notes = models.TextField(blank=True, null=True)
    referral_code = models.CharField(max_length=32, unique=True)
    referred_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='referrals')
    preferences = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Profile of {self.user.username} [{self.vip_tier}]"

class UserSession(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sessions')
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True, null=True)
    device_info = models.CharField(max_length=255, blank=True, null=True)
    last_active = models.DateTimeField(auto_now=True)
    is_revoked = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)

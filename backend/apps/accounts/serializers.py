from rest_framework import serializers
from django.contrib.auth import authenticate
from apps.accounts.models import User, UserProfile, UserSession, UserRole, VIPTier, KYCStatus
from apps.wallet.services import LedgerService
import uuid

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = [
            'avatar_url', 'vip_tier', 'loyalty_points', 'total_wagered',
            'total_won', 'kyc_status', 'kyc_notes', 'referral_code', 'preferences'
        ]

class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    is_admin = serializers.BooleanField(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'phone', 'role', 'is_admin',
            'is_active', 'is_frozen', 'is_verified', 'created_at', 'profile'
        ]

class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    username = serializers.CharField(max_length=50)
    password = serializers.CharField(min_length=6, write_only=True)
    phone = serializers.CharField(max_length=30, required=False, allow_blank=True)
    referral_code = serializers.CharField(max_length=32, required=False, allow_blank=True)

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value.lower()

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("This username is already taken.")
        return value

    def create(self, validated_data):
        password = validated_data.pop('password')
        ref_code = validated_data.pop('referral_code', None)
        referred_by = None
        if ref_code:
            referred_by_profile = UserProfile.objects.filter(referral_code=ref_code).first()
            if referred_by_profile:
                referred_by = referred_by_profile.user

        user = User.objects.create_user(password=password, **validated_data)
        
        # Create profile with unique referral code
        my_ref_code = f"VLTX{uuid.uuid4().hex[:6].upper()}"
        UserProfile.objects.create(
            user=user,
            referral_code=my_ref_code,
            referred_by=referred_by,
            preferences={"sound": True, "auto_cashout": True, "theme": "midnight_aurora"}
        )

        # Setup wallet accounts (10,000 DEMO credits awarded automatically)
        LedgerService.ensure_wallet_accounts(user)

        return user

class LoginSerializer(serializers.Serializer):
    login = serializers.CharField() # Can be username or email
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        login = attrs.get('login')
        password = attrs.get('password')

        user = User.objects.filter(email__iexact=login).first() or User.objects.filter(username__iexact=login).first()
        if not user or not user.check_password(password):
            raise serializers.ValidationError("Invalid username/email or password.")

        if not user.is_active:
            raise serializers.ValidationError("This account has been deactivated.")
        if user.is_frozen:
            raise serializers.ValidationError("Account is suspended. Please contact customer support.")

        attrs['user'] = user
        return attrs

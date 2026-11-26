import jwt
import datetime
from django.conf import settings
from rest_framework import authentication, exceptions
from apps.accounts.models import User

def generate_tokens_for_user(user):
    now = datetime.datetime.now(datetime.timezone.utc)
    access_payload = {
        'sub': str(user.id),
        'username': user.username,
        'email': user.email,
        'role': user.role,
        'is_admin': user.is_admin,
        'exp': now + datetime.timedelta(hours=24),
        'iat': now,
        'type': 'access'
    }
    refresh_payload = {
        'sub': str(user.id),
        'exp': now + datetime.timedelta(days=7),
        'iat': now,
        'type': 'refresh'
    }
    access_token = jwt.encode(access_payload, settings.SECRET_KEY, algorithm='HS256')
    refresh_token = jwt.encode(refresh_payload, settings.SECRET_KEY, algorithm='HS256')
    return {
        'access': access_token,
        'refresh': refresh_token
    }

class JWTAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return None

        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            return None

        token = parts[1]
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            raise exceptions.AuthenticationFailed('Authentication token has expired.')
        except jwt.InvalidTokenError:
            raise exceptions.AuthenticationFailed('Invalid authentication token.')

        if payload.get('type') != 'access':
            raise exceptions.AuthenticationFailed('Invalid token type.')

        user_id = payload.get('sub')
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            raise exceptions.AuthenticationFailed('User not found.')

        if not user.is_active:
            raise exceptions.AuthenticationFailed('User account is disabled.')
        if user.is_frozen:
            raise exceptions.AuthenticationFailed('User account is frozen. Contact support.')

        return (user, token)

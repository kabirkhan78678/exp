from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from apps.accounts.serializers import RegisterSerializer, LoginSerializer, UserSerializer
from apps.accounts.authentication import generate_tokens_for_user
from apps.accounts.models import User, UserProfile

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            tokens = generate_tokens_for_user(user)
            return Response({
                'message': 'Registration successful. Welcome to Veltrix Arena!',
                'user': UserSerializer(user).data,
                'tokens': tokens
            }, status=status.HTTP_201_CREATED)
        return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            tokens = generate_tokens_for_user(user)
            return Response({
                'message': 'Login successful.',
                'user': UserSerializer(user).data,
                'tokens': tokens
            })
        return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

class ProfileView(APIView):
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response({'user': serializer.data})

    def patch(self, request):
        user = request.user
        profile = user.profile
        preferences = request.data.get('preferences')
        if preferences and isinstance(preferences, dict):
            profile.preferences.update(preferences)
            profile.save(update_fields=['preferences'])

        phone = request.data.get('phone')
        if phone is not None:
            user.phone = phone
            user.save(update_fields=['phone'])

        return Response({
            'message': 'Profile updated successfully.',
            'user': UserSerializer(user).data
        })

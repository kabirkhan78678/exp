from django.urls import path
from apps.accounts.views import RegisterView, LoginView, ProfileView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('login/', LoginView.as_view(), name='auth_login'),
    path('profile/', ProfileView.as_view(), name='auth_profile'),
]

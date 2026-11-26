from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('django-admin/', admin.site.urls),
    path('api/auth/', include('apps.accounts.urls')),
    path('api/wallet/', include('apps.wallet.urls')),
    path('api/games/', include('apps.games.urls')),
    path('api/admin/', include('apps.admin_center.urls')),
    path('api/cms/', include('apps.cms.urls')),
]

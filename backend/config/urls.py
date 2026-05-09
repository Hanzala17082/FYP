"""
Root URL configuration. API is mounted at /api/
"""
from django.contrib import admin
from django.urls import path, include

from api.views import root_health

urlpatterns = [
    path('', root_health),
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
]

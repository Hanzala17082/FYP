"""
API URL routing. All paths here are under /api/
Support both with and without trailing slash (frontend calls e.g. /api/trips?limit=50).
"""
from django.urls import path, include

urlpatterns = [
    path('auth/', include('users.urls')),
    path('auth', include('users.urls')),
    path('trips/', include('trips.urls')),
    path('trips', include('trips.urls')),
    path('bookings/', include('bookings.urls')),
    path('bookings', include('bookings.urls')),
    path('agencies/', include('vendors.urls')),
    path('agencies', include('vendors.urls')),
    path('reviews/', include('reviews.urls')),
    path('reviews', include('reviews.urls')),
    path('dashboard/', include('dashboard.urls')),
    path('dashboard', include('dashboard.urls')),
]

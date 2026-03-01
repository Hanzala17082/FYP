from django.urls import path
from . import views

urlpatterns = [
    path('traveler', views.TravelerDashboardView.as_view()),
    path('agency', views.AgencyDashboardView.as_view()),
    path('admin', views.AdminDashboardView.as_view()),
]

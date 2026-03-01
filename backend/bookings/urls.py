from django.urls import path
from . import views

urlpatterns = [
    path('', views.BookingListCreateView.as_view()),
    path('<uuid:pk>', views.BookingDetailView.as_view()),
    path('<uuid:pk>/status', views.BookingStatusView.as_view()),
]

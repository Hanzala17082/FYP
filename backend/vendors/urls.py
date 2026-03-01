from django.urls import path
from . import views

from reviews.views import AgencyReviewListView

urlpatterns = [
    path('', views.AgencyListView.as_view()),
    path('<str:slug_or_id>/reviews', AgencyReviewListView.as_view()),
    path('<str:slug_or_id>/trips', views.AgencyTripsView.as_view()),
    path('<str:slug_or_id>', views.AgencyDetailView.as_view()),
]

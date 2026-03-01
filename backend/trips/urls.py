from django.urls import path
from . import views
from reviews.views import TripReviewListView

urlpatterns = [
    path('', views.TripListCreateView.as_view()),
    path('featured', views.TripFeaturedView.as_view()),
    path('search', views.TripSearchView.as_view()),
    path('<uuid:id>/reviews', TripReviewListView.as_view()),
    path('<uuid:id>', views.TripUpdateView.as_view()),
    path('<str:slug>', views.TripDetailView.as_view()),
]

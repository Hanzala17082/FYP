from django.urls import path
from . import views

urlpatterns = [
    path('', views.CreateReviewView.as_view()),
]

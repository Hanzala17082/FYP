from django.urls import path
from . import views

urlpatterns = [
    path('login', views.LoginView.as_view()),
    path('register', views.RegisterView.as_view()),
    path('refresh', views.RefreshView.as_view()),
    path('logout', views.LogoutView.as_view()),
    path('forgot-password', views.ForgotPasswordView.as_view()),
    path('reset-password', views.ResetPasswordView.as_view()),
    path('users/<uuid:pk>', views.UserDetailView.as_view()),
]

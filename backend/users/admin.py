from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, TravelerProfile, RefreshToken, PasswordResetToken


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'full_name', 'role', 'is_active')
    list_filter = ('role',)
    search_fields = ('email', 'full_name')
    ordering = ('email',)
    fieldsets = BaseUserAdmin.fieldsets + (('Extra', {'fields': ('full_name', 'role', 'city', 'avatar_url', 'is_email_verified')}),)


@admin.register(TravelerProfile)
class TravelerProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'cnic')


@admin.register(RefreshToken)
class RefreshTokenAdmin(admin.ModelAdmin):
    list_display = ('user', 'expires_at', 'revoked_at')


@admin.register(PasswordResetToken)
class PasswordResetTokenAdmin(admin.ModelAdmin):
    list_display = ('user', 'expires_at', 'used_at')

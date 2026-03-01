from django.contrib import admin
from .models import Review


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('traveler', 'trip', 'agency', 'rating', 'created_at')

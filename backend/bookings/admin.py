from django.contrib import admin
from .models import Booking


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('trip', 'traveler', 'status', 'start_date', 'end_date')

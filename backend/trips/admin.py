from django.contrib import admin
from .models import Trip, TripHighlight, TripSchedule, TripScheduleActivity, TripRecreationalActivity


class TripHighlightInline(admin.TabularInline):
    model = TripHighlight
    extra = 0


class TripScheduleInline(admin.TabularInline):
    model = TripSchedule
    extra = 0


@admin.register(Trip)
class TripAdmin(admin.ModelAdmin):
    list_display = ('title', 'slug', 'agency', 'destination', 'status', 'price')
    list_filter = ('status',)
    inlines = [TripHighlightInline, TripScheduleInline]


@admin.register(TripRecreationalActivity)
class TripRecreationalActivityAdmin(admin.ModelAdmin):
    list_display = ('trip', 'name', 'included', 'sort_order')


@admin.register(TripScheduleActivity)
class TripScheduleActivityAdmin(admin.ModelAdmin):
    list_display = ('schedule', 'time', 'activity')

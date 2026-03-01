import uuid
from django.db import models
from vendors.models import Agency


class Trip(models.Model):
    class Status(models.TextChoices):
        ACTIVE = 'active', 'Active'
        PENDING = 'pending', 'Pending'
        COMPLETED = 'completed', 'Completed'
        CANCELLED = 'cancelled', 'Cancelled'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    agency = models.ForeignKey(Agency, on_delete=models.PROTECT, related_name='trips')
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, max_length=255)
    description = models.TextField()
    short_description = models.CharField(max_length=500)
    destination = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    duration_days = models.IntegerField()
    images = models.JSONField(default=list)  # list of URLs
    rating = models.DecimalField(max_digits=2, decimal_places=1, default=0)
    review_count = models.IntegerField(default=0)
    available_dates = models.JSONField(default=list)  # list of date strings
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    tags = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'trips'
        indexes = [
            models.Index(fields=['destination']),
        ]


class TripHighlight(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='highlights')
    text = models.TextField()
    sort_order = models.IntegerField(default=0)

    class Meta:
        db_table = 'trip_highlights'
        ordering = ['sort_order']


class TripSchedule(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='schedules')
    day = models.SmallIntegerField()
    date = models.DateField()
    title = models.CharField(max_length=255)

    class Meta:
        db_table = 'trip_schedules'
        ordering = ['day']


class TripScheduleActivity(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    schedule = models.ForeignKey(TripSchedule, on_delete=models.CASCADE, related_name='activities')
    time = models.TimeField()
    activity = models.TextField()

    class Meta:
        db_table = 'trip_schedule_activities'


class TripRecreationalActivity(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='recreational_activities')
    name = models.CharField(max_length=255)
    description = models.TextField()
    duration = models.CharField(max_length=100)
    included = models.BooleanField(default=False)
    additional_cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    sort_order = models.IntegerField(default=0)

    class Meta:
        db_table = 'trip_recreational_activities'
        ordering = ['sort_order']

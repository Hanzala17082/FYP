import uuid
from django.db import models
from users.models import User
from trips.models import Trip
from vendors.models import Agency


class Review(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='reviews', null=True, blank=True)
    agency = models.ForeignKey(Agency, on_delete=models.CASCADE, related_name='reviews', null=True, blank=True)
    traveler = models.ForeignKey(User, on_delete=models.PROTECT, related_name='reviews')
    rating = models.PositiveSmallIntegerField()  # 1-5, validated in serializer
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'reviews'
        constraints = [
            models.CheckConstraint(
                check=models.Q(trip_id__isnull=False) | models.Q(agency_id__isnull=False),
                name='review_target_trip_or_agency',
            )
        ]

"""Recalculate all trip prices to PKR (Rs. 20,000 – 200,000) based on duration and destination."""

from __future__ import annotations

from decimal import Decimal

from django.core.management.base import BaseCommand

from trips.models import Trip

PREMIUM = (
    'dubai', 'europe', 'london', 'paris', 'usa', 'america', 'bahamas', 'maldives',
    'switzerland', 'tokyo', 'singapore', 'turkey', 'istanbul', 'bali', 'thailand',
)
ADVENTURE = (
    'hunza', 'skardu', 'gilgit', 'naran', 'swat', 'chitral', 'fairy', 'kaghan',
    'neelum', 'astore', 'deosai', 'kalash',
)
LOCAL = (
    'lahore', 'karachi', 'islamabad', 'murree', 'rawalpindi', 'multan', 'peshawar',
    'faisalabad', 'quetta', 'hyderabad', 'sialkot',
)

TRIP_PRICE_MIN = 20_000
TRIP_PRICE_MAX = 200_000


def estimate_trip_price_pkr(duration_days: int, destination: str = '') -> int:
    days = max(1, int(duration_days or 1))
    dest = (destination or '').lower()

    daily_rate = 9_000
    if any(k in dest for k in PREMIUM):
        daily_rate = 14_000
    elif any(k in dest for k in ADVENTURE):
        daily_rate = 11_000
    elif any(k in dest for k in LOCAL):
        daily_rate = 7_000

    raw = daily_rate * days
    rounded = round(raw / 1_000) * 1_000
    return max(TRIP_PRICE_MIN, min(TRIP_PRICE_MAX, rounded))


class Command(BaseCommand):
    help = 'Set trip prices to PKR between 20,000 and 200,000 using duration and destination.'

    def handle(self, *args, **options):
        updated = 0
        for trip in Trip.objects.all().iterator():
            days = trip.duration_days or max(1, (trip.end_date - trip.start_date).days + 1)
            price = estimate_trip_price_pkr(days, trip.destination)
            if trip.price != Decimal(price):
                trip.price = Decimal(price)
                trip.save(update_fields=['price', 'updated_at'])
                updated += 1
        self.stdout.write(self.style.SUCCESS(f'Updated {updated} trip price(s) to PKR.'))

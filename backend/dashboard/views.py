"""
Dashboard API: aggregated stats and recent data per role (Traveler, Agency, Admin).
"""
from datetime import date
from typing import Optional

from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.request import Request

from common.responses import api_response, api_error
from common.jwt_utils import decode_access_token
from users.models import User
from vendors.models import Agency
from trips.models import Trip
from bookings.models import Booking
from bookings.serializers import booking_to_dto
from users.serializers import user_to_dto
from trips.serializers import trip_to_dto
from vendors.serializers import agency_to_dto


def _current_user(request: Request) -> Optional[User]:
    auth = request.META.get('HTTP_AUTHORIZATION') or ''
    if not auth.startswith('Bearer '):
        return None
    payload = decode_access_token(auth[7:].strip())
    if not payload:
        return None
    try:
        return User.objects.get(id=payload['sub'])
    except User.DoesNotExist:
        return None


class TravelerDashboardView(APIView):
    """GET /api/dashboard/traveler – Traveler only."""
    def get(self, request: Request):
        user = _current_user(request)
        if not user:
            return api_error('Authentication required.', status=401)
        if user.role != 'Traveler':
            return api_error('Traveler only.', status=403)
        today = date.today()
        bookings_qs = Booking.objects.select_related('trip', 'trip__agency', 'trip__agency__user', 'traveler').filter(traveler=user).order_by('-created_at')
        upcoming = list(bookings_qs.filter(end_date__gte=today, status__in=('pending', 'confirmed'))[:10])
        past = list(bookings_qs.filter(Q(end_date__lt=today) | Q(status__in=('cancelled', 'completed')))[:10])
        return api_response({
            'stats': {
                'totalBookings': bookings_qs.count(),
                'upcomingCount': bookings_qs.filter(end_date__gte=today, status__in=('pending', 'confirmed')).count(),
                'pastCount': bookings_qs.filter(Q(end_date__lt=today) | Q(status='completed')).count(),
            },
            'upcomingBookings': [booking_to_dto(b) for b in upcoming],
            'pastBookings': [booking_to_dto(b) for b in past],
        })


class AgencyDashboardView(APIView):
    """GET /api/dashboard/agency – Agency only."""
    def get(self, request: Request):
        user = _current_user(request)
        if not user:
            return api_error('Authentication required.', status=401)
        if user.role != 'Agency':
            return api_error('Agency only.', status=403)
        try:
            agency = user.agency
        except Agency.DoesNotExist:
            return api_error('Agency profile not found.', status=404)
        trips_qs = Trip.objects.filter(agency=agency)
        bookings_qs = Booking.objects.select_related('trip', 'traveler').filter(trip__agency=agency)
        recent_bookings = list(bookings_qs.order_by('-created_at')[:15])
        return api_response({
            'stats': {
                'totalTrips': trips_qs.count(),
                'totalBookings': bookings_qs.count(),
                'pendingBookings': bookings_qs.filter(status='pending').count(),
                'confirmedBookings': bookings_qs.filter(status='confirmed').count(),
            },
            'recentBookings': [booking_to_dto(b) for b in recent_bookings],
            'agency': agency_to_dto(agency),
        })


class AdminDashboardView(APIView):
    """GET /api/dashboard/admin – Admin only."""
    def get(self, request: Request):
        user = _current_user(request)
        if not user:
            return api_error('Authentication required.', status=401)
        if user.role != 'Admin':
            return api_error('Admin only.', status=403)
        from users.models import User as U
        from vendors.models import Agency as A
        users_count = U.objects.count()
        agencies_count = A.objects.count()
        trips_count = Trip.objects.count()
        bookings_count = Booking.objects.count()
        recent_users = list(U.objects.select_related('agency').order_by('-created_at')[:10])
        recent_trips = list(Trip.objects.select_related('agency', 'agency__user').order_by('-created_at')[:10])
        recent_agencies = list(A.objects.select_related('user').order_by('-created_at')[:10])
        return api_response({
            'stats': {
                'totalUsers': users_count,
                'totalAgencies': agencies_count,
                'totalTrips': trips_count,
                'totalBookings': bookings_count,
            },
            'recentUsers': [user_to_dto(u) for u in recent_users],
            'recentTrips': [trip_to_dto(t) for t in recent_trips],
            'recentAgencies': [agency_to_dto(a) for a in recent_agencies],
        })

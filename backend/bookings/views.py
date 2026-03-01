"""
Bookings API: create, list, get, update status.
"""
from typing import Optional
from rest_framework.views import APIView
from rest_framework.request import Request

from common.responses import api_response, api_error
from common.jwt_utils import decode_access_token
from users.models import User
from trips.models import Trip
from .models import Booking
from .serializers import booking_to_dto


def _current_user(request: Request) -> Optional[User]:
    auth = request.META.get('HTTP_AUTHORIZATION') or ''
    if not auth.startswith('Bearer '):
        return None
    token = auth[7:].strip()
    payload = decode_access_token(token)
    if not payload:
        return None
    try:
        return User.objects.get(id=payload['sub'])
    except User.DoesNotExist:
        return None


class BookingListCreateView(APIView):
    def get(self, request: Request):
        user = _current_user(request)
        if not user:
            return api_error('Authentication required.', status=401)
        qs = Booking.objects.select_related('trip', 'trip__agency', 'trip__agency__user', 'traveler').filter(traveler=user)
        if user.role == 'Agency' and hasattr(user, 'agency') and user.agency:
            qs = Booking.objects.select_related('trip', 'trip__agency', 'trip__agency__user', 'traveler').filter(trip__agency=user.agency)
        if user.role == 'Admin':
            traveler_id = request.query_params.get('traveler_id')
            if traveler_id:
                qs = Booking.objects.select_related('trip', 'trip__agency', 'trip__agency__user', 'traveler').filter(traveler_id=traveler_id)
        page = max(1, int(request.query_params.get('page', 1)))
        limit = min(100, max(1, int(request.query_params.get('limit', 10))))
        total = qs.count()
        start = (page - 1) * limit
        items = list(qs.order_by('-created_at')[start : start + limit])
        return api_response({
            'bookings': [booking_to_dto(b) for b in items],
            'total': total,
            'page': page,
            'limit': limit,
        })

    def post(self, request: Request):
        user = _current_user(request)
        if not user:
            return api_error('Authentication required.', status=401)
        if user.role != 'Traveler':
            return api_error('Only travelers can create bookings.', status=403)
        trip_id = request.data.get('tripId')
        start_date = request.data.get('startDate')
        end_date = request.data.get('endDate')
        number_of_travelers = request.data.get('numberOfTravelers')
        special_requests = request.data.get('specialRequests', '')
        if not all([trip_id, start_date, end_date, number_of_travelers]):
            return api_error('tripId, startDate, endDate, numberOfTravelers are required.', status=400)
        try:
            trip = Trip.objects.get(id=trip_id)
        except Trip.DoesNotExist:
            return api_error('Trip not found.', status=404)
        try:
            n = int(number_of_travelers)
            if n < 1:
                raise ValueError('Must be at least 1')
        except (TypeError, ValueError):
            return api_error('numberOfTravelers must be a positive integer.', status=400)
        from datetime import datetime
        try:
            sd = datetime.fromisoformat(start_date.replace('Z', '+00:00')).date() if isinstance(start_date, str) else start_date
            ed = datetime.fromisoformat(end_date.replace('Z', '+00:00')).date() if isinstance(end_date, str) else end_date
        except (TypeError, ValueError):
            return api_error('Invalid startDate or endDate.', status=400)
        booking = Booking.objects.create(
            trip=trip,
            traveler=user,
            start_date=sd,
            end_date=ed,
            number_of_travelers=n,
            special_requests=special_requests or None,
        )
        return api_response(booking_to_dto(booking), status=201)


class BookingDetailView(APIView):
    def get(self, request: Request, pk: str):
        user = _current_user(request)
        if not user:
            return api_error('Authentication required.', status=401)
        try:
            booking = Booking.objects.select_related('trip', 'trip__agency', 'trip__agency__user', 'traveler').get(id=pk)
        except Booking.DoesNotExist:
            return api_error('Booking not found.', status=404)
        if user.role == 'Traveler' and booking.traveler_id != user.id:
            return api_error('Not allowed.', status=403)
        if user.role == 'Agency' and (not hasattr(user, 'agency') or booking.trip.agency_id != user.agency.id):
            return api_error('Not allowed.', status=403)
        return api_response(booking_to_dto(booking))


class BookingStatusView(APIView):
    def patch(self, request: Request, pk: str):
        user = _current_user(request)
        if not user:
            return api_error('Authentication required.', status=401)
        if user.role not in ('Agency', 'Admin'):
            return api_error('Only agency or admin can update booking status.', status=403)
        try:
            booking = Booking.objects.select_related('trip', 'trip__agency', 'traveler').get(id=pk)
        except Booking.DoesNotExist:
            return api_error('Booking not found.', status=404)
        if user.role == 'Agency' and (not hasattr(user, 'agency') or booking.trip.agency_id != user.agency.id):
            return api_error('Not allowed.', status=403)
        status_val = request.data.get('status')
        if status_val not in ('pending', 'confirmed', 'cancelled', 'completed'):
            return api_error('Invalid status.', status=400)
        booking.status = status_val
        booking.save()
        return api_response(booking_to_dto(booking))

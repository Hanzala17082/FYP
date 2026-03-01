"""
Booking serializers. Output camelCase to match frontend.
"""
from .models import Booking
from trips.serializers import trip_to_dto
from users.serializers import user_to_dto


def booking_to_dto(booking: Booking) -> dict:
    return {
        'id': str(booking.id),
        'trip': trip_to_dto(booking.trip),
        'traveler': user_to_dto(booking.traveler),
        'startDate': booking.start_date.isoformat(),
        'endDate': booking.end_date.isoformat(),
        'numberOfTravelers': booking.number_of_travelers,
        'status': booking.status,
        'specialRequests': booking.special_requests,
        'createdAt': booking.created_at.isoformat() + 'Z',
        'updatedAt': booking.updated_at.isoformat() + 'Z',
    }

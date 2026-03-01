"""
Review serializers. Output camelCase.
"""
from users.serializers import user_to_dto
from .models import Review


def review_to_dto(r: Review) -> dict:
    return {
        'id': str(r.id),
        'tripId': str(r.trip_id) if r.trip_id else None,
        'agencyId': str(r.agency_id) if r.agency_id else None,
        'traveler': user_to_dto(r.traveler),
        'rating': r.rating,
        'comment': r.comment,
        'createdAt': r.created_at.isoformat() + 'Z',
        'updatedAt': r.updated_at.isoformat() + 'Z',
    }

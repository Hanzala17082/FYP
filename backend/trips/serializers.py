"""
Trip serializers. Output camelCase to match frontend DTOs.
"""
from vendors.models import Agency
from .models import Trip, TripHighlight, TripSchedule, TripScheduleActivity, TripRecreationalActivity


def agency_to_dto(agency: Agency) -> dict:
    return {
        'id': str(agency.id),
        'name': agency.agency_name,
        'slug': agency.agency_slug,
        'description': agency.description or '',
        'logo': agency.logo_url or '',
        'rating': float(agency.rating),
        'reviewCount': agency.review_count,
        'location': agency.location or '',
        'verified': agency.verified,
        'avatar': agency.user.avatar_url if agency.user_id else None,
    }


def trip_to_dto(trip: Trip, include_schedule=False) -> dict:
    d = {
        'id': str(trip.id),
        'title': trip.title,
        'slug': trip.slug,
        'description': trip.description,
        'shortDescription': trip.short_description,
        'destination': trip.destination,
        'price': float(trip.price),
        'duration': trip.duration_days,
        'images': trip.images or [],
        'agency': agency_to_dto(trip.agency),
        'rating': float(trip.rating),
        'reviewCount': trip.review_count,
        'availableDates': [
            (d.isoformat() if hasattr(d, 'isoformat') else str(d)) for d in (trip.available_dates or [])
        ],
        'startDate': trip.start_date.isoformat() if trip.start_date else None,
        'endDate': trip.end_date.isoformat() if trip.end_date else None,
        'status': trip.status,
        'tags': trip.tags or [],
        'createdAt': trip.created_at.isoformat() + 'Z' if trip.created_at else None,
        'updatedAt': trip.updated_at.isoformat() + 'Z' if trip.updated_at else None,
    }
    if include_schedule:
        d['highlights'] = [h.text for h in trip.highlights.all()]
        schedules = trip.schedules.all()
        d['schedule'] = []
        for s in schedules:
            activities = [{'time': a.time.strftime('%H:%M'), 'activity': a.activity} for a in s.activities.all()]
            d['schedule'].append({
                'day': s.day,
                'date': s.date.isoformat(),
                'title': s.title,
                'activities': activities,
            })
        d['recreationalActivities'] = [
            {
                'name': r.name,
                'description': r.description,
                'duration': r.duration,
                'included': r.included,
                'additionalCost': float(r.additional_cost) if r.additional_cost is not None else None,
            }
            for r in trip.recreational_activities.all()
        ]
    return d

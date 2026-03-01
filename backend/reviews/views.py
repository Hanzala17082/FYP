"""
Reviews API: create, list by trip, list by agency.
"""
from typing import Optional
from rest_framework.views import APIView
from rest_framework.request import Request

from common.responses import api_response, api_error
from common.jwt_utils import decode_access_token
from users.models import User
from trips.models import Trip
from vendors.models import Agency
from .models import Review
from .serializers import review_to_dto


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


class CreateReviewView(APIView):
    def post(self, request: Request):
        user = _current_user(request)
        if not user:
            return api_error('Authentication required.', status=401)
        if user.role != 'Traveler':
            return api_error('Only travelers can submit reviews.', status=403)
        trip_id = request.data.get('tripId')
        agency_id = request.data.get('agencyId')
        rating = request.data.get('rating')
        comment = request.data.get('comment', '').strip()
        if not (trip_id or agency_id):
            return api_error('Either tripId or agencyId is required.', status=400)
        if rating is None or not (1 <= int(rating) <= 5):
            return api_error('rating must be between 1 and 5.', status=400)
        if not comment:
            return api_error('comment is required.', status=400)
        rating = int(rating)
        trip = None
        agency = None
        if trip_id:
            try:
                trip = Trip.objects.get(id=trip_id)
            except Trip.DoesNotExist:
                return api_error('Trip not found.', status=404)
        if agency_id:
            try:
                agency = Agency.objects.get(id=agency_id)
            except Agency.DoesNotExist:
                return api_error('Agency not found.', status=404)
        review = Review.objects.create(traveler=user, trip=trip, agency=agency, rating=rating, comment=comment)
        return api_response(review_to_dto(review), status=201)


class TripReviewListView(APIView):
    """GET /api/trips/<id>/reviews"""
    def get(self, request: Request, id: str):
        try:
            trip = Trip.objects.get(id=id)
        except Trip.DoesNotExist:
            return api_error('Trip not found.', status=404)
        qs = Review.objects.select_related('traveler').filter(trip=trip).order_by('-created_at')
        page = max(1, int(request.query_params.get('page', 1)))
        limit = min(100, max(1, int(request.query_params.get('limit', 20))))
        total = qs.count()
        start = (page - 1) * limit
        items = list(qs[start : start + limit])
        return api_response({
            'reviews': [review_to_dto(r) for r in items],
            'total': total,
            'page': page,
            'limit': limit,
        })


def _get_agency(slug_or_id: str):
    import uuid
    try:
        uid = uuid.UUID(slug_or_id)
        return Agency.objects.get(id=uid)
    except (ValueError, Agency.DoesNotExist):
        return Agency.objects.get(agency_slug=slug_or_id)


class AgencyReviewListView(APIView):
    """GET /api/agencies/<id|slug>/reviews"""
    def get(self, request: Request, slug_or_id: str):
        try:
            agency = _get_agency(slug_or_id)
        except Agency.DoesNotExist:
            return api_error('Agency not found.', status=404)
        qs = Review.objects.select_related('traveler').filter(agency=agency).order_by('-created_at')
        page = max(1, int(request.query_params.get('page', 1)))
        limit = min(100, max(1, int(request.query_params.get('limit', 20))))
        total = qs.count()
        start = (page - 1) * limit
        items = list(qs[start : start + limit])
        return api_response({
            'reviews': [review_to_dto(r) for r in items],
            'total': total,
            'page': page,
            'limit': limit,
        })

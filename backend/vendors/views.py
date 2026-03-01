"""
Agencies API: list, get by id or slug, get trips/reviews by agency.
"""
import uuid
from rest_framework.views import APIView
from rest_framework.request import Request

from common.responses import api_response, api_error
from .models import Agency
from .serializers import agency_to_dto
from trips.models import Trip
from trips.serializers import trip_to_dto


def _get_agency(slug_or_id: str):
    """Resolve agency by UUID (id) or by agency_slug. Raises Agency.DoesNotExist."""
    try:
        uid = uuid.UUID(slug_or_id)
        return Agency.objects.select_related('user').get(id=uid)
    except (ValueError, Agency.DoesNotExist):
        return Agency.objects.select_related('user').get(agency_slug=slug_or_id)


class AgencyListView(APIView):
    def get(self, request: Request):
        qs = Agency.objects.select_related('user').all().order_by('-rating', '-review_count')
        page = max(1, int(request.query_params.get('page', 1)))
        limit = min(100, max(1, int(request.query_params.get('limit', 20))))
        total = qs.count()
        start = (page - 1) * limit
        items = list(qs[start : start + limit])
        return api_response({
            'agencies': [agency_to_dto(a) for a in items],
            'total': total,
            'page': page,
            'limit': limit,
        })


class AgencyDetailView(APIView):
    def get(self, request: Request, slug_or_id: str):
        try:
            agency = _get_agency(slug_or_id)
        except Agency.DoesNotExist:
            return api_error('Agency not found.', status=404)
        return api_response(agency_to_dto(agency))


class AgencyTripsView(APIView):
    def get(self, request: Request, slug_or_id: str):
        try:
            agency = _get_agency(slug_or_id)
        except Agency.DoesNotExist:
            return api_error('Agency not found.', status=404)
        qs = Trip.objects.select_related('agency', 'agency__user').filter(agency=agency, status='active').order_by('-created_at')
        page = max(1, int(request.query_params.get('page', 1)))
        limit = min(100, max(1, int(request.query_params.get('limit', 10))))
        total = qs.count()
        start = (page - 1) * limit
        items = list(qs[start : start + limit])
        return api_response({
            'trips': [trip_to_dto(t) for t in items],
            'total': total,
            'page': page,
            'limit': limit,
        })

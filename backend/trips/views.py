"""
Trips API: list, get by slug, featured, search, create (POST), update (PATCH). Create/update = Agency/Admin.
Server-side pagination: page (1-based), limit (default PAGE_SIZE), max 100 per page.
"""
from datetime import datetime
from decimal import Decimal
from django.db.models import Q, QuerySet
from django.utils.text import slugify
from rest_framework.views import APIView
from rest_framework.request import Request

from common.responses import api_response, api_error
from common.jwt_utils import decode_access_token
from users.models import User
from vendors.models import Agency
from .models import Trip, TripHighlight, TripSchedule, TripScheduleActivity, TripRecreationalActivity
from .serializers import trip_to_dto

# Pagination: default page size for list/search; max allowed per request
DEFAULT_PAGE_SIZE = 12
MAX_PAGE_SIZE = 100


def _paginate(qs: QuerySet, page: int, limit: int):
    """Apply offset/limit and return (items, total, page, limit, total_pages)."""
    page = max(1, page)
    limit = min(max(1, limit), MAX_PAGE_SIZE)
    total = qs.count()
    offset = (page - 1) * limit
    items = list(qs[offset : offset + limit])
    total_pages = (total + limit - 1) // limit if limit else 0
    return items, total, page, limit, total_pages


class TripListCreateView(APIView):
    def get(self, request: Request):
        params = request.query_params
        qs = Trip.objects.select_related('agency', 'agency__user').filter(status='active').order_by('-created_at')
        # Filters
        if params.get('destination'):
            qs = qs.filter(destination__icontains=params['destination'])
        if params.get('minPrice'):
            try:
                qs = qs.filter(price__gte=Decimal(params['minPrice']))
            except (ValueError, TypeError):
                pass
        if params.get('maxPrice'):
            try:
                qs = qs.filter(price__lte=Decimal(params['maxPrice']))
            except (ValueError, TypeError):
                pass
        if params.get('duration'):
            try:
                qs = qs.filter(duration_days=int(params['duration']))
            except (ValueError, TypeError):
                pass
        if params.get('agencyId'):
            qs = qs.filter(agency_id=params['agencyId'])
        if params.get('startDate'):
            qs = qs.filter(start_date__gte=params['startDate'])
        if params.get('endDate'):
            qs = qs.filter(end_date__lte=params['endDate'])
        sort_by = params.get('sortBy', 'date')
        order = params.get('sortOrder', 'desc')
        if sort_by == 'price':
            qs = qs.order_by('price' if order == 'asc' else '-price')
        elif sort_by == 'rating':
            qs = qs.order_by('rating' if order == 'asc' else '-rating')
        elif sort_by == 'popularity':
            qs = qs.order_by('-review_count')
        else:
            qs = qs.order_by('start_date' if order == 'asc' else '-start_date')
        page = int(params.get('page', 1))
        try:
            limit = int(params.get('limit', DEFAULT_PAGE_SIZE))
        except (TypeError, ValueError):
            limit = DEFAULT_PAGE_SIZE
        items, total, p, l, total_pages = _paginate(qs, page, limit)
        return api_response({
            'trips': [trip_to_dto(t) for t in items],
            'total': total,
            'page': p,
            'limit': l,
            'totalPages': total_pages,
        })

    def post(self, request: Request):
        return TripCreateView().post(request)


class TripDetailView(APIView):
    def get(self, request: Request, slug: str):
        try:
            trip = Trip.objects.select_related('agency', 'agency__user').prefetch_related(
                'highlights', 'schedules', 'schedules__activities', 'recreational_activities'
            ).get(slug=slug)
        except Trip.DoesNotExist:
            return api_error('Trip not found.', status=404)
        return api_response(trip_to_dto(trip, include_schedule=True))


class TripFeaturedView(APIView):
    def get(self, request: Request):
        qs = Trip.objects.select_related('agency', 'agency__user').filter(status='active').order_by('-rating', '-review_count')[:10]
        return api_response([trip_to_dto(t) for t in qs])


class TripSearchView(APIView):
    def get(self, request: Request):
        q = request.query_params.get('q', '').strip()
        qs = Trip.objects.select_related('agency', 'agency__user').filter(status='active')
        if q:
            qs = qs.filter(
                Q(title__icontains=q) | Q(destination__icontains=q) | Q(description__icontains=q) | Q(short_description__icontains=q)
            )
        # Same filters as list
        params = request.query_params
        if params.get('destination'):
            qs = qs.filter(destination__icontains=params['destination'])
        if params.get('minPrice'):
            try:
                qs = qs.filter(price__gte=Decimal(params['minPrice']))
            except (ValueError, TypeError):
                pass
        if params.get('maxPrice'):
            try:
                qs = qs.filter(price__lte=Decimal(params['maxPrice']))
            except (ValueError, TypeError):
                pass
        if params.get('agencyId'):
            qs = qs.filter(agency_id=params['agencyId'])
        sort_by = params.get('sortBy', 'date')
        order = params.get('sortOrder', 'desc')
        if sort_by == 'price':
            qs = qs.order_by('price' if order == 'asc' else '-price')
        elif sort_by == 'rating':
            qs = qs.order_by('rating' if order == 'asc' else '-rating')
        else:
            qs = qs.order_by('start_date' if order == 'asc' else '-start_date')
        page = int(params.get('page', 1))
        try:
            limit = int(params.get('limit', DEFAULT_PAGE_SIZE))
        except (TypeError, ValueError):
            limit = DEFAULT_PAGE_SIZE
        items, total, p, l, total_pages = _paginate(qs, page, limit)
        return api_response({
            'trips': [trip_to_dto(t) for t in items],
            'total': total,
            'page': p,
            'limit': l,
            'totalPages': total_pages,
        })

    def post(self, request: Request):
        return TripCreateView().post(request)


def _current_user(request: Request):
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


def _parse_date(s):
    if not s:
        return None
    if hasattr(s, 'date'):
        return s.date() if hasattr(s, 'date') else s
    if isinstance(s, str):
        return datetime.fromisoformat(s.replace('Z', '+00:00')[:10]).date()
    return None


class TripCreateView(APIView):
    """POST /api/trips – Agency/Admin only."""
    def post(self, request: Request):
        user = _current_user(request)
        if not user:
            return api_error('Authentication required.', status=401)
        if user.role not in ('Agency', 'Admin'):
            return api_error('Agency or Admin only.', status=403)
        agency = None
        if user.role == 'Agency':
            try:
                agency = user.agency
            except Agency.DoesNotExist:
                return api_error('Agency profile not found.', status=403)
        else:
            agency_id = request.data.get('agencyId')
            if not agency_id:
                return api_error('Admin must provide agencyId.', status=400)
            try:
                agency = Agency.objects.get(id=agency_id)
            except Agency.DoesNotExist:
                return api_error('Agency not found.', status=404)
        d = request.data
        title = d.get('title')
        if not title:
            return api_error('title is required.', status=400)
        slug = slugify(title)[:50] or 'trip'
        base, n = slug, 1
        while Trip.objects.filter(slug=slug).exists():
            slug = f'{base}-{n}'
            n += 1
        start_date = _parse_date(d.get('startDate'))
        end_date = _parse_date(d.get('endDate'))
        if not start_date or not end_date:
            return api_error('startDate and endDate are required.', status=400)
        try:
            price = Decimal(str(d.get('price', 0)))
            duration = int(d.get('duration', 1))
        except (TypeError, ValueError):
            return api_error('Invalid price or duration.', status=400)
        trip = Trip.objects.create(
            agency=agency,
            title=title,
            slug=slug,
            description=d.get('description', ''),
            short_description=(d.get('shortDescription') or '')[:500] or title[:500],
            destination=d.get('destination', ''),
            price=price,
            duration_days=duration,
            images=d.get('images') or [],
            available_dates=d.get('availableDates') or [],
            start_date=start_date,
            end_date=end_date,
            status='pending',
            tags=d.get('tags') or [],
        )
        for i, text in enumerate(d.get('highlights') or []):
            TripHighlight.objects.create(trip=trip, text=text, sort_order=i)
        for s in d.get('schedule') or []:
            day = s.get('day', 0)
            date_val = _parse_date(s.get('date'))
            if date_val is None:
                continue
            sch = TripSchedule.objects.create(trip=trip, day=day, date=date_val, title=s.get('title', ''))
            for a in s.get('activities') or []:
                tstr = a.get('time', '00:00')
                if isinstance(tstr, str) and ':' in tstr:
                    try:
                        from datetime import time
                        h, m = map(int, tstr.split(':')[:2])
                        TripScheduleActivity.objects.create(schedule=sch, time=time(h, m), activity=a.get('activity', ''))
                    except (ValueError, TypeError):
                        pass
        for i, r in enumerate(d.get('recreationalActivities') or []):
            TripRecreationalActivity.objects.create(
                trip=trip,
                name=r.get('name', ''),
                description=r.get('description', ''),
                duration=r.get('duration', ''),
                included=r.get('included', False),
                additional_cost=Decimal(str(r['additionalCost'])) if r.get('additionalCost') is not None else None,
                sort_order=i,
            )
        return api_response(trip_to_dto(trip, include_schedule=True), status=201)


class TripUpdateView(APIView):
    """PATCH /api/trips/:id – Agency (own) or Admin."""
    def patch(self, request: Request, id: str):
        user = _current_user(request)
        if not user:
            return api_error('Authentication required.', status=401)
        if user.role not in ('Agency', 'Admin'):
            return api_error('Agency or Admin only.', status=403)
        try:
            trip = Trip.objects.select_related('agency', 'agency__user').prefetch_related(
                'highlights', 'schedules', 'schedules__activities', 'recreational_activities'
            ).get(id=id)
        except Trip.DoesNotExist:
            return api_error('Trip not found.', status=404)
        if user.role == 'Agency' and (not hasattr(user, 'agency') or trip.agency_id != user.agency.id):
            return api_error('Not allowed to update this trip.', status=403)
        d = request.data
        if 'status' in d and d['status'] in ('active', 'pending', 'completed', 'cancelled'):
            trip.status = d['status']
        if d.get('title'):
            trip.title = d['title']
        if d.get('description') is not None:
            trip.description = d['description']
        if d.get('shortDescription') is not None:
            trip.short_description = str(d['shortDescription'])[:500]
        if d.get('destination'):
            trip.destination = d['destination']
        if 'price' in d:
            try:
                trip.price = Decimal(str(d['price']))
            except (TypeError, ValueError):
                pass
        if 'duration' in d:
            try:
                trip.duration_days = int(d['duration'])
            except (TypeError, ValueError):
                pass
        if d.get('images') is not None:
            trip.images = d['images']
        if d.get('availableDates') is not None:
            trip.available_dates = d['availableDates']
        if _parse_date(d.get('startDate')):
            trip.start_date = _parse_date(d['startDate'])
        if _parse_date(d.get('endDate')):
            trip.end_date = _parse_date(d['endDate'])
        if d.get('tags') is not None:
            trip.tags = d['tags']
        trip.save()
        return api_response(trip_to_dto(trip, include_schedule=True))

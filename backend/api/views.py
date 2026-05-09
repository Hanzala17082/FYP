"""
Discovery endpoints for local development (route manifest aligns with tripster-frontend services).
"""
from django.http import JsonResponse
from django.views import View


class ApiRootView(View):
    """GET /api/ — lists mounted routes (matches frontend api-client base URL)."""

    def get(self, request):
        base = request.build_absolute_uri('/api').rstrip('/')
        payload = {
            'service': 'REHNUM API',
            'api_base': f'{base}/',
            'frontend_env': 'NEXT_PUBLIC_API_URL should match api_base (e.g. http://localhost:8000/api)',
            'routes': {
                'auth': [
                    'POST /api/auth/login',
                    'POST /api/auth/register',
                    'POST /api/auth/refresh',
                    'POST /api/auth/logout',
                    'POST /api/auth/forgot-password',
                    'POST /api/auth/reset-password',
                    'GET /api/auth/users/<uuid>',
                ],
                'trips': [
                    'GET|POST /api/trips',
                    'GET /api/trips/featured',
                    'GET /api/trips/search',
                    'GET /api/trips/<uuid>/reviews',
                    'PATCH /api/trips/<uuid>',
                    'GET /api/trips/<slug>',
                ],
                'bookings': [
                    'GET|POST /api/bookings',
                    'GET /api/bookings/<uuid>',
                    'PATCH /api/bookings/<uuid>/status',
                ],
                'agencies': [
                    'GET /api/agencies',
                    'GET /api/agencies/<slug_or_uuid>',
                    'GET /api/agencies/<slug_or_uuid>/trips',
                    'GET /api/agencies/<slug_or_uuid>/reviews',
                ],
                'reviews': [
                    'POST /api/reviews',
                ],
                'dashboard': [
                    'GET /api/dashboard/traveler',
                    'GET /api/dashboard/agency',
                    'GET /api/dashboard/admin',
                ],
            },
        }
        return JsonResponse(payload)


def root_health(request):
    """GET / — confirms Django is up and points to API + admin."""
    return JsonResponse(
        {
            'status': 'ok',
            'service': 'REHNUM backend',
            'api_manifest': '/api/',
            'admin': '/admin/',
            'hint': 'Tripster frontend (Next.js) expects NEXT_PUBLIC_API_URL=http://localhost:8000/api',
        }
    )

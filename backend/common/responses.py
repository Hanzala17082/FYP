"""
API response wrapper to match frontend ApiResponse<T>: { data, message?, success }.
"""
from rest_framework.response import Response


def api_response(data, success=True, message=None, status=200):
    payload = {'data': data, 'success': success}
    if message is not None:
        payload['message'] = message
    return Response(payload, status=status)


def api_error(message, errors=None, status=400):
    payload = {'data': None, 'success': False, 'message': message}
    if errors is not None:
        payload['errors'] = errors
    return Response(payload, status=status)

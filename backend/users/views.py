"""
Auth API: login, register, refresh, logout, forgot-password, reset-password.
"""
from django.utils import timezone
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.request import Request

from common.responses import api_response, api_error
from common.jwt_utils import (
    create_access_token,
    create_refresh_token,
    get_user_from_refresh_token,
    decode_access_token,
)
from .models import User, TravelerProfile, RefreshToken, PasswordResetToken
from .serializers import LoginSerializer, RegisterSerializer, user_to_dto, user_detail_to_dto
from vendors.models import Agency


def _current_user(request: Request):
    """Return User from Bearer token or None."""
    from common.jwt_utils import decode_access_token
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


def _auth_response(user: User):
    access = create_access_token(user)
    refresh_str, _ = create_refresh_token(user)
    return api_response({
        'accessToken': access,
        'refreshToken': refresh_str,
        'user': user_to_dto(user),
    }, status=status.HTTP_200_OK)


class LoginView(APIView):
    def post(self, request: Request):
        ser = LoginSerializer(data=request.data)
        if not ser.is_valid():
            err = ser.errors
            msg = 'Invalid input.'
            if isinstance(err, dict) and err:
                first = next(iter(err.values()))
                msg = first[0] if isinstance(first, list) else str(first)
            return api_error(msg, errors=err, status=400)
        email = ser.validated_data['email']
        password = ser.validated_data['password']
        role = ser.validated_data.get('role')
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return api_error('Invalid email or password.', status=401)
        if not user.check_password(password):
            return api_error('Invalid email or password.', status=401)
        if role and user.role != role:
            return api_error('Invalid role for this account.', status=401)
        if not user.is_active:
            return api_error('Account is disabled.', status=403)
        return _auth_response(user)


class RegisterView(APIView):
    def post(self, request: Request):
        # Accept camelCase from frontend
        data = request.data.copy()
        if 'fullName' in data:
            data.setdefault('full_name', data['fullName'])
        if 'confirmPassword' in data:
            data.setdefault('confirm_password', data['confirmPassword'])
        if 'agreeToTerms' in data:
            data.setdefault('agree_to_terms', data['agreeToTerms'])
        ser = RegisterSerializer(data=data)
        if not ser.is_valid():
            return api_error('Validation failed.', errors=ser.errors, status=400)
        role = ser.validated_data['role']
        user = User.objects.create_user(
            email=ser.validated_data['email'],
            password=ser.validated_data['password'],
            full_name=ser.validated_data['full_name'],
            role=role,
            city=ser.validated_data.get('city') or None,
        )
        if role == 'Traveler':
            TravelerProfile.objects.create(user=user, cnic=ser.validated_data.get('cnic') or None)
        elif role == 'Agency':
            slug = ser.validated_data['full_name'].lower().replace(' ', '-')[:50]
            from django.utils.text import slugify
            slug = slugify(ser.validated_data['full_name'])[:50] or 'agency'
            base = slug
            c = 1
            while Agency.objects.filter(agency_slug=slug).exists():
                slug = f'{base}-{c}'
                c += 1
            Agency.objects.create(
                user=user,
                agency_name=ser.validated_data['full_name'],
                agency_slug=slug,
            )
        return _auth_response(user)


class RefreshView(APIView):
    def post(self, request: Request):
        refresh_token = request.data.get('refreshToken') or request.data.get('refresh_token')
        if not refresh_token:
            return api_error('refreshToken is required.', status=400)
        user = get_user_from_refresh_token(refresh_token)
        if not user:
            return api_error('Invalid or expired refresh token.', status=401)
        # Optionally revoke old refresh token and issue new one (refresh rotation)
        return _auth_response(user)


class LogoutView(APIView):
    def post(self, request: Request):
        refresh_token = request.data.get('refreshToken') or request.data.get('refresh_token')
        if refresh_token:
            RefreshToken.objects.filter(token=refresh_token).update(revoked_at=timezone.now())
        return api_response(None, status=200)


class ForgotPasswordView(APIView):
    def post(self, request: Request):
        email = request.data.get('email')
        if not email:
            return api_error('email is required.', status=400)
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return api_response(None, message='If an account exists, you will receive instructions.', status=200)
        token_str = str(__import__('uuid').uuid4())
        PasswordResetToken.objects.create(user=user, token=token_str, expires_at=timezone.now() + timezone.timedelta(hours=1))
        # TODO: send email with reset link including token_str
        return api_response(None, message='If an account exists, you will receive instructions.', status=200)


class ResetPasswordView(APIView):
    def post(self, request: Request):
        token = request.data.get('token')
        password = request.data.get('password')
        confirm = request.data.get('confirmPassword') or request.data.get('confirm_password')
        if not token or not password:
            return api_error('token and password are required.', status=400)
        if password != confirm:
            return api_error('Passwords do not match.', status=400)
        try:
            prt = PasswordResetToken.objects.get(token=token, used_at__isnull=True)
        except PasswordResetToken.DoesNotExist:
            return api_error('Invalid or expired reset token.', status=400)
        if prt.expires_at < timezone.now():
            return api_error('Reset token has expired.', status=400)
        prt.user.set_password(password)
        prt.user.save()
        prt.used_at = timezone.now()
        prt.save()
        return api_response(None, message='Password updated.', status=200)


class UserDetailView(APIView):
    """GET /api/auth/users/<id> – Admin only. Returns user + optional travelerProfile."""
    def get(self, request: Request, pk: str):
        current = _current_user(request)
        if not current:
            return api_error('Authentication required.', status=401)
        if current.role != 'Admin':
            return api_error('Admin only.', status=403)
        try:
            user = User.objects.select_related('traveler_profile').get(id=pk)
        except User.DoesNotExist:
            return api_error('User not found.', status=404)
        return api_response(user_detail_to_dto(user))

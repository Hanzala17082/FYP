"""
JWT creation and validation for access and refresh tokens.
"""
from __future__ import annotations
import uuid
from datetime import datetime, timedelta
from typing import Optional, Tuple

from django.conf import settings
import jwt
from users.models import User, RefreshToken


def _secret():
    return settings.SECRET_KEY


def _access_expiry():
    return datetime.utcnow() + timedelta(hours=1)


def _refresh_expiry():
    return datetime.utcnow() + timedelta(days=7)


def create_access_token(user: User) -> str:
    payload = {
        'sub': str(user.id),
        'email': user.email,
        'role': user.role,
        'type': 'access',
        'exp': _access_expiry(),
        'iat': datetime.utcnow(),
    }
    return jwt.encode(payload, _secret(), algorithm='HS256')


def create_refresh_token(user: User) -> Tuple[str, RefreshToken]:
    """Returns (token_string, RefreshToken instance to save)."""
    token_str = jwt.encode(
        {'sub': str(user.id), 'jti': str(uuid.uuid4()), 'type': 'refresh', 'exp': _refresh_expiry(), 'iat': datetime.utcnow()},
        _secret(),
        algorithm='HS256',
    )
    if isinstance(token_str, bytes):
        token_str = token_str.decode('utf-8')
    expires_at = _refresh_expiry()
    rt = RefreshToken.objects.create(user=user, token=token_str, expires_at=expires_at)
    return token_str, rt


def decode_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, _secret(), algorithms=['HS256'])
        if payload.get('type') != 'access':
            return None
        return payload
    except jwt.InvalidTokenError:
        return None


def decode_refresh_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, _secret(), algorithms=['HS256'])
        if payload.get('type') != 'refresh':
            return None
        return payload
    except jwt.InvalidTokenError:
        return None


def get_user_from_refresh_token(token: str) -> Optional[User]:
    """Validate refresh token (must exist in DB and not revoked). Returns User or None."""
    payload = decode_refresh_token(token)
    if not payload:
        return None
    try:
        rt = RefreshToken.objects.get(token=token, revoked_at__isnull=True)
        if rt.expires_at < datetime.now(rt.expires_at.tzinfo):
            return None
        return rt.user
    except RefreshToken.DoesNotExist:
        return None

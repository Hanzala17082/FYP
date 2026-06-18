"""
Validate Supabase Auth JWTs for chat REST and WebSocket endpoints.

Modern Supabase projects sign user tokens with ES256 (JWKS). Legacy projects use HS256
with SUPABASE_JWT_SECRET from the dashboard.
"""
from __future__ import annotations

from typing import Optional

import jwt
from django.conf import settings
from jwt import PyJWKClient

from users.models import User

_jwks_client: Optional[PyJWKClient] = None


def _get_jwks_client() -> Optional[PyJWKClient]:
    global _jwks_client
    if _jwks_client is not None:
        return _jwks_client

    ref = getattr(settings, 'SUPABASE_PROJECT_REF', '') or ''
    if not ref:
        return None

    url = f'https://{ref}.supabase.co/auth/v1/.well-known/jwks.json'
    _jwks_client = PyJWKClient(url, cache_keys=True)
    return _jwks_client


def _decode_options() -> dict:
    return {'verify_aud': False, 'require': ['exp', 'sub']}


def decode_supabase_token(token: str) -> Optional[dict]:
    if not token:
        return None

    client = _get_jwks_client()
    if client:
        try:
            signing_key = client.get_signing_key_from_jwt(token)
            return jwt.decode(
                token,
                signing_key.key,
                algorithms=['ES256'],
                options=_decode_options(),
            )
        except jwt.InvalidTokenError:
            pass

    secret = getattr(settings, 'SUPABASE_JWT_SECRET', '') or ''
    if secret:
        try:
            return jwt.decode(
                token,
                secret,
                algorithms=['HS256'],
                options=_decode_options(),
            )
        except jwt.InvalidTokenError:
            pass

    return None


def user_from_supabase_token(token: str) -> Optional[User]:
    payload = decode_supabase_token(token)
    if not payload:
        return None
    sub = payload.get('sub')
    if not sub:
        return None
    try:
        return User.objects.get(id=sub)
    except User.DoesNotExist:
        return None


def user_from_authorization_header(auth_header: str) -> Optional[User]:
    if not auth_header.startswith('Bearer '):
        return None
    return user_from_supabase_token(auth_header[7:].strip())

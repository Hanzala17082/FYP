"""
Django base settings for Tripster backend.
"""
import os
from pathlib import Path
from urllib.parse import quote_plus

import environ
from django.core.exceptions import ImproperlyConfigured

BASE_DIR = Path(__file__).resolve().parent.parent.parent

# IDEs / agent shells sometimes inject a bogus DATABASE_URL (e.g. postgres:fake@127.0.0.1:65431).
# That overrides real config — drop localhost placeholders so backend/.env + SUPABASE_* work.
_db_url = os.environ.get('DATABASE_URL', '').strip()
if _db_url and '127.0.0.1' in _db_url:
    os.environ.pop('DATABASE_URL', None)

environ.Env.read_env(BASE_DIR / '.env', overwrite=True)
env = environ.Env(
    DEBUG=(bool, False),
    ALLOWED_HOSTS=(list, []),
    DATABASE_URL=(str, ''),
    CORS_ORIGINS=(list, ['http://localhost:3000']),
    SECRET_KEY=(str, 'change-me-in-production'),
    SUPABASE_PROJECT_REF=(str, ''),
    SUPABASE_DB_PASSWORD=(str, ''),
    SUPABASE_REGION=(str, 'ap-northeast-2'),
    SUPABASE_CONNECTION=(str, 'direct'),
    SUPABASE_POOLER_HOST=(str, ''),
    SUPABASE_POOLER_PORT=(str, '5432'),
    SUPABASE_JWT_SECRET=(str, ''),
    REDIS_URL=(str, ''),
)

SECRET_KEY = env('SECRET_KEY')
DEBUG = env('DEBUG')
ALLOWED_HOSTS = env.list('ALLOWED_HOSTS', default=['localhost', '127.0.0.1'])

# Declared intent to use Supabase (for system checks). Does not load secrets into logs.
SUPABASE_PROJECT_REF = env('SUPABASE_PROJECT_REF', default='').strip()


def _effective_database_url():
    """Prefer explicit DATABASE_URL; else build Postgres URI for Supabase from ref + password."""
    explicit = env('DATABASE_URL', default='').strip()
    if explicit:
        return explicit
    ref = SUPABASE_PROJECT_REF
    password = env('SUPABASE_DB_PASSWORD', default='').strip()
    if not ref or not password:
        return ''
    encoded_pw = quote_plus(password, safe='')
    mode = env('SUPABASE_CONNECTION', default='direct').strip().lower()
    region = env('SUPABASE_REGION', default='ap-northeast-2').strip()
    if mode == 'pooler':
        host = env('SUPABASE_POOLER_HOST', default=f'aws-0-{region}.pooler.supabase.com').strip()
        port = env('SUPABASE_POOLER_PORT', default='5432').strip()
        return f'postgresql://postgres.{ref}:{encoded_pw}@{host}:{port}/postgres'
    return f'postgresql://postgres:{encoded_pw}@db.{ref}.supabase.co:5432/postgres'


_EFFECTIVE_DATABASE_URL = _effective_database_url()

SUPABASE_JWT_SECRET = env('SUPABASE_JWT_SECRET', default='').strip()
REDIS_URL = env('REDIS_URL', default='').strip()

INSTALLED_APPS = [
    'daphne',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'api',
    'common',
    'users',
    'vendors',
    'trips',
    'bookings',
    'reviews',
    'dashboard',
    'payments',
    'notifications',
    'channels',
    'chat',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'
WSGI_APPLICATION = 'config.wsgi.application'
ASGI_APPLICATION = 'config.asgi.application'

if REDIS_URL:
    CHANNEL_LAYERS = {
        'default': {
            'BACKEND': 'channels_redis.core.RedisChannelLayer',
            'CONFIG': {'hosts': [REDIS_URL]},
        }
    }
else:
    CHANNEL_LAYERS = {
        'default': {'BACKEND': 'channels.layers.InMemoryChannelLayer'},
    }

# Avoid 301 redirect on POST (e.g. /api/auth/login -> /api/auth/login/) which can break clients
APPEND_SLASH = False

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True
STATIC_URL = 'static/'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Supabase Postgres only — no local SQLite fallback (see .env.example).
if not _EFFECTIVE_DATABASE_URL:
    if SUPABASE_PROJECT_REF:
        raise ImproperlyConfigured(
            'SUPABASE_PROJECT_REF is set but no database URL could be built. '
            'Add SUPABASE_DB_PASSWORD to backend/.env (Postgres password from Supabase Dashboard -> Database), '
            'or set DATABASE_URL. Then run: python manage.py migrate'
        )
    raise ImproperlyConfigured(
        'This project uses Supabase Postgres only (no SQLite). '
        'Set DATABASE_URL or SUPABASE_PROJECT_REF plus SUPABASE_DB_PASSWORD in backend/.env. '
        'Then run: python manage.py migrate'
    )

import dj_database_url

db_from_env = dj_database_url.config(default=_EFFECTIVE_DATABASE_URL, conn_max_age=600)
if db_from_env.get('ENGINE', '').endswith('postgresql'):
    db_from_env.setdefault('OPTIONS', {})['sslmode'] = 'require'
DATABASES = {'default': db_from_env}

# CORS: allow frontend and Ionic
CORS_ALLOWED_ORIGINS = env.list('CORS_ORIGINS', default=['http://localhost:3000'])
CORS_ALLOW_CREDENTIALS = True

# REST framework
REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': ['rest_framework.renderers.JSONRenderer'],
    'DEFAULT_AUTHENTICATION_CLASSES': [],
    'DEFAULT_PERMISSION_CLASSES': ['rest_framework.permissions.AllowAny'],
}

# Custom user model (we use users.User, not auth.User)
AUTH_USER_MODEL = 'users.User'

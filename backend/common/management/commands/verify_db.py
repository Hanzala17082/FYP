from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import connection


class Command(BaseCommand):
    help = 'Print default database settings and test TCP connection (use after configuring Supabase).'

    def handle(self, *args, **options):
        db = settings.DATABASES['default']
        self.stdout.write(f'ENGINE: {db["ENGINE"]}')
        self.stdout.write(f'HOST: {db.get("HOST") or "(n/a)"}')
        self.stdout.write(f'NAME: {db.get("NAME")}')
        ref = getattr(settings, 'SUPABASE_PROJECT_REF', '') or ''
        if ref:
            self.stdout.write(f'SUPABASE_PROJECT_REF: {ref}')
        try:
            connection.ensure_connection()
            with connection.cursor() as cursor:
                cursor.execute('SELECT 1')
                cursor.fetchone()
        except Exception as exc:
            self.stdout.write(self.style.ERROR(f'Connection check failed: {exc}'))
            self.stdout.write(
                'For Supabase: set SUPABASE_DB_PASSWORD or DATABASE_URL in backend/.env, '
                'then run: python manage.py migrate'
            )
            raise SystemExit(1) from exc
        self.stdout.write(self.style.SUCCESS('Database connection OK'))

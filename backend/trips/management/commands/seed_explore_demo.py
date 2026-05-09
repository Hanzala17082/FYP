"""Seed active trips into Postgres (Supabase) so the Explore page has data to display."""

from __future__ import annotations

import uuid
from datetime import timedelta
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from trips.models import Trip
from users.models import User
from vendors.models import Agency


def _next_unique_agency_slug() -> str:
    base = 'demo-tours-seed'
    candidate = base
    n = 0
    while Agency.objects.filter(agency_slug=candidate).exists():
        n += 1
        candidate = f'{base}-{n}'
    return candidate


class Command(BaseCommand):
    help = 'Create a demo agency user (if needed) and active trips for Explore (status=active).'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Add demo trips even when active trips already exist.',
        )

    @transaction.atomic
    def handle(self, *args, **options):
        force = options['force']
        active_n = Trip.objects.filter(status=Trip.Status.ACTIVE).count()
        if active_n > 0 and not force:
            self.stdout.write(
                self.style.WARNING(
                    f'Skip: {active_n} active trip(s) already. Run with --force to add more demo rows.'
                )
            )
            self.stdout.write(
                'If Explore is empty anyway, apply REHNUM/supabase/scripts/ensure_explore_anon_read.sql '
                'so the anon API key can SELECT trips (Django bypasses RLS).'
            )
            return

        email = 'demo-seed-agency@rehnum.local'
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'full_name': 'Demo Seed Agency',
                'role': User.Role.AGENCY,
                'city': 'Islamabad',
                'is_email_verified': True,
                'is_active': True,
            },
        )
        if created:
            user.set_unusable_password()
            user.save()

        agency = Agency.objects.filter(user=user).first()
        if agency is None:
            agency = Agency.objects.create(
                user=user,
                agency_name='Demo Tours (Seed)',
                agency_slug=_next_unique_agency_slug(),
                description='Auto-seeded for Explore / Supabase testing.',
                location='Pakistan',
                verified=True,
            )

        demos = [
            ('Hunza Valley Explorer (Demo)', 'hunza', Decimal('45000.00')),
            ('Skardu Lakes Circuit (Demo)', 'skardu', Decimal('52000.00')),
        ]
        today = timezone.now().date()
        created_trips = 0
        for title, prefix, price in demos:
            tid = uuid.uuid4()
            slug = f'{prefix}-demo-{str(tid)[:8]}'
            Trip.objects.create(
                id=tid,
                agency=agency,
                title=title,
                slug=slug,
                description=f'{title} — created by manage.py seed_explore_demo.',
                short_description=f'Demo trip in {prefix.title()} for frontend Explore.',
                destination=prefix.title(),
                price=price,
                duration_days=5,
                images=['https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800'],
                start_date=today,
                end_date=today + timedelta(days=5),
                status=Trip.Status.ACTIVE,
                tags=['demo', 'seed'],
            )
            created_trips += 1

        self.stdout.write(
            self.style.SUCCESS(
                f'Created {created_trips} active trip(s) for agency "{agency.agency_name}" ({agency.agency_slug}).'
            )
        )
        self.stdout.write(
            'If Explore still shows no trips: Django bypasses RLS; the browser anon key does not. '
            'Run REHNUM/supabase/scripts/ensure_explore_anon_read.sql in Supabase SQL Editor '
            '(or the full frontend_rls_policies.sql).'
        )

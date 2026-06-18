from django.core.management.base import BaseCommand

from chat.membership import sync_all_confirmed_bookings


class Command(BaseCommand):
    help = 'Sync chat group memberships from all confirmed bookings (idempotent).'

    def handle(self, *args, **options):
        count = sync_all_confirmed_bookings()
        self.stdout.write(self.style.SUCCESS(f'Synced {count} confirmed booking(s).'))

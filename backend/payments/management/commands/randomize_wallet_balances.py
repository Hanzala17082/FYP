"""Set every wallet balance to a random PKR amount between 10M and 25M."""

from __future__ import annotations

import random
import uuid
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from payments.models import Wallet, WalletTransaction


class Command(BaseCommand):
    help = 'Randomize all wallet balances between PKR 10,000,000 and 25,000,000.'

    def add_arguments(self, parser):
        parser.add_argument('--min', type=int, default=10_000_000)
        parser.add_argument('--max', type=int, default=25_000_000)
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Print planned balances without saving.',
        )

    @transaction.atomic
    def handle(self, *args, **options):
        min_amount = int(options['min'])
        max_amount = int(options['max'])
        dry_run = options['dry_run']

        if min_amount > max_amount:
            self.stderr.write(self.style.ERROR('--min must be <= --max'))
            return

        wallets = Wallet.objects.select_for_update().select_related('user').filter(
            wallet_type=Wallet.WalletType.TRAVELER,
            user__role='Traveler',
        )
        if not wallets.exists():
            self.stdout.write(self.style.WARNING('No wallets found.'))
            return

        updated = 0
        now = timezone.now()

        for wallet in wallets:
            new_balance = Decimal(str(random.randint(min_amount, max_amount)))
            old_balance = wallet.balance
            delta = new_balance - old_balance

            if dry_run:
                self.stdout.write(
                    f'{wallet.user.email}: {old_balance} -> {new_balance} PKR'
                )
                continue

            wallet.balance = new_balance
            wallet.updated_at = now
            wallet.save(update_fields=['balance', 'updated_at'])

            WalletTransaction.objects.create(
                id=uuid.uuid4(),
                wallet=wallet,
                type=WalletTransaction.TransactionType.SEED,
                amount=delta,
                description='Demo balance adjustment (10M–25M random)',
            )
            updated += 1

        if dry_run:
            self.stdout.write(self.style.SUCCESS(f'Dry run complete for {wallets.count()} wallet(s).'))
        else:
            self.stdout.write(
                self.style.SUCCESS(
                    f'Updated {updated} wallet(s) to random PKR {min_amount:,}–{max_amount:,}.'
                )
            )

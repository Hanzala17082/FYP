"""Create seeded PKR wallets for travelers who do not have one yet."""

from __future__ import annotations

import os
import random
import uuid
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from payments.models import Wallet, WalletTransaction
from users.models import User


def _random_seed_amount(min_amount: int, max_amount: int) -> Decimal:
    return Decimal(str(random.randint(min_amount, max_amount)))


class Command(BaseCommand):
    help = 'Seed PKR wallet balance for travelers missing a wallet row.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--amount',
            type=str,
            default='',
            help='Fixed seed amount. If omitted, uses random PKR 10M–25M (or WALLET_SEED_MIN/MAX).',
        )
        parser.add_argument('--min', type=int, default=int(os.environ.get('WALLET_SEED_MIN', 10_000_000)))
        parser.add_argument('--max', type=int, default=int(os.environ.get('WALLET_SEED_MAX', 25_000_000)))

    @transaction.atomic
    def handle(self, *args, **options):
        fixed = str(options['amount']).strip()
        min_amount = int(options['min'])
        max_amount = int(options['max'])
        currency = os.environ.get('WALLET_CURRENCY', 'PKR').strip() or 'PKR'
        now = timezone.now()

        travelers = User.objects.filter(role='Traveler').select_for_update()
        created = 0

        for user in travelers:
            if Wallet.objects.filter(user=user, wallet_type=Wallet.WalletType.TRAVELER).exists():
                continue
            amount = Decimal(fixed) if fixed else _random_seed_amount(min_amount, max_amount)
            wallet = Wallet.objects.create(
                id=uuid.uuid4(),
                user=user,
                wallet_type=Wallet.WalletType.TRAVELER,
                balance=amount,
                currency=currency,
            )
            WalletTransaction.objects.create(
                id=uuid.uuid4(),
                wallet=wallet,
                type=WalletTransaction.TransactionType.SEED,
                amount=amount,
                description='Welcome bonus',
            )
            wallet.updated_at = now
            wallet.save(update_fields=['updated_at'])
            created += 1

        self.stdout.write(self.style.SUCCESS(f'Created {created} wallet(s) with {currency} seed balance.'))

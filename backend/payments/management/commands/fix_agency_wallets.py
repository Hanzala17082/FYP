"""Normalize traveler vs agency wallets and reset incorrect agency balances."""

from __future__ import annotations

import uuid

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from payments.models import Wallet
from users.models import User
from vendors.models import Agency


class Command(BaseCommand):
    help = 'Ensure agencies have zero-balance agency wallets; travelers keep traveler wallets only.'

    @transaction.atomic
    def handle(self, *args, **options):
        now = timezone.now()
        fixed_agencies = 0
        created_agencies = 0

        agency_users = User.objects.filter(role='Agency')
        for user in agency_users:
            wallet = Wallet.objects.filter(user=user).first()
            if wallet:
                if wallet.wallet_type != Wallet.WalletType.AGENCY or wallet.balance != 0:
                    wallet.wallet_type = Wallet.WalletType.AGENCY
                    wallet.balance = 0
                    wallet.updated_at = now
                    wallet.save(update_fields=['wallet_type', 'balance', 'updated_at'])
                    fixed_agencies += 1
            else:
                Wallet.objects.create(
                    id=uuid.uuid4(),
                    user=user,
                    wallet_type=Wallet.WalletType.AGENCY,
                    balance=0,
                    currency='PKR',
                )
                created_agencies += 1

        traveler_fixed = Wallet.objects.filter(user__role='Traveler').exclude(
            wallet_type=Wallet.WalletType.TRAVELER
        ).update(wallet_type=Wallet.WalletType.TRAVELER, updated_at=now)

        self.stdout.write(
            self.style.SUCCESS(
                f'Agency wallets fixed: {fixed_agencies}, created: {created_agencies}, '
                f'traveler wallet types corrected: {traveler_fixed}.'
            )
        )

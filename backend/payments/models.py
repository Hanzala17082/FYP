"""
Wallet ledger for in-app trip payments.

Phase 1 (FYP demo): seeded PKR balance + debit on booking + refund on cancel.

Phase 2 (Pakistan real top-ups — not implemented yet):
  - JazzCash / EasyPaisa via direct merchant APIs or aggregators (XPay, Rapid Gateway, PayFast, Simpaisa)
  - Bank cards / IBFT / Raast via the same PSPs
  - Stripe is not available for merchants registered in Pakistan
"""
import uuid
from decimal import Decimal

from django.db import models

from bookings.models import Booking
from trips.models import Trip
from users.models import User
from vendors.models import Agency


class Wallet(models.Model):
    class WalletType(models.TextChoices):
        TRAVELER = 'traveler', 'Traveler'
        AGENCY = 'agency', 'Agency'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='wallet')
    wallet_type = models.CharField(
        max_length=20,
        choices=WalletType.choices,
        default=WalletType.TRAVELER,
    )
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    currency = models.CharField(max_length=3, default='PKR')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'wallets'


class WalletTransaction(models.Model):
    class TransactionType(models.TextChoices):
        SEED = 'seed', 'Seed'
        TOPUP = 'topup', 'Top Up'
        DEBIT = 'debit', 'Debit'
        REFUND = 'refund', 'Refund'
        EARNING = 'earning', 'Earning'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name='transactions')
    type = models.CharField(max_length=20, choices=TransactionType.choices)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    description = models.TextField(blank=True, default='')
    booking = models.ForeignKey(
        Booking,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='wallet_transactions',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'wallet_transactions'
        indexes = [
            models.Index(fields=['wallet', '-created_at']),
        ]


class PlatformFee(models.Model):
    """Fees the platform charges agencies: verification subscription + per-trip listing."""

    class FeeType(models.TextChoices):
        VERIFICATION = 'verification', 'Verification'
        TRIP_LISTING = 'trip_listing', 'Trip Listing'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    agency = models.ForeignKey(
        Agency,
        on_delete=models.CASCADE,
        related_name='platform_fees',
    )
    trip = models.ForeignKey(
        Trip,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='platform_fees',
    )
    fee_type = models.CharField(max_length=20, choices=FeeType.choices)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'platform_fees'
        indexes = [
            models.Index(fields=['agency', '-created_at']),
            models.Index(fields=['-created_at']),
        ]

import uuid

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('payments', '0002_wallet_type'),
        ('trips', '0003_remove_duplicate_indexes'),
        ('vendors', '0002_agency_verification'),
    ]

    operations = [
        migrations.CreateModel(
            name='PlatformFee',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('fee_type', models.CharField(choices=[('verification', 'Verification'), ('trip_listing', 'Trip Listing')], max_length=20)),
                ('amount', models.DecimalField(decimal_places=2, max_digits=12)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('agency', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='platform_fees', to='vendors.agency')),
                ('trip', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='platform_fees', to='trips.trip')),
            ],
            options={
                'db_table': 'platform_fees',
                'indexes': [
                    models.Index(fields=['agency', '-created_at'], name='platform_fee_agency_created_idx'),
                    models.Index(fields=['-created_at'], name='platform_fee_created_idx'),
                ],
            },
        ),
    ]

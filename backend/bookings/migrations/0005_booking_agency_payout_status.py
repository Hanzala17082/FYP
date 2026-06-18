from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('bookings', '0004_booking_payment_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='booking',
            name='agency_payout_status',
            field=models.CharField(
                choices=[('pending', 'Pending'), ('paid', 'Paid')],
                default='pending',
                max_length=20,
            ),
        ),
    ]

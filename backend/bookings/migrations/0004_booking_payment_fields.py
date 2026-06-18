from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('bookings', '0003_remove_duplicate_indexes'),
    ]

    operations = [
        migrations.AddField(
            model_name='booking',
            name='total_amount',
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=12, null=True),
        ),
        migrations.AddField(
            model_name='booking',
            name='payment_status',
            field=models.CharField(
                choices=[('paid', 'Paid'), ('refunded', 'Refunded')],
                default='paid',
                max_length=20,
            ),
        ),
    ]

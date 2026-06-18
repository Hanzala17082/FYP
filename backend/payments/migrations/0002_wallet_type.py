from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('payments', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='wallet',
            name='wallet_type',
            field=models.CharField(
                choices=[('traveler', 'Traveler'), ('agency', 'Agency')],
                default='traveler',
                max_length=20,
            ),
        ),
        migrations.AlterField(
            model_name='wallettransaction',
            name='type',
            field=models.CharField(
                choices=[
                    ('seed', 'Seed'),
                    ('topup', 'Top Up'),
                    ('debit', 'Debit'),
                    ('refund', 'Refund'),
                    ('earning', 'Earning'),
                ],
                max_length=20,
            ),
        ),
    ]

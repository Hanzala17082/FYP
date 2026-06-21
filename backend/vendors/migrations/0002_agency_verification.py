from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('vendors', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='agency',
            name='verification_status',
            field=models.CharField(
                choices=[
                    ('none', 'None'),
                    ('pending_approval', 'Pending Approval'),
                    ('approved', 'Approved'),
                    ('rejected', 'Rejected'),
                ],
                default='none',
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name='agency',
            name='verification_paid_until',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]

import uuid

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0002_booking_chat_trigger'),
        ('vendors', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='ModerationFlag',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('message_excerpt', models.TextField()),
                ('categories', models.JSONField(blank=True, default=dict)),
                ('provider', models.CharField(blank=True, default='', max_length=40)),
                (
                    'status',
                    models.CharField(
                        choices=[('pending', 'Pending'), ('reviewed', 'Reviewed')],
                        default='pending',
                        max_length=20,
                    ),
                ),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                (
                    'agency',
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='moderation_flags',
                        to='vendors.agency',
                    ),
                ),
                (
                    'group',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='moderation_flags',
                        to='chat.chatgroup',
                    ),
                ),
                (
                    'sender',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='moderation_flags',
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                'db_table': 'chat_moderation_flags',
            },
        ),
        migrations.AddIndex(
            model_name='moderationflag',
            index=models.Index(fields=['-created_at'], name='chat_mod_created_idx'),
        ),
        migrations.AddIndex(
            model_name='moderationflag',
            index=models.Index(fields=['agency', '-created_at'], name='chat_mod_agency_idx'),
        ),
        migrations.AddIndex(
            model_name='moderationflag',
            index=models.Index(fields=['status'], name='chat_mod_status_idx'),
        ),
    ]

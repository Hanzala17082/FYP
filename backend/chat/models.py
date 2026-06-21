import uuid

from django.db import models

from trips.models import Trip
from users.models import User
from vendors.models import Agency


class ChatGroup(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    trip = models.OneToOneField(Trip, on_delete=models.CASCADE, related_name='chat_group')
    title = models.CharField(max_length=255)
    subtitle = models.CharField(max_length=500, blank=True, default='')
    policy_text = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'chat_groups'


class ChatGroupMember(models.Model):
    class Role(models.TextChoices):
        ADMIN = 'admin', 'Admin'
        MEMBER = 'member', 'Member'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    group = models.ForeignKey(ChatGroup, on_delete=models.CASCADE, related_name='members')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_memberships')
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.MEMBER)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'chat_group_members'
        constraints = [
            models.UniqueConstraint(fields=['group', 'user'], name='uniq_chat_group_member'),
        ]


class ChatMessage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    group = models.ForeignKey(ChatGroup, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_messages')
    body = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'chat_messages'
        indexes = [
            models.Index(fields=['group', '-created_at']),
        ]


class ModerationFlag(models.Model):
    """A chat message that tripped the AI moderation pipeline.

    Blocked messages are NOT stored in chat_messages; we keep an excerpt here so
    platform admins (and the owning agency) can review what was attempted.
    """

    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        REVIEWED = 'reviewed', 'Reviewed'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    group = models.ForeignKey(ChatGroup, on_delete=models.CASCADE, related_name='moderation_flags')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='moderation_flags')
    # Denormalized for fast agency-scoped filtering (group -> trip -> agency).
    agency = models.ForeignKey(
        Agency, on_delete=models.CASCADE, related_name='moderation_flags', null=True, blank=True
    )
    message_excerpt = models.TextField()
    categories = models.JSONField(default=dict, blank=True)
    provider = models.CharField(max_length=40, blank=True, default='')
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'chat_moderation_flags'
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['agency', '-created_at']),
            models.Index(fields=['status']),
        ]

from __future__ import annotations

from rest_framework.request import Request
from rest_framework.views import APIView

from django.utils.dateparse import parse_datetime

from bookings.models import Booking
from chat.membership import sync_booking_membership
from chat.models import ChatGroup, ChatGroupMember, ChatMessage, ModerationFlag
from chat.serializers import group_to_dto, message_to_dto, moderation_flag_to_dto, section_for_trip
from common.responses import api_error, api_response
from common.supabase_jwt import user_from_authorization_header


def _current_user(request: Request):
    auth = request.META.get('HTTP_AUTHORIZATION') or ''
    return user_from_authorization_header(auth)


def _require_member(user, group_id):
    try:
        return ChatGroupMember.objects.select_related('group', 'group__trip', 'group__trip__agency').get(
            group_id=group_id, user=user
        )
    except ChatGroupMember.DoesNotExist:
        return None


class ChatGroupListView(APIView):
    def get(self, request: Request):
        user = _current_user(request)
        if not user:
            return api_error('Authentication required.', status=401)

        memberships = (
            ChatGroupMember.objects.filter(user=user)
            .select_related('group', 'group__trip', 'group__trip__agency')
            .order_by('-group__trip__start_date')
        )

        groups = []
        for m in memberships:
            section = 'agency' if m.role == ChatGroupMember.Role.ADMIN else section_for_trip(m.group.trip.end_date)
            groups.append(group_to_dto(m.group, m, section))

        return api_response({'groups': groups})


class ChatMessageListView(APIView):
    def get(self, request: Request, group_id: str):
        user = _current_user(request)
        if not user:
            return api_error('Authentication required.', status=401)

        membership = _require_member(user, group_id)
        if not membership:
            return api_error('Forbidden.', status=403)

        limit = min(50, max(1, int(request.query_params.get('limit', 50))))
        cursor = request.query_params.get('cursor')

        qs = ChatMessage.objects.filter(group_id=group_id).select_related('sender').order_by('-created_at')
        if cursor:
            dt = parse_datetime(cursor)
            if dt:
                qs = qs.filter(created_at__lt=dt)

        rows = list(qs[: limit + 1])
        has_more = len(rows) > limit
        if has_more:
            rows = rows[:limit]

        messages = [message_to_dto(m) for m in reversed(rows)]
        next_cursor = rows[-1].created_at.isoformat() if has_more and rows else None

        return api_response({'messages': messages, 'nextCursor': next_cursor})


class ChatGroupPolicyView(APIView):
    def patch(self, request: Request, group_id: str):
        user = _current_user(request)
        if not user:
            return api_error('Authentication required.', status=401)

        membership = _require_member(user, group_id)
        if not membership or membership.role != ChatGroupMember.Role.ADMIN:
            return api_error('Forbidden.', status=403)

        policy_text = request.data.get('policyText')
        subtitle = request.data.get('subtitle')
        update_fields = ['updated_at']
        if policy_text is not None:
            membership.group.policy_text = str(policy_text)[:5000]
            update_fields.append('policy_text')
        if subtitle is not None:
            membership.group.subtitle = str(subtitle)[:500]
            update_fields.append('subtitle')
        membership.group.save(update_fields=update_fields)

        section = 'agency'
        return api_response(group_to_dto(membership.group, membership, section))


class ChatSyncBookingView(APIView):
    """Fallback sync when DB trigger is unavailable; idempotent."""

    def post(self, request: Request, booking_id: str):
        user = _current_user(request)
        if not user:
            return api_error('Authentication required.', status=401)

        try:
            booking = Booking.objects.select_related('trip__agency').get(pk=booking_id)
        except Booking.DoesNotExist:
            return api_error('Booking not found.', status=404)

        allowed = user.role == 'Admin'
        if booking.traveler_id == user.id:
            allowed = True
        if user.role == 'Agency' and hasattr(user, 'agency') and user.agency:
            allowed = allowed or booking.trip.agency_id == user.agency.id
        if not allowed:
            return api_error('Forbidden.', status=403)

        sync_booking_membership(booking)
        return api_response({'ok': True})


class ModerationFlagListView(APIView):
    """List AI moderation flags.

    - Platform Admin: all flags.
    - Agency: only flags in chat groups tied to that agency's trips.
    - Travelers / others: forbidden.
    """

    def get(self, request: Request):
        user = _current_user(request)
        if not user:
            return api_error('Authentication required.', status=401)

        qs = (
            ModerationFlag.objects.select_related('group', 'sender', 'agency')
            .order_by('-created_at')
        )

        if user.role == 'Admin':
            pass
        elif user.role == 'Agency' and hasattr(user, 'agency') and user.agency:
            qs = qs.filter(agency_id=user.agency.id)
        else:
            return api_error('Forbidden.', status=403)

        status_filter = request.query_params.get('status')
        if status_filter in (ModerationFlag.Status.PENDING, ModerationFlag.Status.REVIEWED):
            qs = qs.filter(status=status_filter)

        limit = min(100, max(1, int(request.query_params.get('limit', 50))))
        flags = [moderation_flag_to_dto(f) for f in qs[:limit]]
        return api_response({'flags': flags})


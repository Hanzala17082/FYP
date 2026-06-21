from __future__ import annotations

from datetime import date

from chat.models import ChatGroup, ChatGroupMember, ChatMessage, ModerationFlag
from users.models import User


def _user_dto(user: User) -> dict:
    return {
        'id': str(user.id),
        'fullName': user.full_name,
        'avatarUrl': user.avatar_url or '',
        'role': user.role,
    }


def message_to_dto(msg: ChatMessage) -> dict:
    return {
        'id': str(msg.id),
        'groupId': str(msg.group_id),
        'body': msg.body,
        'createdAt': msg.created_at.isoformat(),
        'sender': _user_dto(msg.sender),
    }


def group_to_dto(group: ChatGroup, membership: ChatGroupMember, section: str) -> dict:
    trip = group.trip
    return {
        'id': str(group.id),
        'tripId': str(trip.id),
        'title': group.title,
        'subtitle': group.subtitle or trip.destination,
        'policyText': group.policy_text or '',
        'memberRole': membership.role,
        'section': section,
        'tripStartDate': trip.start_date.isoformat(),
        'tripEndDate': trip.end_date.isoformat(),
        'agencyName': trip.agency.agency_name,
    }


def section_for_trip(end_date: date) -> str:
    today = date.today()
    if end_date >= today:
        return 'upcoming'
    return 'past'


def moderation_flag_to_dto(flag: ModerationFlag) -> dict:
    return {
        'id': str(flag.id),
        'groupId': str(flag.group_id),
        'groupTitle': flag.group.title if flag.group_id else '',
        'agencyId': str(flag.agency_id) if flag.agency_id else None,
        'agencyName': flag.agency.agency_name if flag.agency_id else '',
        'sender': _user_dto(flag.sender),
        'messageExcerpt': flag.message_excerpt,
        'categories': flag.categories or {},
        'provider': flag.provider,
        'status': flag.status,
        'createdAt': flag.created_at.isoformat(),
    }

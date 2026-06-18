from __future__ import annotations

from datetime import date

from chat.models import ChatGroup, ChatGroupMember, ChatMessage
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

"""Sync chat group membership from confirmed bookings."""
from __future__ import annotations

from bookings.models import Booking
from chat.models import ChatGroup, ChatGroupMember
from trips.models import Trip


def ensure_group_for_trip(trip: Trip) -> ChatGroup:
    group, _ = ChatGroup.objects.get_or_create(
        trip=trip,
        defaults={
            'title': trip.title,
            'subtitle': trip.destination,
        },
    )
    if group.title != trip.title or group.subtitle != trip.destination:
        group.title = trip.title
        group.subtitle = trip.destination
        group.save(update_fields=['title', 'subtitle', 'updated_at'])
    return group


def ensure_agency_admin(group: ChatGroup, trip: Trip) -> None:
    agency_user = trip.agency.user
    ChatGroupMember.objects.get_or_create(
        group=group,
        user=agency_user,
        defaults={'role': ChatGroupMember.Role.ADMIN},
    )


def add_traveler_member(group: ChatGroup, traveler_id) -> None:
    ChatGroupMember.objects.get_or_create(
        group=group,
        user_id=traveler_id,
        defaults={'role': ChatGroupMember.Role.MEMBER},
    )


def remove_traveler_member(group: ChatGroup, traveler_id) -> None:
    ChatGroupMember.objects.filter(
        group=group,
        user_id=traveler_id,
        role=ChatGroupMember.Role.MEMBER,
    ).delete()


def sync_booking_membership(booking: Booking) -> None:
    trip = Trip.objects.select_related('agency__user').get(pk=booking.trip_id)
    group = ensure_group_for_trip(trip)
    ensure_agency_admin(group, trip)
    if booking.status == Booking.Status.CONFIRMED:
        add_traveler_member(group, booking.traveler_id)
    elif booking.status in (Booking.Status.CANCELLED, Booking.Status.PENDING):
        remove_traveler_member(group, booking.traveler_id)


def sync_all_confirmed_bookings() -> int:
    count = 0
    qs = Booking.objects.filter(status=Booking.Status.CONFIRMED).select_related(
        'trip', 'trip__agency__user', 'traveler'
    )
    for booking in qs.iterator():
        sync_booking_membership(booking)
        count += 1
    return count

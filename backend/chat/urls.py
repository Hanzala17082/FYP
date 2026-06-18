from django.urls import path

from chat.views import ChatGroupListView, ChatGroupPolicyView, ChatMessageListView, ChatSyncBookingView

urlpatterns = [
    path('groups', ChatGroupListView.as_view()),
    path('groups/<uuid:group_id>/messages', ChatMessageListView.as_view()),
    path('groups/<uuid:group_id>/policy', ChatGroupPolicyView.as_view()),
    path('sync-booking/<uuid:booking_id>', ChatSyncBookingView.as_view()),
]

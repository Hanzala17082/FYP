from __future__ import annotations

import json
import uuid
from typing import Optional

from channels.generic.websocket import AsyncWebsocketConsumer
from django.utils import timezone

from chat.models import ChatGroupMember, ChatMessage
from chat.serializers import message_to_dto
from common.supabase_jwt import user_from_supabase_token
from users.models import User


class ChatConsumer(AsyncWebsocketConsumer):
    group_id: str
    room_name: str
    user: Optional[User]

    async def connect(self):
        self.group_id = self.scope['url_route']['kwargs']['group_id']
        self.room_name = f'chat_{self.group_id}'
        self.user = None

        token = None
        query = self.scope.get('query_string', b'').decode()
        for part in query.split('&'):
            if part.startswith('token='):
                token = part[6:]
                break

        if not token:
            await self.close(code=4401)
            return

        self.user = await self._get_user(token)
        if not self.user:
            await self.close(code=4401)
            return

        is_member = await self._is_member()
        if not is_member:
            await self.close(code=4403)
            return

        await self.channel_layer.group_add(self.room_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'room_name'):
            await self.channel_layer.group_discard(self.room_name, self.channel_name)

    async def receive(self, text_data=None, bytes_data=None):
        if not text_data or not self.user:
            return
        try:
            payload = json.loads(text_data)
        except json.JSONDecodeError:
            return
        if payload.get('type') != 'message':
            return
        body = str(payload.get('body', '')).strip()
        if not body or len(body) > 2000:
            return

        msg = await self._save_message(body)
        if not msg:
            return

        dto = message_to_dto(msg)
        await self.channel_layer.group_send(
            self.room_name,
            {'type': 'chat.message', 'payload': dto},
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({'type': 'message', 'message': event['payload']}))

    async def _get_user(self, token: str) -> Optional[User]:
        from asgiref.sync import sync_to_async

        return await sync_to_async(user_from_supabase_token)(token)

    async def _is_member(self) -> bool:
        from asgiref.sync import sync_to_async

        def check():
            return ChatGroupMember.objects.filter(group_id=self.group_id, user_id=self.user.id).exists()

        return await sync_to_async(check)()

    async def _save_message(self, body: str) -> Optional[ChatMessage]:
        from asgiref.sync import sync_to_async

        def create():
            return ChatMessage.objects.create(
                id=uuid.uuid4(),
                group_id=self.group_id,
                sender=self.user,
                body=body,
                created_at=timezone.now(),
            )

        try:
            return await sync_to_async(create)()
        except Exception:
            return None

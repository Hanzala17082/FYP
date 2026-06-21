"""
Chat message moderation for trip group chats.

Detects three families of unsafe content:
  - adult / 18+ (sexual) content
  - hate speech (racism, etc.)
  - harassment (sexist / demeaning remarks)

Primary classifier: Google Gemini via its OpenAI-compatible API (Gemini has no
dedicated moderation endpoint, so we ask the model to classify and return JSON).
If no GEMINI_API_KEY is configured (or the API call fails), we fall back to a
small keyword list so the chat still has basic protection offline.
"""
from __future__ import annotations

import json
import logging
import re
from typing import Dict

from django.conf import settings

logger = logging.getLogger(__name__)

GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/openai/'

# Coarse buckets we surface to admins.
_CATEGORIES = ('adult', 'hate', 'harassment', 'violence')

_CLASSIFY_PROMPT = (
    'You are a strict content-moderation classifier for a travel app group chat. '
    'Classify the user message for the following categories and respond with ONLY '
    'a compact JSON object (no markdown, no explanation) with boolean values:\n'
    '{"adult": <true if sexual/18+ content>, '
    '"hate": <true if hate speech, racism, slurs>, '
    '"harassment": <true if harassment, sexist or demeaning remarks, bullying>, '
    '"violence": <true if threats or violent content>}'
)

# Minimal offline fallback keywords -> bucket.
_FALLBACK_KEYWORDS = {
    'adult': [
        'porn', 'nude', 'nudes', 'sex', 'sexting', 'xxx', 'nsfw',
    ],
    'hate': [
        'nigger', 'paki ', 'chink', 'kike', 'spic', 'raghead',
    ],
    'harassment': [
        'slut', 'whore', 'bitch', 'retard',
    ],
}

_client = None
_client_initialized = False


def _get_client():
    """Lazily build the Gemini (OpenAI-compatible) client; None if unavailable."""
    global _client, _client_initialized
    if _client_initialized:
        return _client
    _client_initialized = True
    api_key = getattr(settings, 'GEMINI_API_KEY', '') or ''
    if not api_key:
        _client = None
        return None
    try:
        from openai import OpenAI

        _client = OpenAI(api_key=api_key, base_url=GEMINI_BASE_URL)
    except Exception as exc:  # pragma: no cover - defensive
        logger.warning('Gemini moderation client unavailable: %s', exc)
        _client = None
    return _client


def _model() -> str:
    return getattr(settings, 'GEMINI_MODERATION_MODEL', '') or 'gemini-2.5-flash'


def _fallback_classify(text: str) -> Dict:
    lowered = f' {text.lower()} '
    categories: Dict[str, float] = {}
    for bucket, words in _FALLBACK_KEYWORDS.items():
        for word in words:
            if word in lowered:
                categories[bucket] = 1.0
                break
    return {
        'safe': len(categories) == 0,
        'categories': categories,
        'provider': 'keyword-fallback',
    }


def _parse_json(content: str) -> Dict:
    """Parse the model's JSON reply, tolerating code fences / extra text."""
    content = (content or '').strip()
    if not content:
        return {}
    # Strip markdown code fences if present.
    if content.startswith('```'):
        content = re.sub(r'^```[a-zA-Z]*\n?|```$', '', content).strip()
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        match = re.search(r'\{.*\}', content, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(0))
            except json.JSONDecodeError:
                return {}
    return {}


def _gemini_classify(client, text: str) -> Dict:
    resp = client.chat.completions.create(
        model=_model(),
        messages=[
            {'role': 'system', 'content': _CLASSIFY_PROMPT},
            {'role': 'user', 'content': text},
        ],
        temperature=0,
    )
    content = resp.choices[0].message.content if resp.choices else ''
    parsed = _parse_json(content)

    categories: Dict[str, float] = {}
    for cat in _CATEGORIES:
        if bool(parsed.get(cat)):
            categories[cat] = 1.0

    return {
        'safe': len(categories) == 0,
        'categories': categories,
        'provider': 'gemini',
    }


def classify(text: str) -> Dict:
    """
    Classify a chat message.

    Returns: {
        'safe': bool,
        'categories': { 'adult'|'hate'|'harassment'|'violence': score },
        'provider': str,
    }
    """
    text = (text or '').strip()
    if not text:
        return {'safe': True, 'categories': {}, 'provider': 'empty'}

    client = _get_client()
    if client is not None:
        try:
            return _gemini_classify(client, text)
        except Exception as exc:
            logger.warning('Gemini moderation failed, using fallback: %s', exc)

    return _fallback_classify(text)


def violation_reason(categories: Dict[str, float]) -> str:
    """Human-readable reason shown to the sender when a message is blocked."""
    labels = {
        'adult': 'adult / 18+ content',
        'hate': 'hate speech',
        'harassment': 'harassment or demeaning remarks',
        'violence': 'violent content',
    }
    names = [labels.get(c, c) for c in categories.keys()]
    if not names:
        return 'community guidelines violation'
    return ', '.join(names)

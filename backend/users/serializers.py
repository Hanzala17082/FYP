"""
Auth serializers. Output camelCase to match frontend DTOs.
"""
import re
from rest_framework import serializers
from .models import User, TravelerProfile
from vendors.models import Agency

CNIC_PATTERN = re.compile(r'^\d{5}-\d{7}-\d{1}$')


def user_to_dto(user: User) -> dict:
    """UserDTO shape for frontend."""
    avatar = user.avatar_url
    if not avatar and hasattr(user, 'agency') and user.agency:
        avatar = getattr(user.agency, 'logo_url', None)
    return {
        'id': str(user.id),
        'email': user.email,
        'fullName': user.full_name,
        'role': user.role,
        'city': user.city or None,
        'avatar': avatar,
        'createdAt': user.created_at.isoformat() + 'Z' if user.created_at else None,
    }


def user_detail_to_dto(user: User) -> dict:
    """UserDTO + optional travelerProfile for admin GET user by id."""
    d = user_to_dto(user)
    if hasattr(user, 'traveler_profile') and user.traveler_profile:
        d['travelerProfile'] = {'cnic': user.traveler_profile.cnic}
    return d


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=['Traveler', 'Agency', 'Admin'], required=False)


class RegisterSerializer(serializers.Serializer):
    fullName = serializers.CharField(source='full_name', max_length=255)
    email = serializers.EmailField()
    city = serializers.CharField(required=False, allow_blank=True, default='')
    cnic = serializers.CharField(required=False, allow_blank=True, default='')
    password = serializers.CharField(write_only=True, min_length=8)
    confirmPassword = serializers.CharField(write_only=True, source='confirm_password')
    role = serializers.ChoiceField(choices=['Traveler', 'Agency'])
    agreeToTerms = serializers.BooleanField(source='agree_to_terms', required=False, default=True)

    def validate(self, attrs):
        if attrs.get('password') != attrs.get('confirm_password'):
            raise serializers.ValidationError({'confirmPassword': 'Passwords do not match.'})
        if not attrs.get('agree_to_terms', True):
            raise serializers.ValidationError({'agreeToTerms': 'You must agree to the terms.'})
        if User.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError({'email': 'A user with this email already exists.'})
        role = attrs.get('role')
        cnic = (attrs.get('cnic') or '').strip()
        if role == 'Traveler':
            if not cnic:
                raise serializers.ValidationError({'cnic': 'CNIC is required for travelers.'})
            if not CNIC_PATTERN.match(cnic):
                raise serializers.ValidationError(
                    {'cnic': 'Enter a valid CNIC in the format xxxxx-xxxxxxx-x (13 digits).'}
                )
        return attrs

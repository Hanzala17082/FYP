import os
import sys

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, BASE_DIR)

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.local")

import django  # noqa: E402

django.setup()  # noqa: E402

from users.models import User  # noqa: E402


def upsert(*, email: str, full_name: str, role: str, password: str, is_staff: bool, is_superuser: bool) -> None:
    user, created = User.objects.get_or_create(
        email=email,
        defaults={"full_name": full_name, "role": role},
    )
    user.full_name = full_name
    user.role = role
    user.is_staff = is_staff
    user.is_superuser = is_superuser
    user.is_active = True
    user.set_password(password)
    user.save()
    print(("created" if created else "updated"), email, role)


upsert(
    email="admin@tripster.com",
    full_name="Tripster Admin",
    role="Admin",
    password="AdminSecure123",
    is_staff=True,
    is_superuser=True,
)
upsert(
    email="agency@tripster.com",
    full_name="Demo Agency",
    role="Agency",
    password="AgencySecure123",
    is_staff=True,
    is_superuser=False,
)
upsert(
    email="traveler@tripster.com",
    full_name="Demo Traveler",
    role="Traveler",
    password="TravelerSecure123",
    is_staff=True,
    is_superuser=False,
)


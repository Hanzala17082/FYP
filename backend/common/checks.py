"""Project-wide Django system checks."""
from django.conf import settings
from django.core.checks import Warning, register


@register(deploy=False)
def warn_if_default_database_is_not_postgres(app_configs, **kwargs):
    """Settings require Postgres; warn if default database engine drifts."""
    engine = settings.DATABASES.get('default', {}).get('ENGINE') or ''
    if engine.endswith('postgresql'):
        return []
    return [
        Warning(
            f'Expected PostgreSQL for default database; got {engine!r}.',
            id='common.W001',
        )
    ]

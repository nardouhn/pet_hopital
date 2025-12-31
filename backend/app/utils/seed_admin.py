"""User seeding utilities.

Provides idempotent helpers to create admin and default users safely.

Design:
- Uses environment variables but falls back to sensible dev defaults so a fresh
  DB can be seeded in development without secrets.
- Uses the application's password hashing (werkzeug.generate_password_hash).
- Idempotent: checks by email and will not create duplicates.
"""
import os
from typing import Optional
from werkzeug.security import generate_password_hash
from app.extensions import db
from app.models import User


def create_user_if_missing(email: str, password: str, first_name: Optional[str] = None, last_name: Optional[str] = None, user_type: str = 'customer') -> User:
    """Create a user if not existing. If exists, ensure role and is_active flag.

    Args:
        email: user's email (required)
        password: plaintext password to hash (required when creating)
        first_name, last_name: optional names
        user_type: 'admin' or 'customer'

    Returns:
        The existing or newly created User instance.
    """
    if not email or not password:
        raise ValueError('email and password are required')

    existing = User.query.filter_by(email=email).first()
    if existing:
        changed = False
        if existing.user_type != user_type:
            existing.user_type = user_type
            changed = True
        try:
            if getattr(existing, 'is_active', None) is False:
                existing.is_active = True
                changed = True
        except Exception:
            # Older DB may not have is_active yet
            pass

        if changed:
            db.session.add(existing)
            db.session.commit()
        return existing

    # Create
    name_parts = (first_name or '').strip(), (last_name or '').strip()
    fn = name_parts[0] or (email.split('@')[0] if email else 'User')
    ln = name_parts[1] or ''
    hashed = generate_password_hash(password)
    u = User(first_name=fn, last_name=ln, email=email, password=hashed, user_type=user_type)
    try:
        u.is_active = True
    except Exception:
        pass
    db.session.add(u)
    db.session.commit()
    return u


def create_admin_if_missing(email: str, password: str, full_name: Optional[str] = None) -> User:
    """Convenience wrapper for admin creation."""
    first = None
    last = None
    if full_name:
        parts = full_name.strip().split()
        first = parts[0]
        last = ' '.join(parts[1:]) if len(parts) > 1 else None
    return create_user_if_missing(email=email, password=password, first_name=first, last_name=last, user_type='admin')


def create_defaults_from_env(prefix_admin: str = 'ADMIN', prefix_user: str = 'USER') -> bool:
    """Ensure default admin and normal user exist.

    Environment variables used (fallbacks are dev-safe defaults):
      ADMIN_EMAIL (default: admin@gmail.com)
      ADMIN_PASSWORD (default: 123456)
      ADMIN_NAME (optional)

      USER_EMAIL (default: user@gmail.com)
      USER_PASSWORD (default: 123456)
      USER_NAME (optional)

    Returns True if the function ran (created/ensured users), False if required envs missing.
    """
    admin_email = os.environ.get(f'{prefix_admin}_EMAIL', 'admin@gmail.com')
    admin_pass = os.environ.get(f'{prefix_admin}_PASSWORD', '123456')
    admin_name = os.environ.get(f'{prefix_admin}_NAME')

    user_email = os.environ.get(f'{prefix_user}_EMAIL', 'user@gmail.com')
    user_pass = os.environ.get(f'{prefix_user}_PASSWORD', '123456')
    user_name = os.environ.get(f'{prefix_user}_NAME')

    # For development/testing we allow defaults; still return True to indicate it ran
    create_admin_if_missing(email=admin_email, password=admin_pass, full_name=admin_name)
    # Create normal user
    if user_email and user_pass:
        # split name
        fn = None
        ln = None
        if user_name:
            parts = user_name.strip().split()
            fn = parts[0]
            ln = ' '.join(parts[1:]) if len(parts) > 1 else None
        create_user_if_missing(email=user_email, password=user_pass, first_name=fn, last_name=ln, user_type='customer')

    return True


def create_admin_from_env(env_prefix: str = 'ADMIN') -> bool:
    """Compatibility helper retained for backwards compatibility.

    This function only acts if ADMIN_EMAIL and ADMIN_PASSWORD are set.
    """
    email = os.environ.get(f'{env_prefix}_EMAIL')
    password = os.environ.get(f'{env_prefix}_PASSWORD')
    name = os.environ.get(f'{env_prefix}_NAME')

    if not email or not password:
        return False

    create_admin_if_missing(email=email, password=password, full_name=name)
    return True
#!/usr/bin/env python3
"""Create test users in the database.

Creates two users if they don't exist:
 - admin@gmail.com / 123456 (role: admin)
 - user@gmail.com / 123456 (role: customer)

Run locally from project root:
  python backend/scripts/create_test_user.py

Or inside the backend container (docker compose):
  docker compose exec backend_flask_app python backend/scripts/create_test_user.py
"""

import os
import sys

# Ensure package imports work when run from project root
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from app import create_app
from app.extensions import db
from werkzeug.security import generate_password_hash
from app.models import User

app = create_app()

ADMIN_EMAIL = os.environ.get('TEST_ADMIN_EMAIL', 'admin@gmail.com')
ADMIN_PASS = os.environ.get('TEST_ADMIN_PASS', '123456')
USER_EMAIL = os.environ.get('TEST_USER_EMAIL', 'user@gmail.com')
USER_PASS = os.environ.get('TEST_USER_PASS', '123456')


def create_user_if_missing(email, password, first_name, last_name, user_type='customer'):
    with app.app_context():
        existing = User.query.filter_by(email=email).first()
        if existing:
            print(f"User {email} already exists (id={existing.user_id}). Skipping.")
            return existing

        hashed = generate_password_hash(password)
        u = User(first_name=first_name, last_name=last_name, email=email, password=hashed, user_type=user_type)
        db.session.add(u)
        db.session.commit()
        print(f"Created {user_type} user {email} (id={u.user_id}).")
        return u


if __name__ == '__main__':
    print('Creating test users...')
    create_user_if_missing(ADMIN_EMAIL, ADMIN_PASS, 'Admin', 'Test', user_type='admin')
    create_user_if_missing(USER_EMAIL, USER_PASS, 'User', 'Test', user_type='customer')
    print('Done.')

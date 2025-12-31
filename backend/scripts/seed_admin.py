#!/usr/bin/env python3
"""Create an admin user using environment variables.

Usage:
  # Provide ADMIN_EMAIL and ADMIN_PASSWORD (and optional ADMIN_NAME) in env
  python backend/scripts/seed_admin.py

Or from the backend container:
  docker compose exec backend_flask_app python backend/scripts/seed_admin.py

This script is idempotent and will not overwrite an existing admin account.
"""
import os
import sys

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from app import create_app
from app.extensions import db
from app.utils.seed_admin import create_admin_from_env

app = create_app()

if __name__ == '__main__':
    with app.app_context():
        ok = create_admin_from_env()
        if not ok:
            print('ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required. Skipping.')
            sys.exit(1)
        print('Admin ensured (created if missing).')

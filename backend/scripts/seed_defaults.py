#!/usr/bin/env python3
"""Create default admin + normal user using environment variables (dev-safe defaults).

Usage:
  python backend/scripts/seed_defaults.py

Environment variables:
  ADMIN_EMAIL (default admin@gmail.com)
  ADMIN_PASSWORD (default 123456)
  ADMIN_NAME (optional)

  USER_EMAIL (default user@gmail.com)
  USER_PASSWORD (default 123456)
  USER_NAME (optional)
"""
import os
import sys

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from app import create_app
from app.utils.seed_admin import create_defaults_from_env

app = create_app()

if __name__ == '__main__':
    with app.app_context():
        ok = create_defaults_from_env()
        if not ok:
            print('Failed to run default seeding; required environment variables missing.')
            sys.exit(1)
        print('Default accounts ensured (admin + user).')

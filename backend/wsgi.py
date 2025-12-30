"""WSGI entrypoint used by production servers (gunicorn)

Example: gunicorn -w 4 wsgi:app
"""
from app import create_app

# Expose the `app` callable expected by WSGI servers
app = create_app()

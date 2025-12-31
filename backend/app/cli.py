"""Flask CLI commands for maintenance tasks (seeding, etc.)."""
import click
from flask import current_app
from app.utils.seed_admin import create_admin_from_env


@click.command('seed-admin')
@click.option('--env-prefix', default='ADMIN', help='Environment variable prefix for admin creds (default: ADMIN)')
def seed_admin(env_prefix):
    """Create admin from environment variables (ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME)."""
    with current_app.app_context():
        ok = create_admin_from_env(env_prefix)
        if not ok:
            click.echo('ADMIN_EMAIL and ADMIN_PASSWORD not set; aborting.')
            raise SystemExit(2)
        click.echo('Admin ensured (created if missing).')


@click.command('seed-defaults')
@click.option('--admin-prefix', default='ADMIN', help='Environment variable prefix for admin creds (default: ADMIN)')
@click.option('--user-prefix', default='USER', help='Environment variable prefix for user creds (default: USER)')
def seed_defaults(admin_prefix, user_prefix):
    """Ensure default admin and user exist. Uses environment variables with dev-safe defaults.

    Vars: ADMIN_EMAIL/ADMIN_PASSWORD (optional defaults admin@gmail.com/123456)
          USER_EMAIL/USER_PASSWORD (optional defaults user@gmail.com/123456)
    """
    with current_app.app_context():
        from app.utils.seed_admin import create_defaults_from_env
        create_defaults_from_env(prefix_admin=admin_prefix, prefix_user=user_prefix)
        click.echo('Default accounts ensured (admin + user).')

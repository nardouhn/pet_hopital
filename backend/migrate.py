"""Run DB migrations programmatically"""
import os
import shutil
import subprocess
from app import create_app
from flask_migrate import upgrade

app = create_app()

if __name__ == '__main__':
    import socket
    import time

    def wait_for_db(host, port, attempts=12, delay=5):
        for i in range(1, attempts + 1):
            try:
                # Resolve host
                socket.getaddrinfo(host, port)
                # Try TCP connect
                with socket.create_connection((host, port), timeout=3):
                    print(f"[migrate] DB reachable at {host}:{port}")
                    return True
            except Exception as e:
                print(f"[migrate] waiting for DB ({host}:{port}) — attempt {i}/{attempts}: {e}")
                time.sleep(delay)
        return False

    with app.app_context():
        MIG_DIR = 'migrations'
        ENV_PY = os.path.join(MIG_DIR, 'env.py')

        # Wait for DB host to be resolvable and accept connections before running migrations
        db_host = os.environ.get('PGHOST', 'localhost')
        db_port = int(os.environ.get('PGPORT', '5432'))
        wait_attempts = int(os.environ.get('DB_WAIT_ATTEMPTS', '12'))
        wait_delay = int(os.environ.get('DB_WAIT_DELAY', '5'))

        if not wait_for_db(db_host, db_port, attempts=wait_attempts, delay=wait_delay):
            raise RuntimeError(f"Database {db_host}:{db_port} not reachable after {wait_attempts} attempts")

        # If migrations folder is missing or missing alembic env.py, initialize a fresh migration repository
        needs_init = (not os.path.isdir(MIG_DIR)) or (not os.path.isfile(ENV_PY))

        if needs_init:
            print(f"[migrate] migrations not initialized (env.py missing) — initializing migrations in '{MIG_DIR}'")
            # If directory exists but is malformed (placeholder), remove it so `flask db init` can succeed
            if os.path.isdir(MIG_DIR):
                try:
                    shutil.rmtree(MIG_DIR)
                    print(f"[migrate] removed existing '{MIG_DIR}' folder to reinitialize")
                except Exception as e:
                    print(f"[migrate] failed to remove existing '{MIG_DIR}': {e}")
                    raise

            env = os.environ.copy()
            # Ensure Flask CLI can find the app
            env.setdefault('FLASK_APP', 'run.py')
            try:
                subprocess.check_call(['flask', 'db', 'init'], env=env)
                subprocess.check_call(['flask', 'db', 'migrate', '-m', 'initial'], env=env)
                subprocess.check_call(['flask', 'db', 'upgrade'], env=env)
                print('[migrate] migrations initialized and applied')
            except subprocess.CalledProcessError:
                print('[migrate] failed to initialize migrations')
                raise
        else:
            upgrade()
            print('Migrations applied')
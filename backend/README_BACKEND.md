# Backend (Flask) — Project structure

This repository contains a Flask backend using the application factory pattern.

Structure (major files)

- backend/
  - app/ # Flask application package (factory, blueprints, models)
    - **init**.py # application factory, blueprint registration
    - config.py # configuration object
    - extensions.py # db, migrate singletons
    - models.py # SQLAlchemy models
    - routes/ # blueprint modules
      - auth.py
      - users.py
      - appointments.py
      - feedback.py
  - run.py # development entrypoint (`app` available as `app`)
  - wsgi.py # WSGI entrypoint for production servers (gunicorn)
  - migrate.py # programmatic migration helper
  - docker-entrypoint.sh
  - Dockerfile
  - requirements.txt
  - migrations/ # Alembic migration repository (created or checked-in)

Notes about legacy JS code

- There is a `src/` folder that contains legacy Node.js code (old server and config). To avoid confusion, treat that folder as legacy and **move it to `node_legacy/`** or archive it. The active backend is the Flask app under `app/`.

Running locally

1. Copy `.env.example` -> `.env` and set DB credentials
2. Install dependencies and create virtualenv
3. Initialize or apply migrations:

```bash
flask db init      # only once (or use `python migrate.py` which will init if missing)
flask db migrate -m "init models"
flask db upgrade
```

4. Run the dev server:

```bash
python run.py
```

You can create test users quickly using the provided script `backend/scripts/create_test_user.py` (creates an admin and a customer with password `123456`):

```bash
# run locally from repository root
python backend/scripts/create_test_user.py

# or inside the backend container
docker compose exec backend_flask_app python backend/scripts/create_test_user.py
```

Production: use `gunicorn wsgi:app` or the included Dockerfile which runs `gunicorn run:app`.

How to run (dev)

1. Create a Python virtualenv and install requirements (Flask, Flask-SQLAlchemy, Flask-Migrate, psycopg2-binary, PyJWT)
2. Copy `.env.example` -> `.env` and adjust DB credentials
3. flask db init / migrate / upgrade (if using migrations)
4. python run.py

Notes

- The routes and models are split and simplified — you can extend `models.py` by copying the classes from the legacy `app.py`.
- I added token generation in the `auth` blueprint (simplified JWT usage). Make sure to set `JWT_SECRET` in `.env`.

Migrations & auth notes

- After changing or adding models (like `BlockedToken`, `Appointment`, `Feedback`) run the migration steps:

  ```bash
  flask db init      # only once
  flask db migrate -m "init models"
  flask db upgrade
  ```

- Authentication:
  - `POST /auth/login` returns `accessToken` (JWT). Include it in requests with `Authorization: Bearer <token>`.
  - `POST /auth/logout` blacklists the token so it can't be reused.
  - Use `@authenticator` and `@check_role([...])` decorators in route handlers to require authentication and roles (examples included in `routes/`).

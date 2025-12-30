# backend/app/__init__.py — Flask application factory
from flask import Flask
from .config import Config
from .extensions import db, migrate

# Import and register blueprints here
from .routes.auth import auth_bp
from .routes.users import users_bp, api_users_bp
from .routes.appointments import appt_bp
from .routes.feedback import fb_bp
from .routes.doctors import doctors_bp
from .routes.admin import admin_bp
from .routes.vaccination import vax_bp


def create_app(config_object=None):
    app = Flask(__name__, static_folder=None)
    if config_object is None:
        app.config.from_object(Config)
    else:
        app.config.from_object(config_object)

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)

    # Ensure models are imported so Flask-Migrate can detect them
    from .models import Vaccination  # noqa: F401

    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(users_bp, url_prefix='/user')
    # Expose API-compatible prefix used by frontend dev/proxy
    app.register_blueprint(api_users_bp, url_prefix='/api/users')
    app.register_blueprint(appt_bp, url_prefix='/appointment')
    app.register_blueprint(fb_bp, url_prefix='/feedback')
    app.register_blueprint(doctors_bp, url_prefix='/doctor')
    app.register_blueprint(admin_bp, url_prefix='/admin')
    app.register_blueprint(vax_bp, url_prefix='/vaccination')

    @app.route('/')
    def health():
        return { 'status': 'ok' }

    return app

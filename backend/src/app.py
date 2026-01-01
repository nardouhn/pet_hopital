"""Flask wrapper to mirror the previous Express `src/app.js` behavior.
This module imports the application factory and sets up CORS, a health endpoint,
and (optionally) serves swagger if a swagger.json file is present.
"""
import os
from flask import jsonify, send_from_directory
from flask_cors import CORS

# Import the existing application factory
from app import create_app


def create_flask_app(config_object=None):
    app = create_app(config_object=config_object)

    # CORS configuration (mirror Express allowedOrigins behavior)
    # Build a robust whitelist for development: include localhost and 127.0.0.1 variants
    # Read explicit frontend origin from env if provided (preferred for production)
    frontend = os.environ.get('FRONTEND_URL', '')

    # If a FRONTEND_URL is provided, build a conservative whitelist (keeps previous behavior)
    if frontend:
        allowed = [frontend, 'http://localhost:5173', 'http://127.0.0.1:5173']
        # If FRONTEND_URL contains localhost, also add the 127.0.0.1 variant to be safe
        try:
            if 'localhost' in frontend:
                allowed.append(frontend.replace('localhost', '127.0.0.1'))
        except Exception:
            pass

        # Deduplicate
        allowed = list(dict.fromkeys(allowed))

        # Use explicit whitelist to avoid passing a callable into flask-cors (older versions
        # may not accept callables for origins matching).
        CORS(app, origins=allowed, supports_credentials=True, allow_headers=['Content-Type', 'Authorization'])

        # Log allowed origins for easier debugging
        try:
            app.logger.info('CORS allowed origins: %s', ','.join(allowed))
        except Exception:
            pass
    else:
        # No FRONTEND_URL provided — be permissive and allow any http(s) origin using a regex.
        # This makes deployed setups (where FRONTEND_URL was not explicitly set) work without
        # needing a rebuild or extra env configuration.
        CORS(app, origins=r'^https?://.*', supports_credentials=True, allow_headers=['Content-Type', 'Authorization'])
        try:
            app.logger.info('CORS allowed origins: regex ^https?://.* (permits any http/https origin)')
        except Exception:
            pass

    # Health check (already provided by factory but keep here for parity)
    @app.route('/health')
    def health():
        return jsonify({'status': 'ok'})

    # Serve swagger.json if it exists in the project root (optional)
    swagger_path = os.path.join(os.getcwd(), 'swagger.json')

    if os.path.exists(swagger_path):
        @app.route('/api-docs/swagger.json')
        def swagger_json():
            return send_from_directory(os.getcwd(), 'swagger.json')

    return app


# WSGI entrypoint for tools that import this module
app = create_flask_app()

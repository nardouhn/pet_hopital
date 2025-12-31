# run.py — development entrypoint for Flask app
import os
from app import create_app

app = create_app()

# Configure CORS for the running application (ensure runtime respects FRONTEND_URL)
from flask_cors import CORS
import os

# Build a robust whitelist for development: include localhost and container variants
frontend = os.environ.get('FRONTEND_URL', 'http://localhost:5173')
allowed = [frontend, 'http://localhost:5173', 'http://127.0.0.1:5173', 'http://frontend:5173']

# If FRONTEND_URL contains localhost, also add the 127.0.0.1 variant to be safe
try:
    if 'localhost' in frontend:
        allowed.append(frontend.replace('localhost', '127.0.0.1'))
except Exception:
    pass

# Deduplicate and apply
allowed = list(dict.fromkeys(allowed))
CORS(app, origins=allowed, supports_credentials=True)
try:
    app.logger.info('CORS allowed origins: %s', ','.join(allowed))
except Exception:
    pass

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)

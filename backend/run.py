# run.py — development entrypoint for Flask app
import os
from app import create_app

app = create_app()

# Configure CORS for the running application (ensure runtime respects FRONTEND_URL)
from flask_cors import CORS
import os

allowed = [os.environ.get('FRONTEND_URL', 'http://localhost:5173')]

def cors_origin(origin):
    if origin is None:
        return True
    return origin in allowed

# Use the explicit whitelist array for flask-cors to avoid passing a callable
CORS(app, origins=allowed, supports_credentials=True)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)

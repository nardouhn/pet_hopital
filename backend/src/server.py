"""Dev server to run the Flask application (equivalent to the previous src/server.js).
Run with: python -m backend.src.server or python src/server.py from the backend directory.
"""
import os
from dotenv import load_dotenv

load_dotenv()

from src.app import create_flask_app
from app.extensions import db

port = int(os.environ.get('PORT', 8080))

app = create_flask_app()

if __name__ == '__main__':
    # Quick DB connectivity check
    try:
        with app.app_context():
            # perform a lightweight query to verify DB is available
            db.session.execute('SELECT 1')
            print('✅ Connected to PostgreSQL')
    except Exception as e:
        print('❌ PostgreSQL connection failed:', str(e))
        raise

    app.run(host='0.0.0.0', port=port, debug=True)

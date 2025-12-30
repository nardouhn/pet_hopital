from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

# singletons used across the app
db = SQLAlchemy()
migrate = Migrate()

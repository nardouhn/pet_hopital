import os

class Config:
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        f"postgresql://{os.environ.get('PGUSER','postgres')}:{os.environ.get('PGPASSWORD','example')}@{os.environ.get('PGHOST','localhost')}:{os.environ.get('PGPORT','5432')}/{os.environ.get('PGDATABASE','vet_clinic')}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.environ.get('SECRET_KEY','change_me')
    JWT_SECRET = os.environ.get('JWT_SECRET','masai-secret')
    FRONTEND_URL = os.environ.get('FRONTEND_URL','http://localhost:5173')
    # JWT expiry in seconds (default 1 hour)
    JWT_EXP_SECONDS = int(os.environ.get('JWT_EXP_SECONDS', '3600'))
    # Refresh token validity in days
    REFRESH_TOKEN_DAYS = int(os.environ.get('REFRESH_TOKEN_DAYS', '7'))

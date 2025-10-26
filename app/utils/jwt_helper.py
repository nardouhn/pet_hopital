import jwt
import datetime
from app.config import SECRET_KEY

def encode_token(username):
    payload = {
        'user': username,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=30)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')

def decode_token(token):
    return jwt.decode(token, SECRET_KEY, algorithms=['HS256'])

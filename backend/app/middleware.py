from functools import wraps
from flask import request, jsonify, g
import jwt
from .models import User, BlockedToken
from .config import Config


def authenticator(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'message': 'Please login first'}), 401

        token = auth_header.split(' ')[1]

        # Check blacklist
        blocked = BlockedToken.query.filter_by(token=token).first()
        if blocked:
            return jsonify({'message': 'Session expired, please login again'}), 401

        try:
            decoded = jwt.decode(token, Config.JWT_SECRET, algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid or expired token'}), 401

        user_id = decoded.get('userId')
        if not user_id:
            return jsonify({'message': 'Invalid token payload'}), 401

        user = User.query.get(user_id)
        if not user:
            return jsonify({'message': 'User not found'}), 404

        # Block disabled accounts
        if getattr(user, 'is_active', True) is False:
            return jsonify({'message': 'Account disabled'}), 403

        # Attach user to global request context
        g.user = user
        g.user_id = user.user_id

        return f(*args, **kwargs)

    return wrapper


def check_role(allowed_roles):
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            user = getattr(g, 'user', None)
            if not user:
                return jsonify({'message': 'Unauthorized'}), 401
            if user.user_type not in allowed_roles:
                return jsonify({'message': 'Forbidden'}), 403
            return f(*args, **kwargs)
        return wrapper
    return decorator

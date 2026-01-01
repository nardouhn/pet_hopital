from flask import Blueprint, jsonify, request, g
from ..models import User, Pet
from ..extensions import db
from ..middleware import authenticator, check_role
from werkzeug.security import generate_password_hash

users_bp = Blueprint('users', __name__)

# Also expose the same handlers under the /api/users prefix to match frontend expectations
api_users_bp = Blueprint('api_users', __name__)

# Wrapper routes: they reuse the same handler functions so logic stays in one place.
@api_users_bp.route('/all', methods=['GET'])
@authenticator
@check_role(['admin','superadmin'])
def get_all_users_api():
    return get_all_users()

@api_users_bp.route('/me', methods=['GET'])
@authenticator
def get_profile_api():
    return get_profile()

@api_users_bp.route('/me', methods=['PUT'])
@authenticator
def update_profile_api():
    return update_profile()

@api_users_bp.route('/change-password', methods=['PUT'])
@authenticator
def change_password_api():
    return change_password()

@api_users_bp.route('/pets', methods=['GET'])
@authenticator
def get_my_pets_api():
    return get_my_pets()

@api_users_bp.route('/pets', methods=['POST'])
@authenticator
def add_pet_api():
    return add_pet()
@users_bp.route('/all', methods=['GET'])
@authenticator
@check_role(['admin','superadmin'])
def get_all_users():
    users = User.query.all()
    return jsonify({'data': [u.to_dict() for u in users]}), 200


@users_bp.route('/me', methods=['GET'])
@authenticator
def get_profile():
    user_id = getattr(g, 'user_id', None)
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'Not found'}), 404
    return jsonify({'data': user.to_dict()}), 200


# Alias to support standardized frontend route: /user/profile
@users_bp.route('/profile', methods=['GET'])
@authenticator
def get_profile_alias():
    return get_profile()


@users_bp.route('/me', methods=['PUT'])
@authenticator
def update_profile():
    user_id = getattr(g, 'user_id', None)
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'Not found'}), 404
    data = request.get_json() or {}

    # Accept both camelCase and snake_case keys commonly used by frontend
    if 'firstName' in data:
        user.first_name = data.get('firstName')
    if 'lastName' in data:
        user.last_name = data.get('lastName')
    if 'first_name' in data:
        user.first_name = data.get('first_name')
    if 'last_name' in data:
        user.last_name = data.get('last_name')
    if 'email' in data:
        # ensure uniqueness
        existing = User.query.filter(User.email == data.get('email'), User.user_id != user.user_id).first()
        if existing:
            return jsonify({'message': 'Email already in use'}), 409
        user.email = data.get('email')

    db.session.commit()
    return jsonify({'message': 'Profile updated', 'data': user.to_dict()}), 200


# Alias to support standardized frontend route: PUT /user/profile
@users_bp.route('/profile', methods=['PUT'])
@authenticator
def update_profile_alias():
    return update_profile()


@users_bp.route('/change-password', methods=['PUT'])
@authenticator
def change_password():
    user_id = getattr(g, 'user_id', None)
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'Not found'}), 404
    data = request.get_json() or {}
    current = data.get('current_password')
    new = data.get('new_password')
    if not current or not new:
        return jsonify({'message': 'Missing passwords'}), 400
    from werkzeug.security import check_password_hash, generate_password_hash
    if not check_password_hash(user.password, current):
        return jsonify({'message': 'Current password incorrect'}), 401
    user.password = generate_password_hash(new)
    db.session.commit()
    return jsonify({'message': 'Password changed'}), 200


# Admin user management
@users_bp.route('/<int:user_id>', methods=['GET'])
@authenticator
@check_role(['admin','superadmin'])
def admin_get_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'Not found'}), 404
    return jsonify({'data': user.to_dict()}), 200


@users_bp.route('/<int:user_id>/role', methods=['PUT'])
@authenticator
@check_role(['admin','superadmin'])
def admin_set_role(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'Not found'}), 404
    data = request.get_json() or {}
    new_role = data.get('role')
    if new_role not in ('customer','admin','doctor','superadmin'):
        return jsonify({'message': 'Invalid role'}), 400

    # Only superadmin can assign or modify a superadmin account
    current = getattr(g, 'user', None)
    if new_role == 'superadmin' and (not current or current.user_type != 'superadmin'):
        return jsonify({'message': 'Forbidden to assign superadmin role'}), 403
    if user.user_type == 'superadmin' and (not current or current.user_type != 'superadmin'):
        return jsonify({'message': 'Cannot modify superadmin'}), 403

    user.user_type = new_role
    db.session.commit()
    return jsonify({'message': 'Role updated', 'data': user.to_dict()}), 200


@users_bp.route('/<int:user_id>/lock', methods=['PUT'])
@authenticator
@check_role(['admin','superadmin'])
def admin_lock_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'Not found'}), 404

    current = getattr(g, 'user', None)
    # Prevent locking self
    if current and current.user_id == user.user_id:
        return jsonify({'message': 'Cannot lock yourself'}), 400
    # Prevent non-superadmin from locking a superadmin
    if user.user_type == 'superadmin' and (not current or current.user_type != 'superadmin'):
        return jsonify({'message': 'Cannot lock superadmin'}), 403

    user.is_active = False
    db.session.commit()
    return jsonify({'message': 'User locked', 'data': user.to_dict()}), 200


@users_bp.route('/<int:user_id>/unlock', methods=['PUT'])
@authenticator
@check_role(['admin','superadmin'])
def admin_unlock_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'Not found'}), 404

    current = getattr(g, 'user', None)
    # Prevent non-superadmin from unlocking a superadmin (for safety)
    if user.user_type == 'superadmin' and (not current or current.user_type != 'superadmin'):
        return jsonify({'message': 'Cannot unlock superadmin'}), 403

    user.is_active = True
    db.session.commit()
    return jsonify({'message': 'User unlocked', 'data': user.to_dict()}), 200


@users_bp.route('/<int:user_id>', methods=['DELETE'])
@authenticator
@check_role(['admin','superadmin'])
def admin_delete_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'Not found'}), 404

    current = getattr(g, 'user', None)
    # Prevent deleting self
    if current and current.user_id == user.user_id:
        return jsonify({'message': 'Cannot delete yourself'}), 400
    # Prevent non-superadmin from deleting a superadmin
    if user.user_type == 'superadmin' and (not current or current.user_type != 'superadmin'):
        return jsonify({'message': 'Cannot delete superadmin'}), 403

    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'User deleted'}), 200


# User pets endpoints
@users_bp.route('/pets', methods=['GET'])
@authenticator
def get_my_pets():
    user_id = getattr(g, 'user_id', None)
    if not user_id:
        return jsonify({'message': 'Unauthorized'}), 401
    pets = Pet.query.filter_by(user_id=user_id).all()
    return jsonify({'data': [p.to_dict() for p in pets]}), 200


# Alias route to provide full user-scoped appointments under /user/appointments
@users_bp.route('/appointments', methods=['GET'])
@authenticator
def get_my_appointments_under_user():
    # Import inside function to avoid circular import at module load
    from .appointments import get_my_appointments as _get_my_appointments
    return _get_my_appointments()


# Alias for creating appointment under standardized user route: POST /user/appointments
@users_bp.route('/appointments', methods=['POST'])
def create_appointment_under_user():
    # Call the existing appointment handler (it is decorated with authenticator and role checks)
    from .appointments import create_appointment as _create_appointment
    return _create_appointment()


@users_bp.route('/pets', methods=['POST'])
@authenticator
def add_pet():
    user_id = getattr(g, 'user_id', None)
    if not user_id:
        return jsonify({'message': 'Unauthorized'}), 401
    data = request.get_json() or {}
    name = data.get('name')
    breed = data.get('breed')
    age = data.get('age')
    if not name:
        return jsonify({'message': 'Missing pet name'}), 400

    existing = Pet.query.filter_by(user_id=user_id, name=name).first()
    if existing:
        return jsonify({'message': 'Pet with that name already exists'}), 409

    pet = Pet(name=name, breed=breed, age=age, user_id=user_id)
    db.session.add(pet)
    db.session.commit()

    user = User.query.get(user_id)
    return jsonify({'message': 'Pet added', 'data': {'pet': pet.to_dict(), 'user': user.to_dict()}}), 201


@users_bp.route('/pets/<int:pet_id>', methods=['DELETE'])
@authenticator
def delete_pet_user(pet_id):
    """Allow a user to delete their own pet via /user/pets/<id>"""
    user_id = getattr(g, 'user_id', None)
    if not user_id:
        return jsonify({'message': 'Unauthorized'}), 401
    pet = Pet.query.get(pet_id)
    if not pet:
        return jsonify({'message': 'Not found'}), 404
    # Allow owner or admin/superadmin
    if pet.user_id != user_id:
        current = User.query.get(user_id)
        if not current or current.user_type not in ('admin','superadmin'):
            return jsonify({'message': 'Forbidden'}), 403
    db.session.delete(pet)
    db.session.commit()
    return jsonify({'message': 'Pet deleted'}), 200

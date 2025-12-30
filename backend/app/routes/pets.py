from flask import Blueprint, request, jsonify, g
from ..extensions import db
from ..middleware import authenticator, check_role

pets_bp = Blueprint('pets', __name__)

# Ensure table exists (lightweight guard for dev)
def _ensure_table():
    db.session.execute('''
        CREATE TABLE IF NOT EXISTS pets (
            pet_id SERIAL PRIMARY KEY,
            name VARCHAR(100),
            breed VARCHAR(100),
            gender VARCHAR(20),
            age INTEGER,
            weight NUMERIC(5,2),
            color VARCHAR(50),
            user_id INTEGER
        );
    ''')
    db.session.commit()


@pets_bp.route('/', methods=['POST'])
@authenticator
def create_pet():
    _ensure_table()
    data = request.get_json() or {}
    name = data.get('name')
    breed = data.get('breed')
    gender = data.get('gender')
    age = data.get('age')
    weight = data.get('weight')
    color = data.get('color')
    user_id = getattr(g, 'user_id', None)
    from ..utils.validate import require_fields
    missing = require_fields(data, ['name'])
    if not user_id or missing:
        errs = {'missing': missing} if missing else None
        return jsonify({'message': 'Missing fields', 'errors': errs}), 400
    res = db.session.execute(
        'INSERT INTO pets (name, breed, gender, age, weight, color, user_id) VALUES (%s,%s,%s,%s,%s,%s,%s) RETURNING pet_id',
        (name, breed, gender, age, weight, color, user_id)
    )
    pet_id = res.fetchone()[0]
    db.session.commit()
    return jsonify({'message': 'Pet created', 'data': {'pet_id': pet_id}}), 201


@pets_bp.route('/my', methods=['GET'])
@authenticator
def my_pets():
    _ensure_table()
    user_id = getattr(g, 'user_id', None)
    rows = db.session.execute('SELECT * FROM pets WHERE user_id = %s', (user_id,)).fetchall()
    pets = [dict(r._mapping) for r in rows]
    return jsonify({'data': pets}), 200


@pets_bp.route('/<int:pet_id>', methods=['GET'])
@authenticator
def get_pet(pet_id):
    _ensure_table()
    row = db.session.execute('SELECT * FROM pets WHERE pet_id = %s', (pet_id,)).fetchone()
    if not row:
        return jsonify({'message': 'Not found'}), 404
    pet = dict(row._mapping)
    user_id = getattr(g, 'user_id', None)
    # owner or admin
    if pet.get('user_id') != user_id:
        from ..models import User
        u = User.query.get(user_id)
        if not u or u.user_type not in ('admin','superadmin'):
            return jsonify({'message': 'Forbidden'}), 403
    return jsonify({'data': pet}), 200


@pets_bp.route('/<int:pet_id>', methods=['PUT'])
@authenticator
def update_pet(pet_id):
    _ensure_table()
    row = db.session.execute('SELECT * FROM pets WHERE pet_id = %s', (pet_id,)).fetchone()
    if not row:
        return jsonify({'message': 'Not found'}), 404
    pet = dict(row._mapping)
    user_id = getattr(g, 'user_id', None)
    if pet.get('user_id') != user_id:
        from ..models import User
        u = User.query.get(user_id)
        if not u or u.user_type not in ('admin','superadmin'):
            return jsonify({'message': 'Forbidden'}), 403
    data = request.get_json() or {}
    fields = {k: data.get(k) for k in ('name','breed','gender','age','weight','color') if k in data}
    if fields:
        set_clause = ','.join([f"{k} = %s" for k in fields.keys()])
        db.session.execute(f'UPDATE pets SET {set_clause} WHERE pet_id = %s', tuple(fields.values()) + (pet_id,))
        db.session.commit()
    row = db.session.execute('SELECT * FROM pets WHERE pet_id = %s', (pet_id,)).fetchone()
    return jsonify({'message': 'Updated', 'data': dict(row._mapping)}), 200


@pets_bp.route('/<int:pet_id>', methods=['DELETE'])
@authenticator
def delete_pet(pet_id):
    _ensure_table()
    row = db.session.execute('SELECT * FROM pets WHERE pet_id = %s', (pet_id,)).fetchone()
    if not row:
        return jsonify({'message': 'Not found'}), 404
    pet = dict(row._mapping)
    user_id = getattr(g, 'user_id', None)
    if pet.get('user_id') != user_id:
        from ..models import User
        u = User.query.get(user_id)
        if not u or u.user_type not in ('admin','superadmin'):
            return jsonify({'message': 'Forbidden'}), 403
    db.session.execute('DELETE FROM pets WHERE pet_id = %s', (pet_id,))
    db.session.commit()
    return jsonify({'message': 'Deleted'}), 200

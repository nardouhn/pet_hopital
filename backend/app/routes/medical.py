from flask import Blueprint, request, jsonify, g
from ..extensions import db
from ..middleware import authenticator, check_role

med_bp = Blueprint('medical', __name__)

def _ensure_table():
    db.session.execute('''
        CREATE TABLE IF NOT EXISTS medical_records (
            record_id SERIAL PRIMARY KEY,
            pet_id INTEGER NOT NULL,
            doctor_id INTEGER,
            note TEXT,
            created_at TIMESTAMP DEFAULT now()
        );
    ''')
    db.session.commit()


@med_bp.route('/', methods=['POST'])
@authenticator
def create_record():
    _ensure_table()
    data = request.get_json() or {}
    pet_id = data.get('pet_id')
    note = data.get('note')
    doctor_id = data.get('doctor_id')
    from ..utils.validate import require_fields
    missing = require_fields(data, ['pet_id', 'note'])
    if missing:
        return jsonify({'message': 'Missing fields', 'errors': {'missing': missing}}), 400
    res = db.session.execute('INSERT INTO medical_records (pet_id, doctor_id, note) VALUES (%s,%s,%s) RETURNING record_id', (pet_id, doctor_id, note))
    rec_id = res.fetchone()[0]
    db.session.commit()
    return jsonify({'message': 'Created', 'data': {'record_id': rec_id}}), 201


@med_bp.route('/pet/<int:pet_id>', methods=['GET'])
@authenticator
def get_by_pet(pet_id):
    _ensure_table()
    # ensure owner or admin
    user_id = getattr(g, 'user_id', None)
    pet = db.session.execute('SELECT user_id FROM pets WHERE pet_id = %s', (pet_id,)).fetchone()
    if pet and pet[0] != user_id:
        from ..models import User
        u = User.query.get(user_id)
        if not u or u.user_type not in ('admin','superadmin'):
            return jsonify({'message': 'Forbidden'}), 403
    rows = db.session.execute('SELECT * FROM medical_records WHERE pet_id = %s ORDER BY created_at DESC', (pet_id,)).fetchall()
    return jsonify({'data': [dict(r._mapping) for r in rows]}), 200


@med_bp.route('/<int:record_id>', methods=['GET'])
@authenticator
def get_record(record_id):
    _ensure_table()
    row = db.session.execute('SELECT * FROM medical_records WHERE record_id = %s', (record_id,)).fetchone()
    if not row:
        return jsonify({'message': 'Not found'}), 404
    rec = dict(row._mapping)
    # owner or admin
    pet = db.session.execute('SELECT user_id FROM pets WHERE pet_id = %s', (rec['pet_id'],)).fetchone()
    user_id = getattr(g, 'user_id', None)
    if pet and pet[0] != user_id:
        from ..models import User
        u = User.query.get(user_id)
        if not u or u.user_type not in ('admin','superadmin','doctor'):
            return jsonify({'message': 'Forbidden'}), 403
    return jsonify({'data': rec}), 200


@med_bp.route('/<int:record_id>', methods=['PUT'])
@authenticator
@check_role(['doctor','admin','superadmin'])
def update_record(record_id):
    _ensure_table()
    data = request.get_json() or {}
    note = data.get('note')
    if note is None:
        return jsonify({'message': 'Nothing to update'}), 400
    db.session.execute('UPDATE medical_records SET note = %s WHERE record_id = %s', (note, record_id))
    db.session.commit()
    row = db.session.execute('SELECT * FROM medical_records WHERE record_id = %s', (record_id,)).fetchone()
    return jsonify({'message': 'Updated', 'data': dict(row._mapping)}), 200
from flask import Blueprint, request, jsonify, g
from ..extensions import db
from ..middleware import authenticator, check_role

vax_bp = Blueprint('vaccination', __name__)

def _ensure_table():
    db.session.execute('''
        CREATE TABLE IF NOT EXISTS vaccination (
            vaccination_id SERIAL PRIMARY KEY,
            pet_id INTEGER NOT NULL,
            vaccine VARCHAR(150),
            date DATE,
            notes TEXT
        );
    ''')
    db.session.commit()


@vax_bp.route('/', methods=['POST'])
@authenticator
def create_vax():
    _ensure_table()
    data = request.get_json() or {}
    pet_id = data.get('pet_id')
    vaccine = data.get('vaccine')
    date = data.get('date')
    notes = data.get('notes')
    from ..utils.validate import require_fields
    missing = require_fields(data, ['pet_id', 'vaccine'])
    if missing:
        return jsonify({'message': 'Missing fields', 'errors': {'missing': missing}}), 400
    res = db.session.execute('INSERT INTO vaccination (pet_id, vaccine, date, notes) VALUES (%s,%s,%s,%s) RETURNING vaccination_id', (pet_id, vaccine, date, notes))
    vid = res.fetchone()[0]
    db.session.commit()
    return jsonify({'message': 'Created', 'data': {'vaccination_id': vid}}), 201


@vax_bp.route('/pet/<int:pet_id>', methods=['GET'])
@authenticator
def get_pet_vax(pet_id):
    _ensure_table()
    rows = db.session.execute('SELECT * FROM vaccination WHERE pet_id = %s ORDER BY date DESC', (pet_id,)).fetchall()
    return jsonify({'data': [dict(r._mapping) for r in rows]}), 200


@vax_bp.route('/<int:vid>', methods=['PUT'])
@authenticator
@check_role(['doctor','admin','superadmin'])
def update_vax(vid):
    _ensure_table()
    data = request.get_json() or {}
    fields = {k: data.get(k) for k in ('vaccine','date','notes') if k in data}
    if fields:
        set_clause = ','.join([f"{k} = %s" for k in fields.keys()])
        db.session.execute(f'UPDATE vaccination SET {set_clause} WHERE vaccination_id = %s', tuple(fields.values()) + (vid,))
        db.session.commit()
    row = db.session.execute('SELECT * FROM vaccination WHERE vaccination_id = %s', (vid,)).fetchone()
    return jsonify({'message': 'Updated', 'data': dict(row._mapping)}), 200
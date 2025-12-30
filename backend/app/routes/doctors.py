from flask import Blueprint, jsonify
from ..extensions import db

doctors_bp = Blueprint('doctors', __name__)

@doctors_bp.route('/', methods=['GET'])
@doctors_bp.route('', methods=['GET'])
def list_doctors():
    # Query doctor table directly (schema exists from migrations)
    try:
        res = db.session.execute('SELECT doctor_id, doctor_name, email, phone FROM doctor').fetchall()
        rows = [dict(r._mapping) for r in res]
    except Exception:
        rows = []
    return jsonify({'data': rows}), 200

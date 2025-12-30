from flask import Blueprint, jsonify
from ..extensions import db
from ..middleware import authenticator, check_role

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/statistics/appointments', methods=['GET'])
@authenticator
@check_role(['admin','superadmin'])
def stats_appointments():
    total = db.session.execute('SELECT COUNT(*) AS cnt FROM appointment').scalar() or 0
    return jsonify({'data': {'total': int(total)}}), 200


@admin_bp.route('/statistics/revenue', methods=['GET'])
@authenticator
@check_role(['admin','superadmin'])
def stats_revenue():
    # No payments table yet — return 0
    total = 0
    return jsonify({'data': {'totalRevenue': total}}), 200


@admin_bp.route('/statistics/patients', methods=['GET'])
@authenticator
@check_role(['admin','superadmin'])
def stats_patients():
    total = db.session.execute('SELECT COUNT(*) AS cnt FROM users').scalar() or 0
    return jsonify({'data': {'patientCount': int(total)}}), 200


@admin_bp.route('/statistics/services', methods=['GET'])
@authenticator
@check_role(['admin','superadmin'])
def stats_services():
    try:
        total = db.session.execute('SELECT COUNT(*) AS cnt FROM services').scalar() or 0
    except Exception:
        total = 0
    return jsonify({'data': {'count': int(total)}}), 200

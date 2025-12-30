from flask import Blueprint, request, jsonify, g
from ..extensions import db
from ..models import Feedback
from ..middleware import authenticator, check_role

fb_bp = Blueprint('feedback', __name__)

@fb_bp.route('/', methods=['POST'])
def submit_feedback():
    data = request.get_json() or {}
    message = data.get('message')
    subject = data.get('subject')
    user_id = getattr(g, 'user_id', None)
    from ..utils.validate import require_fields
    missing = require_fields(data, [])
    # no required fields, but normalize inputs
    f = Feedback(user_id=user_id, rating='5', status='Show', content=message or '', pet_name=subject or '')
    db.session.add(f)
    db.session.commit()
    return jsonify({'message': 'Feedback submitted', 'data': f.to_dict()}), 201

@fb_bp.route('/my', methods=['GET'])
@authenticator
def get_my_feedback():
    user_id = getattr(g, 'user_id', None)
    rows = Feedback.query.filter_by(user_id=user_id).order_by(Feedback.created_at.desc()).all()
    return jsonify({'data': [r.to_dict() for r in rows]}), 200

@fb_bp.route('/admin', methods=['GET'])
@authenticator
@check_role(['admin','superadmin'])
def get_all_feedback():
    rows = Feedback.query.order_by(Feedback.created_at.desc()).all()
    return jsonify({'data': [r.to_dict() for r in rows]}), 200


# Moderation endpoints (admin)
@fb_bp.route('/<int:feedback_id>/hide', methods=['PUT'])
@authenticator
@check_role(['admin','superadmin'])
def hide_feedback(feedback_id):
    f = Feedback.query.get(feedback_id)
    if not f:
        return jsonify({'message': 'Not found'}), 404
    f.status = 'Hidden'
    db.session.commit()
    return jsonify({'message': 'Feedback hidden', 'data': f.to_dict()}), 200


@fb_bp.route('/<int:feedback_id>/show', methods=['PUT'])
@authenticator
@check_role(['admin','superadmin'])
def show_feedback(feedback_id):
    f = Feedback.query.get(feedback_id)
    if not f:
        return jsonify({'message': 'Not found'}), 404
    f.status = 'Show'
    db.session.commit()
    return jsonify({'message': 'Feedback shown', 'data': f.to_dict()}), 200

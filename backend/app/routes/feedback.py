from flask import Blueprint, request, jsonify, g
from ..extensions import db
from ..models import Feedback
from ..middleware import authenticator, check_role

fb_bp = Blueprint('feedback', __name__)

@fb_bp.route('/', methods=['POST'])
def submit_feedback():
    data = request.get_json() or {}

    # Accept multiple possible field names from frontend/clients
    message = (
        data.get('message')
        or data.get('comment')
        or data.get('content')
        or data.get('feedback')
        or ''
    )

    subject = (
        data.get('subject')
        or data.get('petName')
        or data.get('pet_name')
        or data.get('pet')
        or ''
    )

    # Normalize rating to allowed enum values '1'..'5'
    raw_rating = data.get('rating')
    rating = '5'
    if raw_rating is not None:
        try:
            r = str(raw_rating).strip()
            if r in ['1', '2', '3', '4', '5']:
                rating = r
        except Exception:
            pass

    # Allow optional status override if valid
    status = data.get('status')
    if status not in ['Hidden', 'Show']:
        status = 'Show'

    user_id = getattr(g, 'user_id', None)

    # Create Feedback record (pet_name is non-nullable in DB so ensure string)
    f = Feedback(user_id=user_id, rating=rating, status=status, content=message or '', pet_name=subject or '')
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

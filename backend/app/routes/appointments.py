from flask import Blueprint, request, jsonify, g, abort
from ..models import Appointment, User, Pet, Doctor
from ..extensions import db
from ..middleware import authenticator, check_role

appt_bp = Blueprint('appointments', __name__)

@appt_bp.route('/create', methods=['POST'])
@authenticator
@check_role(['customer'])
def create_appointment():
    data = request.get_json() or {}
    # use authenticated user id
    user_id = getattr(g, 'user_id', None)
    date = data.get('date')

    from ..utils.validate import require_fields
    missing = require_fields(data, ['date'])
    if not user_id or missing:
        errs = {'missing': missing} if missing else None
        return jsonify({'message': 'Missing fields', 'errors': errs}), 400

    # Validate date format (YYYY-MM-DD)
    from datetime import date as _date
    try:
        booking_date = _date.fromisoformat(date)
    except Exception:
        return jsonify({'message': 'Invalid date format, use YYYY-MM-DD'}), 400

    # Accept pet info (either reference an existing pet by id, or create new one), and other optional booking fields
    pet_id = data.get('pet_id') or data.get('petId')
    pet_name = data.get('petName')
    pet_breed = data.get('petBreed')
    pet_age = data.get('petAge')

    doctor_id = data.get('doctor_id') or data.get('doctorId') or data.get('doctorId')
    service = data.get('service')
    description = data.get('description')
    timeslot = data.get('timeslot')
    invoice_url = data.get('invoice_url') or data.get('invoiceUrl')

    created_pet = None
    # If user supplied an existing pet_id, validate it belongs to current user
    if pet_id:
        existing_pet = Pet.query.filter_by(user_id=user_id, pet_id=pet_id).first()
        if not existing_pet:
            return jsonify({'message': 'Provided pet_id not found for current user'}), 400
    elif pet_name:
        # check if this user already has a pet with that name
        existing_pet = Pet.query.filter_by(user_id=user_id, name=pet_name).first()
        if not existing_pet:
            created_pet = Pet(name=pet_name, breed=pet_breed, age=pet_age, user_id=user_id)
            db.session.add(created_pet)

    # Prevent duplicate bookings for same user/date and timeslot (if provided)
    if timeslot:
        existing_appt = Appointment.query.filter_by(user_id=user_id, booking_date=booking_date, timeslot=timeslot).first()
    else:
        existing_appt = Appointment.query.filter_by(user_id=user_id, booking_date=booking_date).first()
    if existing_appt:
        return jsonify({'message': 'An appointment already exists for this date and timeslot'}), 409

    # Create appointment and persist optional fields
    a = Appointment(booking_date=booking_date, status='Đang chờ xác nhận', user_id=user_id)

    if pet_id:
        a.pet_id = pet_id
    elif created_pet:
        # associate via relationship before commit so SQLAlchemy assigns fk properly
        a.pet = created_pet

    if doctor_id:
        a.doctor_id = doctor_id

    if service:
        a.service = service

    if description:
        a.description = description

    if timeslot:
        a.timeslot = timeslot

    if invoice_url:
        a.invoice_url = invoice_url

    db.session.add(a)

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Could not create appointment', 'error': str(e)}), 400

    user = User.query.get(user_id)
    return jsonify({'message': 'Đã tạo lịch', 'data': {'appointment': a.to_dict(), 'created_pet': created_pet.to_dict() if created_pet else None, 'user': user.to_dict()}}), 201

@appt_bp.route('/get', methods=['GET'])
@authenticator
def get_my_appointments():
    user_id = getattr(g, 'user_id', None)
    if not user_id:
        return jsonify({'message': 'Unauthorized'}), 401
    appts = Appointment.query.filter_by(user_id=user_id).all()

    # Enrich appointments with best-effort related data (pet, doctor) so frontend can display more fields.
    enriched = []

    for a in appts:
        d = a.to_dict()
        try:
            # Ensure appointment_id present
            d.setdefault('appointment_id', a.appointment_id)

            # If a slot is associated with the appointment and the slot links to a doctor_slot -> doctor, expose doctor_name
            slot = getattr(a, 'slot', None)
            if not slot:
                # fallback: query slot table directly (in case relationship not eagerly loaded)
                from ..models import Slot
                slot = Slot.query.filter_by(appointment_id=a.appointment_id).first()
            if slot and getattr(slot, 'doctor_slot', None) and getattr(slot.doctor_slot, 'doctor', None):
                doc = slot.doctor_slot.doctor
                d['doctor_name'] = getattr(doc, 'doctor_name', None)

            # Do not inject a recent pet into every appointment (would duplicate pet name across rows).
            # If appointments have an explicit pet association in the future, include it there.

            # No service/description fields currently available in Appointment model; leave empty if not present.
        except Exception:
            # Fail gracefully; don't block returning appointments
            pass

        enriched.append(d)

    return jsonify({'data': enriched}), 200


@appt_bp.route('/getall', methods=['GET'])
@authenticator
@check_role(['admin','superadmin'])
def get_all_appointments():
    appts = Appointment.query.order_by(Appointment.created_at.desc()).all()
    return jsonify({'data': [a.to_dict() for a in appts]}), 200


# Helper to check admin role
def _is_admin(user_id):
    if not user_id:
        return False
    u = User.query.get(user_id)
    return u and getattr(u, 'user_type', None) in ('admin', 'superadmin')


@appt_bp.route('/<int:appointment_id>', methods=['GET'])
@authenticator
def get_appointment(appointment_id):
    a = Appointment.query.get(appointment_id)
    if not a:
        return jsonify({'message': 'Appointment not found'}), 404
    user_id = getattr(g, 'user_id', None)
    if user_id != a.user_id and not _is_admin(user_id):
        return jsonify({'message': 'Forbidden'}), 403
    return jsonify({'data': a.to_dict()}), 200


@appt_bp.route('/<int:appointment_id>', methods=['PUT'])
@authenticator
def update_appointment(appointment_id):
    a = Appointment.query.get(appointment_id)
    if not a:
        return jsonify({'message': 'Appointment not found'}), 404
    user_id = getattr(g, 'user_id', None)
    is_admin = _is_admin(user_id)
    if user_id != a.user_id and not is_admin:
        return jsonify({'message': 'Forbidden'}), 403

    data = request.get_json() or {}

    # Update booking_date if provided
    if 'booking_date' in data:
        from datetime import date as _date
        try:
            new_date = _date.fromisoformat(data['booking_date'])
        except Exception:
            return jsonify({'message': 'Invalid date format, use YYYY-MM-DD'}), 400
        a.booking_date = new_date

    # Prevent duplicate bookings when changing date/timeslot
    new_timeslot = data.get('timeslot') if 'timeslot' in data else a.timeslot
    lookup_date = a.booking_date
    if 'booking_date' in data:
        lookup_date = new_date

    if new_timeslot:
        dup = Appointment.query.filter(Appointment.user_id == a.user_id, Appointment.booking_date == lookup_date, Appointment.timeslot == new_timeslot, Appointment.appointment_id != a.appointment_id).first()
    else:
        dup = Appointment.query.filter(Appointment.user_id == a.user_id, Appointment.booking_date == lookup_date, Appointment.appointment_id != a.appointment_id).first()

    if dup:
        return jsonify({'message': 'Another appointment exists for this date and timeslot'}), 409

    # Status validation
    if 'status' in data:
        allowed_statuses = ('Đang chờ xác nhận', 'Đặt lịch hẹn thành công', 'Đã hủy lịch hẹn')
        if data['status'] not in allowed_statuses:
            return jsonify({'message': 'Invalid status value'}), 400
        a.status = data['status']

    # pet validation: allow setting to None (unset) or to an existing pet belonging to the current user (or any pet if admin)
    if 'pet_id' in data or 'petId' in data:
        new_pet_id = data.get('pet_id') or data.get('petId')
        if new_pet_id is None:
            a.pet_id = None
        else:
            pet = Pet.query.get(new_pet_id)
            if not pet:
                return jsonify({'message': 'Provided pet_id not found'}), 400
            if pet.user_id != a.user_id and not is_admin:
                return jsonify({'message': 'Provided pet does not belong to appointment owner'}), 403
            a.pet_id = new_pet_id

    # doctor validation
    if 'doctor_id' in data or 'doctorId' in data:
        new_doc_id = data.get('doctor_id') or data.get('doctorId')
        if new_doc_id is None:
            a.doctor_id = None
        else:
            doc = Doctor.query.get(new_doc_id)
            if not doc:
                return jsonify({'message': 'Provided doctor_id not found'}), 400
            a.doctor_id = new_doc_id

    # Simple fields
    if 'service' in data:
        a.service = data.get('service')
    if 'description' in data:
        a.description = data.get('description')
    if 'timeslot' in data:
        a.timeslot = data.get('timeslot')
    if 'invoice_url' in data or 'invoiceUrl' in data:
        a.invoice_url = data.get('invoice_url') or data.get('invoiceUrl')

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Invalid update', 'error': str(e)}), 400

    return jsonify({'message': 'Updated', 'data': {'appointment': a.to_dict()}}), 200


@appt_bp.route('/<int:appointment_id>', methods=['DELETE'])
@authenticator
def delete_appointment(appointment_id):
    a = Appointment.query.get(appointment_id)
    if not a:
        return jsonify({'message': 'Appointment not found'}), 404
    user_id = getattr(g, 'user_id', None)
    if user_id != a.user_id and not _is_admin(user_id):
        return jsonify({'message': 'Forbidden'}), 403

    db.session.delete(a)
    db.session.commit()
    return jsonify({'message': 'Deleted', 'data': None}), 200

from flask import Blueprint, jsonify
from ..extensions import db
from ..middleware import authenticator, check_role

admin_bp = Blueprint('admin', __name__)

from ..models import Service

@admin_bp.route('/statistics/appointments', methods=['GET'])
@authenticator
@check_role(['admin','superadmin'])
def stats_appointments():
    try:
        total = Appointment.query.count() or 0
    except Exception:
        total = 0
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
    try:
        total = User.query.count() or 0
    except Exception:
        total = 0
    return jsonify({'data': {'patientCount': int(total)}}), 200


@admin_bp.route('/statistics/services', methods=['GET'])
@authenticator
@check_role(['admin','superadmin'])
def stats_services():
    try:
        total = Service.query.count() or 0
    except Exception:
        total = 0
    return jsonify({'data': {'count': int(total)}}), 200


# ----------------------
# Admin resource endpoints
# ----------------------
from ..models import Doctor, Pet, Appointment, User

@admin_bp.route('/doctors', methods=['GET'])
@authenticator
@check_role(['admin','superadmin'])
def list_doctors_admin():
    """Return all doctors as JSON (no passwords)."""
    doctors = Doctor.query.order_by(Doctor.doctor_id).all()
    data = [d.to_dict() for d in doctors]
    return jsonify({'data': data}), 200


@admin_bp.route('/pets', methods=['GET'])
@authenticator
@check_role(['admin','superadmin'])
def list_pets_admin():
    """Return all pets and basic owner info."""
    pets = Pet.query.order_by(Pet.pet_id).all()
    data = []
    for p in pets:
        item = p.to_dict()
        owner = getattr(p, 'owner', None)
        if owner:
            item['owner'] = {'user_id': owner.user_id, 'first_name': owner.first_name, 'last_name': owner.last_name, 'email': owner.email}
        data.append(item)
    return jsonify({'data': data}), 200


@admin_bp.route('/appointments', methods=['GET'])
@authenticator
@check_role(['admin','superadmin'])
def list_appointments_admin():
    """Return appointments with related user/doctor/pet summaries."""
    appts = Appointment.query.order_by(Appointment.created_at.desc()).all()
    data = []
    for a in appts:
        item = a.to_dict()
        # attach basic user info
        user = getattr(a, 'user', None)
        if user:
            item['user'] = {'user_id': user.user_id, 'first_name': user.first_name, 'last_name': user.last_name, 'email': user.email}
        # attach doctor summary
        doc = getattr(a, 'doctor', None)
        if doc:
            item['doctor'] = {'doctor_id': doc.doctor_id, 'doctor_name': doc.doctor_name, 'email': getattr(doc, 'email', None)}
        # attach pet summary
        pet = getattr(a, 'pet', None)
        if pet:
            item['pet'] = pet.to_dict()
        data.append(item)
    return jsonify({'data': data}), 200


# Admin: list services (full objects) — used by the admin Services page
@admin_bp.route('/services', methods=['GET'])
@authenticator
@check_role(['admin','superadmin'])
def list_services_admin():
    try:
        services = Service.query.order_by(Service.service_id).all()
        data = [s.to_dict() for s in services]
        return jsonify({'data': data}), 200
    except Exception as e:
        # Log and return empty list on error
        print('Error fetching services:', e)
        return jsonify({'data': []}), 200


# Admin: list invoices (join to patient report/pet/owner)
from ..models import Invoice, PatientReport

@admin_bp.route('/invoices', methods=['GET'])
@authenticator
@check_role(['admin','superadmin'])
def list_invoices_admin():
    try:
        invoices = Invoice.query.order_by(Invoice.invoice_id.desc()).all()
        data = []
        for inv in invoices:
            item = inv.to_dict()
            pr = getattr(inv, 'patient_report', None)
            if pr:
                pr_obj = pr.to_dict()
                pet = getattr(pr, 'pet', None)
                if pet:
                    pr_obj['pet'] = pet.to_dict()
                    owner = getattr(pet, 'owner', None)
                    if owner:
                        pr_obj['owner'] = {'user_id': owner.user_id, 'first_name': owner.first_name, 'last_name': owner.last_name, 'email': owner.email}
                item['patient_report'] = pr_obj
            data.append(item)
        return jsonify({'data': data}), 200
    except Exception as e:
        print('Error fetching invoices:', e)
        return jsonify({'data': []}), 200


# Admin: pet hotel bookings and rooms
from ..models import PetHotel, PetHouse, InvoiceHotel

@admin_bp.route('/hotel/bookings', methods=['GET'])
@authenticator
@check_role(['admin','superadmin'])
def list_hotel_bookings_admin():
    try:
        bookings = PetHotel.query.order_by(PetHotel.check_in.desc()).all()
        data = []
        for b in bookings:
            item = b.to_dict()
            pet = getattr(b, 'pet', None)
            if pet:
                item['pet'] = pet.to_dict()
                owner = getattr(pet, 'owner', None)
                if owner:
                    item['owner'] = {'user_id': owner.user_id, 'first_name': owner.first_name, 'last_name': owner.last_name, 'email': owner.email}
            # attach invoice if exists
            inv = getattr(b, 'invoice_hotel', None)
            if inv:
                item['invoice'] = inv.to_dict()
            data.append(item)
        return jsonify({'data': data}), 200
    except Exception as e:
        print('Error fetching hotel bookings:', e)
        return jsonify({'data': []}), 200


@admin_bp.route('/hotel/rooms', methods=['GET'])
@authenticator
@check_role(['admin','superadmin'])
def list_hotel_rooms_admin():
    try:
        rooms = PetHouse.query.order_by(PetHouse.hotel_id).all()
        data = [r.to_dict() for r in rooms]
        return jsonify({'data': data}), 200
    except Exception as e:
        print('Error fetching hotel rooms:', e)
        return jsonify({'data': []}), 200

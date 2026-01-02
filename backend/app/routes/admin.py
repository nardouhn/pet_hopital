from flask import Blueprint, jsonify, request
from ..extensions import db
from ..middleware import authenticator, check_role
from .. import models
from datetime import datetime, date, timedelta
from sqlalchemy import func, or_, case, extract
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash
import os
import io
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from flask import send_file

admin_bp = Blueprint('admin', __name__)

# Helper response constructors
def ok(data, status=200):
    return jsonify({'success': True, 'data': data}), status

def ok_message(message, status=200):
    return jsonify({'success': True, 'message': message}), status

def err(message, status=500):
    return jsonify({'success': False, 'error': message}), status

admin_appointments_bp = Blueprint('admin_appointments', __name__, url_prefix='/admin/appointments')



@admin_appointments_bp.route('/stats', methods=['GET'])
@authenticator
@check_role(['admin', 'superadmin'])
def appointments_stats():
    """Tổng số lịch hẹn hôm nay theo từng status"""
    try:
        today = date.today()
        counts = models.db.session.query(
            models.Appointment.status,
            func.count(models.Appointment.appointment_id)
        ).filter(models.Appointment.booking_date == today
        ).group_by(models.Appointment.status).all()

        # map status → count
        status_map = {status: count for status, count in counts}
        total_today = sum(status_map.values())
        pending_today = status_map.get('Đang chờ xác nhận', 0)
        confirmed_today = status_map.get('Đặt lịch hẹn thành công', 0)
        canceled_today = status_map.get('Đã hủy lịch hẹn', 0)

    except Exception as e:
        print('Error fetching appointment stats:', e)
        total_today = pending_today = confirmed_today = canceled_today = 0

    return ok({
        'date': today.isoformat(),
        'totalToday': int(total_today),
        'pendingToday': int(pending_today),
        'confirmedToday': int(confirmed_today),
        'canceledToday': int(canceled_today)
    })

# -------------------------------------------------
# GET: Danh sách appointment với filter & search
# -------------------------------------------------
@admin_appointments_bp.route('', methods=['GET'])
@authenticator
@check_role(['admin', 'superadmin'])
def list_appointments():
    """Danh sách appointment, filter theo booking_date, status, tìm kiếm user"""
    booking_date_str = request.args.get('booking_date')
    status = request.args.get('status')
    search = request.args.get('search')  # first_name, last_name, email

    try:
        query = models.db.session.query(models.Appointment, models.User).join(
            models.User, models.Appointment.user_id == models.User.user_id
        )

        # filter theo booking_date
        if booking_date_str:
            try:
                booking_date_dt = datetime.fromisoformat(booking_date_str).date()
                query = query.filter(models.Appointment.booking_date == booking_date_dt)
            except ValueError:
                return jsonify({'error': 'Invalid booking_date format, use YYYY-MM-DD'}), 400
        else:
            query = query.filter(models.Appointment.booking_date == date.today())

        # filter theo status
        if status:
            query = query.filter(models.Appointment.status == status)

        # search theo user
        if search:
            search_term = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    models.User.first_name.ilike(search_term),
                    models.User.last_name.ilike(search_term),
                    (models.User.first_name + ' ' + models.User.last_name).ilike(search_term),
                    models.User.email.ilike(search_term)
                )
            )

        # include related slot/pet/doctor where available via relationships
        appointments = query.order_by(models.Appointment.created_at.desc()).all()

        data = []
        for appt, user in appointments:
            # related objects via ORM relationships
            pet_name = None
            try:
                pet_name = getattr(appt.pet, 'name', None)
            except Exception:
                pet_name = None

            doctor_name = None
            try:
                doctor_name = getattr(appt.doctor, 'doctor_name', None)
            except Exception:
                doctor_name = None

            slot = getattr(appt, 'slot', None)

            data.append({
                'appointment_id': appt.appointment_id,
                'slot_id': getattr(slot, 'slot_id', None),
                'check_in': slot.check_in.isoformat() if slot and slot.check_in else None,
                'check_out': slot.check_out.isoformat() if slot and slot.check_out else None,
                'user_name': f"{user.first_name} {user.last_name}",
                'email': user.email,
                'status': appt.status,
                'booking_date': appt.booking_date.isoformat() if appt.booking_date else None,
                'created_at': appt.created_at.isoformat() if appt.created_at else None,
                'pet_name': pet_name,
                'doctor_name': doctor_name,
                'service': appt.service
            })

        return ok(data)

    except Exception as e:
        print('Error fetching appointments:', e)
        return ok([])

# -------------------------------------------------
# POST: Thêm slot cho 1 appointment
# -------------------------------------------------
@admin_appointments_bp.route('/<int:appointment_id>/slot', methods=['POST'])
@authenticator
@check_role(['admin', 'superadmin'])
def add_slot_to_appointment(appointment_id):
    """
    Thêm slot cho 1 appointment.
    Chỉ cần truyền check_in, trigger tự chọn doctor_slot và set status.

    Payload JSON:
    {
        "check_in": "YYYY-MM-DDTHH:MM:SS"
    }
    """
    try:
        data = request.get_json() or {}
        check_in_str = data.get('check_in')
        if not check_in_str:
            return jsonify({'error': 'check_in is required'}), 400

        # parse datetime
        try:
            check_in_dt = datetime.fromisoformat(check_in_str)
        except ValueError:
            return jsonify({'error': 'check_in format invalid, use ISO format'}), 400

        # kiểm tra appointment tồn tại
        appointment = models.Appointment.query.get(appointment_id)
        if not appointment:
            return jsonify({'error': f'Appointment {appointment_id} not found'}), 404

        # tạo slot mới (trigger tự gán doctor_slot và status)
        new_slot = models.Slot(
            check_in=check_in_dt,
            appointment_id=appointment_id
        )
        models.db.session.add(new_slot)
        models.db.session.commit()

        # kiểm tra nếu trigger hủy appointment
        if appointment.status == 'Đã hủy lịch hẹn':
            return jsonify({'message': 'No available doctor slot, appointment canceled by trigger'}), 200

        return jsonify({
            'message': f'Slot added for appointment {appointment_id}',
            'slot_id': new_slot.slot_id
        }), 201

    except Exception as e:
        print('Error adding slot:', e)
        models.db.session.rollback()
        return jsonify({'error': 'Failed to add slot'}), 500


admin_doctors_bp = Blueprint(
    'admin_doctors',
    __name__,
    url_prefix='/admin/doctors'
)

# -------------------------------------------------
# GET: Danh sách doctor + trạng thái hiện tại
# -------------------------------------------------
@admin_doctors_bp.route('', methods=['GET'])
@authenticator
@check_role(['admin', 'superadmin'])
def list_doctors():
    """
    Admin: Danh sách bác sĩ + trạng thái hiện tại
    (status slot cuối cùng trong ngày hôm nay)
    """
    try:
        today = date.today()
        doctors = models.Doctor.query.all()

        data = []

        for doctor in doctors:
            # Slot mới nhất hôm nay của doctor
            latest_slot = (
                models.db.session.query(models.Slot)
                .join(models.DoctorSlot)
                .filter(
                    models.DoctorSlot.doctor_id == doctor.doctor_id,
                    models.DoctorSlot.slot_date == today
                )
                .order_by(models.Slot.check_in.desc())
                .first()
            )

            data.append({
                'doctor_id': doctor.doctor_id,
                'doctor_name': doctor.doctor_name,
                'email': doctor.email,
                'current_status': (
                    latest_slot.status if latest_slot else 'NONE'
                )
            })

        return ok(data)

    except Exception as e:
        print('Error listing doctors:', e)
        return ok([])


# -------------------------------------------------
# POST: Thêm bác sĩ
# -------------------------------------------------
@admin_doctors_bp.route('', methods=['POST'])
@authenticator
@check_role(['admin', 'superadmin'])
def create_doctor():
    """
    Admin: Thêm bác sĩ
    """
    data = request.get_json() or {}

    doctor_name = data.get('doctor_name')
    email = data.get('email')
    password = data.get('password')

    if not doctor_name or not email or not password:
        return jsonify({'message': 'Missing required fields'}), 400

    try:
        doctor = models.Doctor(
            doctor_name=doctor_name,
            email=email,
            password=password  # giả định đã hash ở tầng khác
        )

        models.db.session.add(doctor)
        models.db.session.commit()

        return ok_message('Doctor created successfully', 201)

    except Exception as e:
        print('Error creating doctor:', e)
        models.db.session.rollback()
        return jsonify({
            'message': 'Failed to create doctor'
        }), 500


# -------------------------------------------------
# DELETE: Xóa bác sĩ
# -------------------------------------------------
@admin_doctors_bp.route('/<int:doctor_id>', methods=['DELETE'])
@authenticator
@check_role(['admin', 'superadmin'])
def delete_doctor(doctor_id):
    """
    Admin: Xóa bác sĩ (hard delete)
    """
    try:
        doctor = models.Doctor.query.get(doctor_id)

        if not doctor:
            return jsonify({'message': 'Doctor not found'}), 404

        models.db.session.delete(doctor)
        models.db.session.commit()

        return ok_message('Doctor deleted successfully')

    except Exception as e:
        print('Error deleting doctor:', e)
        models.db.session.rollback()
        return jsonify({
            'message': 'Failed to delete doctor'
        }), 500


# -------------------------------------------------
# GET: Lịch làm việc 7 ngày (hôm nay + 6 ngày)
# -------------------------------------------------
@admin_doctors_bp.route('/schedule', methods=['GET'])
@authenticator
@check_role(['admin', 'superadmin'])
def doctors_schedule():
    """
    Admin: Lịch làm việc của tất cả bác sĩ
    (từ hôm nay đến 6 ngày tới)
    """
    try:
        start_date = date.today()
        end_date = start_date + timedelta(days=6)

        slots = (
            models.db.session.query(models.DoctorSlot, models.Doctor)
            .join(models.Doctor)
            .filter(
                models.DoctorSlot.slot_date.between(start_date, end_date)
            )
            .order_by(
                models.DoctorSlot.slot_date.asc(),
                models.Doctor.doctor_name.asc()
            )
            .all()
        )

        data = []

        for ds, doctor in slots:
            data.append({
                'doctor_name': doctor.doctor_name,
                'slot_date': ds.slot_date.isoformat(),
                'shift': ds.shift
            })

        return ok(data)

    except Exception as e:
        print('Error fetching doctors schedule:', e)
        return ok([])



admin_feedback_bp = Blueprint(
    'admin_feedback',
    __name__,
    url_prefix='/admin/feedback'
)

# -------------------------------------------------
# GET: Tổng quan feedback
# -------------------------------------------------
@admin_feedback_bp.route('/stats', methods=['GET'])
@authenticator
@check_role(['admin', 'superadmin'])
def feedback_stats():
    """
    - Tổng số feedback
    - Rating 4-5
    - Rating 1-2-3
    - Mức độ hài lòng (%)
    - 3 feedback gần nhất
    """
    try:
        total_feedback = models.db.session.query(
            func.count(models.Feedback.feedback_id)
        ).scalar() or 0

        rating_high = models.db.session.query(
            func.count(models.Feedback.feedback_id)
        ).filter(
            models.Feedback.rating.in_(['4', '5'])
        ).scalar() or 0

        rating_low = models.db.session.query(
            func.count(models.Feedback.feedback_id)
        ).filter(
            models.Feedback.rating.in_(['1', '2', '3'])
        ).scalar() or 0

        rating_sum = models.db.session.query(
            func.coalesce(func.sum(func.cast(func.cast(models.Feedback.rating, db.Text), db.Integer)), 0)
        ).scalar() or 0

        satisfaction = (
            rating_sum * 100 / (total_feedback * 5)
            if total_feedback > 0 else 0
        )

        recent_feedbacks = models.db.session.query(
            models.Feedback,
            models.User
        ).outerjoin(
            models.User,
            models.Feedback.user_id == models.User.user_id
        ).order_by(
            models.Feedback.created_at.desc()
        ).limit(3).all()

        recent_data = []
        for fb, user in recent_feedbacks:
            recent_data.append({
                'feedback_id': fb.feedback_id,
                'user_name': f"{user.first_name} {user.last_name}" if user else None,
                'pet_name': fb.pet_name,
                'rating': fb.rating,
                'content': fb.content,
                'status': fb.status,
                'created_at': fb.created_at.isoformat()
            })

        return ok({
            'totalFeedback': total_feedback,
            'ratingHigh': rating_high,
            'ratingLow': rating_low,
            'satisfaction': round(satisfaction, 2),
            'recentFeedbacks': recent_data
        })

    except Exception as e:
        print('Error fetching feedback stats:', e)
        return ok({})


# -------------------------------------------------
# GET: Danh sách toàn bộ feedback
# -------------------------------------------------
@admin_feedback_bp.route('', methods=['GET'])
@authenticator
@check_role(['admin', 'superadmin'])
def list_feedback():
    """
    Danh sách feedback:
    - user_name
    - pet_name
    - rating
    - content
    - status
    - created_at
    """
    try:
        feedbacks = models.db.session.query(
            models.Feedback,
            models.User
        ).outerjoin(
            models.User,
            models.Feedback.user_id == models.User.user_id
        ).order_by(
            models.Feedback.created_at.desc()
        ).all()

        data = []
        for fb, user in feedbacks:
            data.append({
                'feedback_id': fb.feedback_id,
                'user_name': f"{user.first_name} {user.last_name}" if user else None,
                'email': user.email if user else None,
                'pet_name': fb.pet_name,
                'rating': fb.rating,
                'content': fb.content,
                'status': fb.status,
                'created_at': fb.created_at.isoformat()
            })

        return ok(data)

    except Exception as e:
        print('Error fetching feedback list:', e)
        return ok([])


# -------------------------------------------------
# PATCH: Toggle trạng thái feedback (Hidden / Show)
# -------------------------------------------------
@admin_feedback_bp.route('/<int:feedback_id>/status', methods=['PATCH'])
@authenticator
@check_role(['admin', 'superadmin'])
def update_feedback_status(feedback_id):
    """
    Payload:
    {
        "status": "Hidden" | "Show"
    }
    """
    try:
        data = request.get_json() or {}
        status = data.get('status')

        if status not in ['Hidden', 'Show']:
            return jsonify({'error': 'Invalid status'}), 400

        feedback = models.Feedback.query.get(feedback_id)
        if not feedback:
            return jsonify({'error': 'Feedback not found'}), 404

        feedback.status = status
        models.db.session.commit()

        return jsonify({
            'message': 'Feedback status updated',
            'feedback_id': feedback_id,
            'status': status
        }), 200

    except Exception as e:
        print('Error updating feedback status:', e)
        models.db.session.rollback()
        return jsonify({'error': 'Failed to update status'}), 500

admin_invoices_bp = Blueprint(
    'admin_invoices',
    __name__,
    url_prefix='/admin/invoices'
)

# -------------------------------------------------
# GET /stats: Tổng số lượng hóa đơn và tổng tổng tiền
# -------------------------------------------------
@admin_invoices_bp.route('/stats', methods=['GET'])
@authenticator
@check_role(['admin', 'superadmin'])
def invoices_stats():
    try:
        total_count, total_sum = models.db.session.query(
            func.count(models.Invoice.invoice_id),
            func.coalesce(func.sum(models.Invoice.total), 0)
        ).one()

        return ok({
            'totalCount': total_count,
            'totalSum': float(total_sum)
        })
    except Exception as e:
        print('Error fetching invoice stats:', e)
        return ok({'totalCount': 0, 'totalSum': 0})

# -------------------------------------------------
# GET / : Danh sách hóa đơn với filter date & user/email
# -------------------------------------------------
@admin_invoices_bp.route('', methods=['GET'])
@authenticator
@check_role(['admin', 'superadmin'])
def list_invoices():
    date_str = request.args.get('date')
    user_search = request.args.get('user')

    try:
        query = models.db.session.query(
            models.Invoice,
            models.PatientReport,
            models.User,
            models.Pet,
            models.Slot
        ).join(
            models.PatientReport, models.Invoice.report_id == models.PatientReport.report_id
        ).join(
            models.Slot, models.PatientReport.slot_id == models.Slot.slot_id
        ).join(
            models.Pet, models.PatientReport.pet_id == models.Pet.pet_id
        ).join(
            models.User, models.Pet.user_id == models.User.user_id
        )

        # filter theo date (theo check_out của slot)
        if date_str:
            try:
                date_dt = datetime.fromisoformat(date_str).date()
                query = query.filter(func.date(models.Slot.check_out) == date_dt)
            except ValueError:
                return jsonify({'error': 'Invalid date format, use YYYY-MM-DD'}), 400

        # filter theo user/email
        if user_search:
            search_term = f"%{user_search.strip()}%"
            query = query.filter(
                or_(
                    models.User.first_name.ilike(search_term),
                    models.User.last_name.ilike(search_term),
                    (models.User.first_name + ' ' + models.User.last_name).ilike(search_term),
                    models.User.email.ilike(search_term)
                )
            )

        invoices = query.order_by(models.Slot.check_out.desc()).all()

        data = [{
            'invoice_id': inv.invoice_id,
            'pet_name': pet.name,
            'user_name': f"{user.first_name} {user.last_name}",
            'total': float(inv.total),
            'check_out': slot.check_out.isoformat() if slot.check_out else None
        } for inv, report, user, pet, slot in invoices]

        return ok(data)

    except Exception as e:
        print('Error fetching invoices:', e)
        return ok([])

# -------------------------------------------------
# GET /details/<invoice_id> : Chi tiết từng hóa đơn
# -------------------------------------------------
@admin_invoices_bp.route('/details/<int:invoice_id>', methods=['GET'])
@authenticator
@check_role(['admin', 'superadmin'])
def invoice_details(invoice_id):
    try:
        invoice = models.Invoice.query.get(invoice_id)
        if not invoice:
            return jsonify({'error': 'Invoice not found'}), 404

        report = models.PatientReport.query.get(invoice.report_id)
        slot = models.Slot.query.get(report.slot_id)
        pet = models.Pet.query.get(report.pet_id)
        user = models.User.query.get(pet.user_id)

        # services
        services = models.db.session.query(
            models.Service.name, models.Service.price
        ).join(
            models.ReportService, models.ReportService.service_id == models.Service.service_id
        ).filter(
            models.ReportService.report_id == report.report_id
        ).all()
        services_list = [{'name': s.name, 'price': float(s.price)} for s in services]

        # medicines
        medicines = models.db.session.query(
            models.Medicine.name, models.Medicine.price, models.ReportMedicine.quantity
        ).join(
            models.ReportMedicine, models.ReportMedicine.medicine_id == models.Medicine.medicine_id
        ).filter(
            models.ReportMedicine.report_id == report.report_id
        ).all()
        medicines_list = [{'name': m.name, 'price': float(m.price), 'quantity': m.quantity} for m in medicines]

        data = {
            'invoice_id': invoice.invoice_id,
            'user_name': f"{user.first_name} {user.last_name}",
            'pet_name': pet.name,
            'total': float(invoice.total),
            'services': services_list,
            'medicines': medicines_list
        }

        return ok(data)

    except Exception as e:
        print('Error fetching invoice details:', e)
        return err('Failed to fetch invoice details')

# -------------------------------------------------
# GET /download_pdf/<invoice_id> : Xuất PDF hóa đơn
# -------------------------------------------------
@admin_invoices_bp.route('/download_pdf/<int:invoice_id>', methods=['GET'])
@authenticator
@check_role(['admin', 'superadmin'])
def download_invoice_pdf(invoice_id):
    try:
        # Lấy chi tiết hóa đơn
        resp = invoice_details(invoice_id)
        if resp[1] != 200:
            return resp
        data = resp[0].json['data']

        buffer = io.BytesIO()
        c = canvas.Canvas(buffer, pagesize=A4)
        width, height = A4
        y = height - 40

        c.setFont("Helvetica-Bold", 16)
        c.drawString(40, y, f"Invoice ID: {data['invoice_id']}")
        y -= 30
        c.setFont("Helvetica", 12)
        c.drawString(40, y, f"User: {data['user_name']}")
        y -= 20
        c.drawString(40, y, f"Pet: {data['pet_name']}")
        y -= 20
        c.drawString(40, y, f"Total: {data['total']}")
        y -= 30

        if data['services']:
            c.drawString(40, y, "Services:")
            y -= 20
            for s in data['services']:
                c.drawString(50, y, f"{s['name']} - {s['price']}")
                y -= 15
            y -= 10

        if data['medicines']:
            c.drawString(40, y, "Medicines:")
            y -= 20
            for m in data['medicines']:
                c.drawString(50, y, f"{m['name']} - {m['price']} x{m['quantity']}")
                y -= 15

        c.showPage()
        c.save()
        buffer.seek(0)

        return send_file(buffer, as_attachment=True,
                         download_name=f"invoice_{invoice_id}.pdf",
                         mimetype='application/pdf')

    except Exception as e:
        print("Error generating invoice PDF:", e)
        return jsonify({'error': 'Failed to generate PDF'}), 500


admin_overview_bp = Blueprint(
    'admin_overview',
    __name__,
    url_prefix='/admin/overview'
)


@admin_overview_bp.route('/total-pets', methods=['GET'])
@authenticator
@check_role(['admin', 'superadmin'])
def total_pets():
    """Tổng số thú cưng trong hệ thống"""
    try:
        total = models.Pet.query.count() or 0
    except Exception as e:
        print('Error counting pets:', e)
        total = 0

    return ok({'totalPets': int(total)})


@admin_overview_bp.route('/total-users', methods=['GET'])
@authenticator
@check_role(['admin', 'superadmin'])
def total_users():
    """Tổng số người dùng trong hệ thống"""
    try:
        total = models.User.query.count() or 0
    except Exception as e:
        print('Error counting users:', e)
        total = 0

    return ok({'totalUsers': int(total)})


@admin_overview_bp.route('/appointments-today', methods=['GET'])
@authenticator
@check_role(['admin', 'superadmin'])
def appointments_today():
    """Tổng số lịch hẹn hôm nay có trạng thái 'Đặt lịch hẹn thành công'"""
    try:
        today = date.today()
        total = models.Appointment.query.filter(
            models.Appointment.booking_date == today,
            models.Appointment.status == 'Đặt lịch hẹn thành công'
        ).count() or 0
    except Exception as e:
        print('Error counting today appointments:', e)
        total = 0

    return ok({
        'date': today.isoformat(),
        'totalAppointmentsToday': int(total)
    })

admin_users_bp = Blueprint(
    'admin_users',
    __name__,
    url_prefix='/admin/users'
)

@admin_overview_bp.route('/total-revenue', methods=['GET'])
@authenticator
@check_role(['admin', 'superadmin'])
def total_revenue():
    """Tổng doanh thu (khám bệnh + pet hotel)"""
    try:
        medical_revenue = models.db.session.query(
            func.coalesce(func.sum(models.Invoice.total), 0)
        ).scalar() or 0

        hotel_revenue = models.db.session.query(
            func.coalesce(func.sum(models.InvoiceHotel.total), 0)
        ).scalar() or 0

        total = medical_revenue + hotel_revenue

    except Exception as e:
        print('Error calculating total revenue:', e)
        medical_revenue = hotel_revenue = total = 0

    return ok({
        'medicalRevenue': int(medical_revenue),
        'hotelRevenue': int(hotel_revenue),
        'totalRevenue': int(total)
    })


@admin_overview_bp.route('/today-recent-slots', methods=['GET'])
@authenticator
@check_role(['admin', 'superadmin'])
def today_recent_slots():
    """5 slot hôm nay có check_in sớm nhất"""
    try:
        today = date.today()

        slots_query = (
            models.db.session.query(models.Slot)
            .filter(func.date(models.Slot.check_in) == today)
            .order_by(models.Slot.check_in.asc())
        )

        # fetch up to 5 recent slots for display, but also compute totals
        slots = slots_query.limit(5).all()

        data = []

        for slot in slots:
            appt = slot.appointment
            report = slot.patient_report

            # Try to get doctor from slot.doctor_slot -> doctor, fallback to appointment.doctor
            doctor_name = None
            try:
                doctor_name = (
                    slot.doctor_slot.doctor.doctor_name
                    if slot.doctor_slot and slot.doctor_slot.doctor else None
                )
            except Exception:
                doctor_name = None

            if not doctor_name and appt and getattr(appt, 'doctor', None):
                doctor_name = getattr(appt.doctor, 'doctor_name', None)

            data.append({
                'slot_id': slot.slot_id,
                'appointment_id': slot.appointment_id,
                'check_in': slot.check_in.isoformat(),
                'status': slot.status,
                'user_name': (
                    f"{appt.user.first_name} {appt.user.last_name}"
                    if appt and appt.user else None
                ),
                'pet_name': (
                    report.pet.name
                    if report and report.pet else None
                ),
                'doctor_name': doctor_name,
                'services': [
                    rs.service.name
                    for rs in getattr(report, 'report_services', [])
                    if rs.service
                ] if report else []
            })

        # total slots today
        try:
            total_slots = models.db.session.query(func.count(models.Slot.slot_id)).filter(func.date(models.Slot.check_in) == today).scalar() or 0
        except Exception:
            total_slots = 0

        # distinct new pets via patient_report -> pet_id for today's slots
        try:
            total_new_pets = models.db.session.query(func.count(func.distinct(models.PatientReport.pet_id))).join(
                models.Slot, models.PatientReport.slot_id == models.Slot.slot_id
            ).filter(func.date(models.Slot.check_in) == today).scalar() or 0
        except Exception:
            total_new_pets = 0

        return ok({
            'rows': data,
            'total_slots': int(total_slots),
            'new_pets': int(total_new_pets)
        })

    except Exception as e:
        print('Error fetching today recent slots:', e)
        return ok([])


@admin_overview_bp.route('/pet-hotel-occupancy', methods=['GET'])
@authenticator
@check_role(['admin', 'superadmin'])
def pet_hotel_occupancy():
    """Số pet đang ở khách sạn / tổng lượt"""
    try:
        total = models.db.session.query(
            func.count(models.PetHotel.petboard_id)
        ).scalar() or 0

        current = models.db.session.query(
            func.count(models.PetHotel.petboard_id)
        ).filter(
            models.PetHotel.check_out.is_(None)
        ).scalar() or 0

    except Exception as e:
        print('Error calculating pet hotel occupancy:', e)
        total = current = 0

    return ok({
        'current': int(current),
        'total': int(total),
        'ratio': f"{int(current)}/{int(total)}"
    })



admin_reports_bp = Blueprint(
    'admin_reports',
    __name__,
    url_prefix='/admin/patient_reports'
)

# -------------------------------------------------
# GET /stats: Tổng quan hồ sơ bệnh án
# -------------------------------------------------
@admin_reports_bp.route('/stats', methods=['GET'])
@authenticator
@check_role(['admin', 'superadmin'])
def reports_stats():
    try:
        total_reports = db.session.query(func.count(models.PatientReport.report_id)).scalar() or 0
        finished_reports = db.session.query(func.count(models.PatientReport.report_id)).filter(
            models.PatientReport.status == 'Đã khám xong'
        ).scalar() or 0

        return ok({
            'totalReports': total_reports,
            'finishedReports': finished_reports
        })
    except Exception as e:
        print("Error fetching report stats:", e)
        return ok({'totalReports': 0, 'finishedReports': 0})

# -------------------------------------------------
# GET /recent: 3 hồ sơ gần nhất hôm nay
# -------------------------------------------------
@admin_reports_bp.route('/recent', methods=['GET'])
@authenticator
@check_role(['admin', 'superadmin'])
def recent_reports():
    try:
        today = date.today()
        query = db.session.query(
            models.PatientReport,
            models.Slot,
            models.Pet,
            models.User,
            models.DoctorSlot,
            models.Doctor
        ).join(models.Slot, models.PatientReport.slot_id == models.Slot.slot_id
        ).join(models.Pet, models.PatientReport.pet_id == models.Pet.pet_id
        ).join(models.User, models.Pet.user_id == models.User.user_id
        ).join(models.DoctorSlot, models.Slot.doctor_slot_id == models.DoctorSlot.doctor_slot_id
        ).join(models.Doctor, models.DoctorSlot.doctor_id == models.Doctor.doctor_id
        ).filter(func.date(models.Slot.check_in) == today
        ).order_by(models.Slot.check_in.desc()
        ).limit(3).all()

        data = []
        for report, slot, pet, user, doctor_slot, doctor in query:
            # Lấy list service
            services = db.session.query(models.Service.name).join(
                models.report_service, models.Service.service_id == models.report_service.service_id
            ).filter(models.report_service.report_id == report.report_id).all()
            service_list = [s[0] for s in services]

            data.append({
                'report_id': report.report_id,
                'pet_name': pet.name,
                'user_name': f"{user.first_name} {user.last_name}",
                'doctor_name': doctor.doctor_name,
                'services': service_list,
                'check_out': slot.check_out.isoformat() if slot.check_out else None
            })

        return ok(data)

    except Exception as e:
        print("Error fetching recent reports:", e)
        return ok([])

# -------------------------------------------------
# GET /list: Danh sách patient_report chi tiết
# -------------------------------------------------
@admin_reports_bp.route('/list', methods=['GET'])
@authenticator
@check_role(['admin', 'superadmin'])
def list_reports():
    try:
        query = db.session.query(
            models.PatientReport,
            models.Slot,
            models.Pet,
            models.User,
            models.DoctorSlot,
            models.Doctor
        ).join(models.Slot, models.PatientReport.slot_id == models.Slot.slot_id
        ).join(models.Pet, models.PatientReport.pet_id == models.Pet.pet_id
        ).join(models.User, models.Pet.user_id == models.User.user_id
        ).join(models.DoctorSlot, models.Slot.doctor_slot_id == models.DoctorSlot.doctor_slot_id
        ).join(models.Doctor, models.DoctorSlot.doctor_id == models.Doctor.doctor_id
        ).order_by(models.Slot.check_in.asc()
        ).all()

        data = []
        for report, slot, pet, user, doctor_slot, doctor in query:
            # services
            services = db.session.query(models.Service.name).join(
                models.ReportService, models.Service.service_id == models.ReportService.service_id
            ).filter(models.ReportService.report_id == report.report_id).all()
            service_list = [s[0] for s in services]

            # medicines
            medicines = db.session.query(models.Medicine.name, models.ReportMedicine.quantity).join(
                models.ReportMedicine, models.Medicine.medicine_id == models.ReportMedicine.medicine_id
            ).filter(models.ReportMedicine.report_id == report.report_id).all()
            medicine_list = [{'name': m[0], 'quantity': m[1]} for m in medicines]

            # symptoms
            symptoms = db.session.query(models.Symptom.name).join(
                models.ReportSymptom, models.Symptom.symptom_id == models.ReportSymptom.symptom_id
            ).filter(models.ReportSymptom.report_id == report.report_id).all()
            symptom_list = [s[0] for s in symptoms]

            # diseases
            diseases = db.session.query(models.Disease.disease_name).join(
                models.ReportDiagnose, models.Disease.diagnose_id == models.ReportDiagnose.diagnose_id
            ).filter(models.ReportDiagnose.report_id == report.report_id).all()
            disease_list = [d[0] for d in diseases]

            # images
            images = db.session.query(models.MedicalImage).filter(
                models.MedicalImage.report_id == report.report_id
            ).all()
            image_list = [{'image_id': img.image_id, 'image_type': img.image_type, 'image_url': img.image_url} for img in images]

            data.append({
                'report_id': report.report_id,
                'status': report.status,
                'pet': {
                    'pet_id': pet.pet_id,
                    'name': pet.name,
                    'breed': pet.breed,
                    'age': pet.age
                },
                'user': {
                    'user_id': user.user_id,
                    'user_name': f"{user.first_name} {user.last_name}"
                },
                'doctor_name': doctor.doctor_name,
                'services': service_list,
                'medicines': medicine_list,
                'symptoms': symptom_list,
                'diseases': disease_list,
                'images': image_list
            })

        return ok(data)

    except Exception as e:
        print("Error fetching patient reports:", e)
        return ok([])

# -------------------------------------------------
# POST /upload_image/<report_id>: Upload ảnh cho report
# -------------------------------------------------
@admin_reports_bp.route('/upload_image/<int:report_id>', methods=['POST'])
@authenticator
@check_role(['admin', 'superadmin'])
def upload_image(report_id):
    try:
        report = models.PatientReport.query.get(report_id)
        if not report:
            return jsonify({'error': f'Patient report {report_id} not found'}), 404

        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400

        file = request.files['image']
        filename = secure_filename(file.filename)
        upload_folder = 'uploads/patient_reports'
        os.makedirs(upload_folder, exist_ok=True)
        file_path = os.path.join(upload_folder, filename)
        file.save(file_path)

        new_image = models.MedicalImage(
            image_type=request.form.get('image_type', 'unknown'),
            image_url=file_path,
            captured_date=datetime.now(),
            report_id=report_id
        )
        db.session.add(new_image)
        db.session.commit()

        return ok({'image_id': new_image.image_id}, 201)

    except Exception as e:
        print("Error uploading image:", e)
        db.session.rollback()
        return err('Failed to upload image', 500)

# -------------------------------------------------
# GET /download_report/<report_id>: Xuất report JSON
# -------------------------------------------------
@admin_reports_bp.route('/download_report/<int:report_id>', methods=['GET'])
@authenticator
@check_role(['admin', 'superadmin'])
def download_report(report_id):
    try:
        report = models.PatientReport.query.get(report_id)
        if not report:
            return jsonify({'error': f'Report {report_id} not found'}), 404

        slot = models.Slot.query.get(report.slot_id)
        pet = models.Pet.query.get(report.pet_id)
        user = models.User.query.get(pet.user_id)
        doctor_slot = models.DoctorSlot.query.get(slot.doctor_slot_id)
        doctor = models.Doctor.query.get(doctor_slot.doctor_id)

        # services
        services = db.session.query(models.Service.name).join(
            models.report_service, models.Service.service_id == models.report_service.service_id
        ).filter(models.report_service.report_id == report.report_id).all()
        service_list = [s[0] for s in services]

        # medicines
        medicines = db.session.query(models.Medicine.name, models.ReportMedicine.quantity).join(
            models.ReportMedicine, models.Medicine.medicine_id == models.ReportMedicine.medicine_id
        ).filter(models.ReportMedicine.report_id == report.report_id).all()
        medicine_list = [{'name': m[0], 'quantity': m[1]} for m in medicines]

        # symptoms
        symptoms = db.session.query(models.Symptom.name).join(
            models.ReportSymptom, models.Symptom.symptom_id == models.ReportSymptom.symptom_id
        ).filter(models.ReportSymptom.report_id == report.report_id).all()
        symptom_list = [s[0] for s in symptoms]

        # diseases
        diseases = db.session.query(models.Disease.disease_name).join(
            models.ReportDiagnose, models.Disease.diagnose_id == models.ReportDiagnose.diagnose_id
        ).filter(models.ReportDiagnose.report_id == report.report_id).all()
        disease_list = [d[0] for d in diseases]

        # images
        images = models.MedicalImage.query.filter_by(report_id=report.report_id).all()
        image_list = [{'image_id': img.image_id, 'image_type': img.image_type, 'image_url': img.image_url} for img in images]

        data = {
            'report_id': report.report_id,
            'status': report.status,
            'pet': {
                'pet_id': pet.pet_id,
                'name': pet.name,
                'breed': pet.breed,
                'age': pet.age
            },
            'user': {
                'user_id': user.user_id,
                'user_name': f"{user.first_name} {user.last_name}"
            },
            'doctor_name': doctor.doctor_name,
            'services': service_list,
            'medicines': medicine_list,
            'symptoms': symptom_list,
            'diseases': disease_list,
            'images': image_list,
            'check_in': slot.check_in.isoformat(),
            'check_out': slot.check_out.isoformat() if slot.check_out else None
        }

        return ok(data)

    except Exception as e:
        print("Error downloading report:", e)
        return err('Failed to download report', 500)

# -------------------------------------------------
# GET /download_pdf/<report_id>: Xuất report PDF
# -------------------------------------------------


@admin_reports_bp.route('/download_pdf/<int:report_id>', methods=['GET'])
@authenticator
@check_role(['admin', 'superadmin'])
def download_report_pdf(report_id):
    try:
        # Lấy dữ liệu report (có thể tái sử dụng hàm download_report)
        report_resp = download_report(report_id)
        if report_resp[1] != 200:
            return report_resp
        report_data = report_resp[0].json['data']

        # Tạo PDF in-memory
        buffer = io.BytesIO()
        c = canvas.Canvas(buffer, pagesize=A4)
        width, height = A4
        y = height - 40

        c.setFont("Helvetica-Bold", 16)
        c.drawString(40, y, f"Patient Report ID: {report_data['report_id']}")
        y -= 30

        c.setFont("Helvetica", 12)
        c.drawString(40, y, f"Status: {report_data['status']}")
        y -= 20
        c.drawString(40, y, f"Pet: {report_data['pet']['name']} (Breed: {report_data['pet']['breed']}, Age: {report_data['pet']['age']})")
        y -= 20
        c.drawString(40, y, f"Owner: {report_data['user']['user_name']}")
        y -= 20
        c.drawString(40, y, f"Doctor: {report_data['doctor_name']}")
        y -= 20
        c.drawString(40, y, f"Check-in: {report_data['check_in']}")
        y -= 20
        c.drawString(40, y, f"Check-out: {report_data['check_out']}")
        y -= 30

        def draw_list(title, items):
            nonlocal y
            if items:
                c.drawString(40, y, f"{title}: {', '.join(items)}")
                y -= 20

        draw_list("Services", report_data['services'])
        draw_list("Medicines", [f"{m['name']} (x{m['quantity']})" for m in report_data['medicines']])
        draw_list("Symptoms", report_data['symptoms'])
        draw_list("Diseases", report_data['diseases'])
        draw_list("Images URLs", [img['image_url'] for img in report_data['images']])

        c.showPage()
        c.save()
        buffer.seek(0)

        return send_file(buffer, as_attachment=True,
                         download_name=f"patient_report_{report_id}.pdf",
                         mimetype='application/pdf')
    except Exception as e:
        print("Error generating PDF:", e)
        return jsonify({'error': 'Failed to generate PDF'}), 500


admin_pet_hotel_bp = Blueprint(
    'admin_pet_hotel',
    __name__,
    url_prefix='/admin/pet-hotel'
)

# -------------------------------------------------
# GET: Tổng quan khách sạn thú cưng
# -------------------------------------------------
@admin_pet_hotel_bp.route('/stats', methods=['GET'])
@authenticator
@check_role(['admin', 'superadmin'])
def pet_hotel_stats():
    try:
        total_houses = models.PetHouse.query.count()

        total_revenue = models.db.session.query(
            func.coalesce(func.sum(models.InvoiceHotel.total), 0)
        ).scalar()

        staying_count = models.PetHotel.query.filter(
            models.PetHotel.check_out.is_(None)
        ).count()

        return ok({
            'totalPethouse': total_houses,
            'totalRevenue': float(total_revenue),
            'stayingPets': staying_count
        })

    except Exception as e:
        print('Pet hotel stats error:', e)
        return ok({})


# -------------------------------------------------
# GET: Danh sách pet đang lưu trú
# -------------------------------------------------
@admin_pet_hotel_bp.route('/staying', methods=['GET'])
@authenticator
@check_role(['admin', 'superadmin'])
def list_staying_pets():
    try:
        rows = models.db.session.query(
            models.PetHotel,
            models.Pet,
            models.User,
            models.PetHouse
        ).join(
            models.Pet, models.PetHotel.pet_id == models.Pet.pet_id
        ).join(
            models.User, models.Pet.user_id == models.User.user_id
        ).join(
            models.InvoiceHotel, models.InvoiceHotel.petboard_id == models.PetHotel.petboard_id
        ).join(
            models.PetHouse, models.InvoiceHotel.hotel_id == models.PetHouse.hotel_id
        ).filter(
            models.PetHotel.check_out.is_(None)
        ).order_by(models.PetHotel.check_in.asc()).all()

        data = [{
            'pet_name': pet.name,
            'user_name': f"{user.first_name} {user.last_name}",
            'check_in': hotel.check_in.isoformat(),
            'pethouse': house.name
        } for hotel, pet, user, house in rows]

        return ok(data)

    except Exception as e:
        print('Staying pets error:', e)
        return ok([])


# -------------------------------------------------
# GET: Danh sách phòng (pethouse)
# -------------------------------------------------
@admin_pet_hotel_bp.route('/houses', methods=['GET'])
@authenticator
@check_role(['admin', 'superadmin'])
def list_pethouses():
    houses = models.PetHouse.query.order_by(models.PetHouse.hotel_id.asc()).all()
    return ok([{
        'hotel_id': h.hotel_id,
        'name': h.name,
        'price': float(h.price)
    } for h in houses])


# -------------------------------------------------
# POST: Thêm phòng (pethouse)
# -------------------------------------------------
@admin_pet_hotel_bp.route('/houses', methods=['POST'])
@authenticator
@check_role(['admin', 'superadmin'])
def create_pethouse():
    data = request.get_json() or {}
    name = data.get('name')
    price = data.get('price')

    if not name or price is None:
        return jsonify({'error': 'name and price are required'}), 400

    house = models.PetHouse(name=name, price=price)
    models.db.session.add(house)
    models.db.session.commit()

    return jsonify({'message': 'Pethouse created'}), 201


# -------------------------------------------------
# POST: Đăng ký lưu trú (pet_hotel + invoice_hotel)
# -------------------------------------------------
@admin_pet_hotel_bp.route('/register', methods=['POST'])
@authenticator
@check_role(['admin', 'superadmin'])
def register_pet_hotel():
    data = request.get_json() or {}
    pet_id = data.get('pet_id')
    hotel_id = data.get('hotel_id')

    if not pet_id or not hotel_id:
        return jsonify({'error': 'pet_id and hotel_id required'}), 400

    try:
        pet_hotel = models.PetHotel(pet_id=pet_id)
        models.db.session.add(pet_hotel)
        models.db.session.flush()  # lấy petboard_id

        invoice = models.InvoiceHotel(
            petboard_id=pet_hotel.petboard_id,
            hotel_id=hotel_id,
            days=0,
            total=0
        )
        models.db.session.add(invoice)
        models.db.session.commit()

        return jsonify({'message': 'Pet registered to hotel'}), 201

    except Exception as e:
        models.db.session.rollback()
        print('Register pet hotel error:', e)
        return jsonify({'error': 'Failed'}), 500


# -------------------------------------------------
# GET: Xem tất cả lượt đăng ký
# -------------------------------------------------
@admin_pet_hotel_bp.route('/registrations', methods=['GET'])
@authenticator
@check_role(['admin', 'superadmin'])
def list_pet_hotel_registrations():
    check_in_str = request.args.get('check_in')
    pet_name = request.args.get('pet_name')

    query = models.db.session.query(
        models.PetHotel,
        models.Pet,
        models.PetHouse,
        models.InvoiceHotel
    ).join(
        models.Pet, models.PetHotel.pet_id == models.Pet.pet_id
    ).join(
        models.InvoiceHotel, models.InvoiceHotel.petboard_id == models.PetHotel.petboard_id
    ).join(
        models.PetHouse, models.InvoiceHotel.hotel_id == models.PetHouse.hotel_id
    )

    if check_in_str:
        try:
            d = datetime.fromisoformat(check_in_str).date()
            query = query.filter(func.date(models.PetHotel.check_in) == d)
        except ValueError:
            return err('Invalid date', 400)

    if pet_name:
        query = query.filter(models.Pet.name.ilike(f"%{pet_name}%"))

    rows = query.order_by(models.PetHotel.check_in.desc()).all()

    data = [{
        'pet_name': pet.name,
        'check_in': hotel.check_in.isoformat(),
        'check_out': hotel.check_out.isoformat() if hotel.check_out else None,
        'pethouse': house.name,
        'days': invoice.days,
        'total': float(invoice.total)
    } for hotel, pet, house, invoice in rows]

    return ok(data)


# -------------------------------------------------
# PATCH: Check-out pet (trigger tự update invoice)
# -------------------------------------------------
@admin_pet_hotel_bp.route('/checkout/<int:petboard_id>', methods=['PATCH'])
@authenticator
@check_role(['admin', 'superadmin'])
def checkout_pet(petboard_id):
    hotel = models.PetHotel.query.get(petboard_id)
    if not hotel:
        return err('Not found', 404)

    hotel.check_out = datetime.now()
    models.db.session.commit()

    return jsonify({'message': 'Pet checked out'}), 200


admin_pets_bp = Blueprint(
    'admin_pets',
    __name__,
    url_prefix='/admin/pets'
)

# -------------------------------------------------
# GET: Thống kê thú cưng
# -------------------------------------------------
@admin_pets_bp.route('/stats', methods=['GET'])
@authenticator
@check_role(['admin', 'superadmin'])
def pet_stats():
    """Admin: Thống kê thú cưng"""
    try:
        total = models.Pet.query.count()

        dogs = models.Pet.query.filter(
            models.Pet.breed.ilike('%Chó%')
        ).count()

        cats = models.Pet.query.filter(
            models.Pet.breed.ilike('%Mèo%')
        ).count()

        others = total - dogs - cats

    except Exception as e:
        print('Error fetching pet stats:', e)
        total = dogs = cats = others = 0

    return jsonify({
        'data': {
            'totalPets': int(total),
            'dogs': int(dogs),
            'cats': int(cats),
            'others': int(others)
        }
    }), 200


# -------------------------------------------------
# GET: Danh sách pet + tìm kiếm
# -------------------------------------------------
@admin_pets_bp.route('', methods=['GET'])
@authenticator
@check_role(['admin', 'superadmin'])
def list_pets():
    """
    Admin: Danh sách thú cưng
    Search theo:
    - tên pet
    - first_name
    - last_name
    - first_name + last_name
    """
    q = request.args.get('q', '').strip()

    try:
        query = (
            models.db.session.query(models.Pet, models.User)
            .join(models.User, models.Pet.user_id == models.User.user_id)
        )

        if q:
            full_name = func.concat(
                models.User.first_name, ' ', models.User.last_name
            )

            query = query.filter(
                or_(
                    models.Pet.name.ilike(f'%{q}%'),
                    models.User.first_name.ilike(f'%{q}%'),
                    models.User.last_name.ilike(f'%{q}%'),
                    full_name.ilike(f'%{q}%')
                )
            )

        pets = query.order_by(models.Pet.pet_id.desc()).all()

        data = []

        for pet, user in pets:
            data.append({
                'pet_id': pet.pet_id,
                'name': pet.name,
                'breed': pet.breed,
                'age': pet.age,
                'owner_name': f"{user.first_name} {user.last_name}"
            })

        return ok(data)

    except Exception as e:
        print('Error listing pets:', e)
        return ok([])


# -------------------------------------------------
# GET: Chi tiết 1 pet
# -------------------------------------------------
@admin_pets_bp.route('/<int:pet_id>', methods=['GET'])
@authenticator
@check_role(['admin', 'superadmin'])
def pet_detail(pet_id):
    """
    Admin: Chi tiết thú cưng
    - lần khám gần nhất
    - bác sĩ khám gần nhất
    """
    try:
        pet = models.Pet.query.get(pet_id)

        if not pet:
            return err('Pet not found', 404)

        owner = pet.owner

        # ---- Lấy patient_report mới nhất (qua slot.check_out)
        latest_report = (
            models.db.session.query(models.PatientReport)
            .join(models.Slot)
            .filter(
                models.PatientReport.pet_id == pet_id,
                models.Slot.check_out.isnot(None)
            )
            .order_by(models.Slot.check_out.desc())
            .first()
        )

        last_visit_time = None
        doctor_name = None

        if latest_report:
            slot = latest_report.slot
            last_visit_time = slot.check_out.isoformat()

            doctor_slot = slot.doctor_slot
            if doctor_slot and doctor_slot.doctor:
                doctor_name = doctor_slot.doctor.doctor_name

        return jsonify({
            'data': {
                'pet': {
                    'name': pet.name,
                    'breed': pet.breed,
                    'age': pet.age
                },
                'owner': {
                    'full_name': f"{owner.first_name} {owner.last_name}",
                    'email': owner.email
                },
                'lastVisit': {
                    'time': last_visit_time,
                    'doctorName': doctor_name
                }
            }
        }), 200

    except Exception as e:
        print('Error fetching pet detail:', e)
        return jsonify({'message': 'Internal server error'}), 500



admin_items_bp = Blueprint(
    'admin_items',
    __name__,
    url_prefix='/admin/items'
)

# -------------------------------------------------
# GET /services : Danh sách dịch vụ
# -------------------------------------------------
@admin_items_bp.route('/services', methods=['GET'])
@authenticator
@check_role(['admin', 'superadmin'])
def list_services():
    try:
        view_all = request.args.get('view_all', 'false').lower() == 'true'
        query = models.Service.query.order_by(models.Service.service_id.asc())
        if not view_all:
            query = query.limit(5)
        services = query.all()

        data = [{'service_id': s.service_id, 'name': s.name, 'price': float(s.price)} for s in services]
        return ok(data)

    except Exception as e:
        print('Error fetching services:', e)
        return ok([])

# -------------------------------------------------
# GET /medicines : Danh sách thuốc
# -------------------------------------------------
@admin_items_bp.route('/medicines', methods=['GET'])
@authenticator
@check_role(['admin', 'superadmin'])
def list_medicines():
    try:
        view_all = request.args.get('view_all', 'false').lower() == 'true'
        query = models.Medicine.query.order_by(models.Medicine.medicine_id.asc())
        if not view_all:
            query = query.limit(5)
        medicines = query.all()

        data = [{'medicine_id': m.medicine_id, 'name': m.name, 'price': float(m.price)} for m in medicines]
        return ok(data)

    except Exception as e:
        print('Error fetching medicines:', e)
        return ok([])

admin_slots_bp = Blueprint(
    'admin_slots',
    __name__,
    url_prefix='/admin/slots'
)

# -------------------------------------------------
# GET: Thống kê số lượt khám theo status
# -------------------------------------------------
@admin_slots_bp.route('/stats', methods=['GET'])
@authenticator
@check_role(['admin', 'superadmin'])
def slots_stats():
    """Thống kê số lượt khám theo status + tổng"""
    try:
        counts = models.db.session.query(
            models.Slot.status,
            func.count(models.Slot.slot_id)
        ).group_by(models.Slot.status).all()

        status_map = {status: count for status, count in counts}
        total = sum(status_map.values())

        return jsonify({
            'data': {
                'waiting': status_map.get('Đang chờ', 0),
                'in_progress': status_map.get('Đang khám', 0),
                'done': status_map.get('Đã xong', 0),
                'total': total
            }
        }), 200
    except Exception as e:
        print('Error fetching slot stats:', e)
        return jsonify({
            'data': {'waiting': 0, 'in_progress': 0, 'done': 0, 'total': 0}
        }), 200

# -------------------------------------------------
# GET: Danh sách slot với filter
# -------------------------------------------------
@admin_slots_bp.route('', methods=['GET'])
@authenticator
@check_role(['admin', 'superadmin'])
def list_slots():
    """
    Danh sách slot với filter tùy chọn:
    - check_in date (YYYY-MM-DD)
    - status
    - doctor_name
    - user_name (first_name, last_name hoặc full name)
    Mặc định: tất cả slot nếu không truyền filter
    """
    check_in_str = request.args.get('check_in')
    status_filter = request.args.get('status')
    doctor_name_filter = request.args.get('doctor_name')
    user_name_filter = request.args.get('user_name')

    try:
        query = models.db.session.query(
            models.Slot,
            models.Appointment,
            models.User,
            models.PatientReport,
            models.Pet,
            models.DoctorSlot,
            models.Doctor
        ).join(
            models.Appointment, models.Slot.appointment_id == models.Appointment.appointment_id
        ).join(
            models.User, models.Appointment.user_id == models.User.user_id
        ).outerjoin(
            models.PatientReport, models.PatientReport.appointment_id == models.Appointment.appointment_id
        ).outerjoin(
            models.Pet, models.PatientReport.pet_id == models.Pet.pet_id
        ).join(
            models.DoctorSlot, models.Slot.doctor_slot_id == models.DoctorSlot.doctor_slot_id
        ).join(
            models.Doctor, models.DoctorSlot.doctor_id == models.Doctor.doctor_id
        )

        # Filter theo ngày nếu có truyền check_in
        if check_in_str:
            try:
                check_in_date = datetime.fromisoformat(check_in_str).date()
                query = query.filter(func.date(models.Slot.check_in) == check_in_date)
            except ValueError:
                return jsonify({'error': 'check_in format invalid, use YYYY-MM-DD'}), 400

        # Filter status
        if status_filter:
            query = query.filter(models.Slot.status == status_filter)

        # Filter doctor_name
        if doctor_name_filter:
            query = query.filter(models.Doctor.doctor_name.ilike(f"%{doctor_name_filter}%"))

        # Filter user_name
        if user_name_filter:
            query = query.filter(
                or_(
                    models.User.first_name.ilike(f"%{user_name_filter}%"),
                    models.User.last_name.ilike(f"%{user_name_filter}%"),
                    (models.User.first_name + ' ' + models.User.last_name).ilike(f"%{user_name_filter}%")
                )
            )

        slots = query.order_by(models.Slot.check_in.asc()).all()

        data = []
        for slot, appt, user, report, pet, doctor_slot, doctor in slots:
            data.append({
                'slot_id': slot.slot_id,
                'check_in': slot.check_in.isoformat(),
                'check_out': slot.check_out.isoformat() if slot.check_out else None,
                'status': slot.status,
                'pet_name': pet.name if pet else None,
                'user_name': f"{user.first_name} {user.last_name}" if user else None,
                'doctor_name': doctor.doctor_name if doctor else None
            })

        return ok(data)

    except Exception as e:
        print('Error fetching slots:', e)
        return ok([])



admin_statistics_bp = Blueprint(
    'admin_statistics',
    __name__,
    url_prefix='/admin/statistics'
)

# -------------------------------------------------
# GET: Dashboard thống kê tổng hợp
# -------------------------------------------------
@admin_statistics_bp.route('', methods=['GET'])
@authenticator
@check_role(['admin', 'superadmin'])
def admin_statistics():
    today = date.today()

    # =================================================
    # 1. Tổng doanh thu & doanh thu 7 ngày gần nhất
    # =================================================
    total_revenue = models.db.session.query(
        func.coalesce(func.sum(models.Invoice.total), 0)
    ).scalar()

    last_7_days = today - timedelta(days=6)

    revenue_by_day = models.db.session.query(
        func.date(models.Slot.check_out).label('day'),
        func.coalesce(func.sum(models.Invoice.total), 0)
    ).join(
        models.PatientReport,
        models.PatientReport.report_id == models.Invoice.report_id
    ).join(
        models.Slot,
        models.Slot.slot_id == models.PatientReport.slot_id
    ).filter(
        models.Slot.check_out.isnot(None),
        func.date(models.Slot.check_out) >= last_7_days
    ).group_by('day').order_by('day').all()

    revenue_chart = {
        d.isoformat(): 0 for d in (last_7_days + timedelta(days=i) for i in range(7))
    }
    for d, total in revenue_by_day:
        revenue_chart[d.isoformat()] = float(total)

    # =================================================
    # 2. Tổng số appointment & biểu đồ 7 ngày tuần này
    # =================================================
    total_appointments = models.Appointment.query.count()

    week_start = today - timedelta(days=today.weekday())
    week_end = week_start + timedelta(days=6)

    appt_by_day = models.db.session.query(
        models.Appointment.booking_date,
        func.count(models.Appointment.appointment_id)
    ).filter(
        models.Appointment.booking_date.between(week_start, week_end)
    ).group_by(models.Appointment.booking_date).all()

    appointment_chart = {
        (week_start + timedelta(days=i)).isoformat(): 0 for i in range(7)
    }
    for d, c in appt_by_day:
        appointment_chart[d.isoformat()] = c

    # =================================================
    # 3. Top 4 dịch vụ được dùng nhiều nhất
    # =================================================
    top_services = models.db.session.query(
        models.Service.name,
        func.count(models.ReportService.service_id).label('count')
    ).join(
        models.ReportService,
        models.ReportService.service_id == models.Service.service_id
    ).group_by(
        models.Service.service_id
    ).order_by(
        func.count(models.ReportService.service_id).desc()
    ).limit(4).all()

    top_services_data = [{
        'service_name': name,
        'count': count
    } for name, count in top_services]

    # =================================================
    # 4. Hiệu suất (feedback rating)
    # =================================================
    feedback_stats = models.db.session.query(
        func.count(models.Feedback.feedback_id),
        func.coalesce(func.sum(func.cast(func.cast(models.Feedback.rating, db.Text), db.Integer)), 0)
    ).first()

    feedback_count, rating_sum = feedback_stats
    performance = (
        (rating_sum * 100) / (feedback_count * 5)
        if feedback_count > 0 else 0
    )

    # =================================================
    # 5. Doanh thu theo ngày trong tháng hiện tại
    # =================================================
    month_start = today.replace(day=1)
    next_month = (month_start + timedelta(days=32)).replace(day=1)

    monthly_revenue = models.db.session.query(
        func.date(models.Slot.check_out),
        func.sum(models.Invoice.total)
    ).join(
        models.PatientReport,
        models.PatientReport.report_id == models.Invoice.report_id
    ).join(
        models.Slot,
        models.Slot.slot_id == models.PatientReport.slot_id
    ).filter(
        models.Slot.check_out.isnot(None),
        models.Slot.check_out >= month_start,
        models.Slot.check_out < next_month
    ).group_by(
        func.date(models.Slot.check_out)
    ).all()

    calendar_revenue = {
        d[0].isoformat(): float(d[1]) for d in monthly_revenue
    }

    # =================================================
    # 6. Tỉ lệ loài pet (Chó / Mèo / Khác)
    # =================================================
    pet_species = models.db.session.query(
        case(
            (models.Pet.breed.ilike('%chó%'), 'Dog'),
            (models.Pet.breed.ilike('%mèo%'), 'Cat'),
            else_='Other'
        ).label('species'),
        func.count(models.Pet.pet_id)
    ).group_by('species').all()

    total_pets = sum(count for _, count in pet_species) or 1
    pet_ratio = [{
        'species': species,
        'percent': round(count * 100 / total_pets, 2)
    } for species, count in pet_species]

    # =================================================
    # 7. Top 4 khung giờ cao điểm (2h / khung)
    # =================================================
    slot_hours = models.db.session.query(
        (extract('hour', models.Slot.check_in) / 2).label('block'),
        func.count(models.Slot.slot_id).label('count')
    ).group_by('block')

    hotel_hours = models.db.session.query(
        (extract('hour', models.PetHotel.check_in) / 2).label('block'),
        func.count(models.PetHotel.petboard_id).label('count')
    ).group_by('block')

    hour_blocks = slot_hours.union_all(hotel_hours).subquery()

    top_hours = models.db.session.query(
        hour_blocks.c.block,
        func.sum(hour_blocks.c.count)
    ).group_by(
        hour_blocks.c.block
    ).order_by(
        func.sum(hour_blocks.c.count).desc()
    ).limit(4).all()

    peak_hours = []
    for block, _ in top_hours:
        start = int(block * 2)
        end = start + 2
        peak_hours.append(f"{start:02d}:00 - {end:02d}:00")

    # =================================================
    # RESPONSE
    # =================================================
    return jsonify({
        'data': {
            'totalRevenue': float(total_revenue),
            'revenueLast7Days': revenue_chart,

            'totalAppointments': total_appointments,
            'appointmentsThisWeek': appointment_chart,

            'topServices': top_services_data,
            'performance': round(performance, 2),

            'monthlyRevenue': calendar_revenue,
            'petSpeciesRatio': pet_ratio,

            'peakHours': peak_hours
        }
    }), 200

@admin_users_bp.route('', methods=['GET'])
@authenticator
@check_role(['admin', 'superadmin'])
def list_users():
    try:
        users = (
            models.User.query
            .order_by(models.User.user_id.desc())
            .all()
        )

        data = []
        for user in users:
            data.append({
                'user_id': user.user_id,
                'full_name': f"{user.first_name} {user.last_name}",
                'email': user.email,
                'pets': [pet.name for pet in getattr(user, 'pets', [])]
            })

        return ok(data)

    except Exception as e:
        print('Error listing users:', e)
        return ok([])


# -------------------------------------------------
# PUT: Set user role
# -------------------------------------------------
@admin_users_bp.route('/<int:user_id>/role', methods=['PUT'])
@authenticator
@check_role(['admin', 'superadmin'])
def set_user_role(user_id):
    data = request.get_json() or {}
    role = data.get('role')
    if role not in ['admin', 'superadmin', 'customer']:
        return err('Invalid role', 400)
    user = models.User.query.get(user_id)
    if not user:
        return err('User not found', 404)
    try:
        user.user_type = role
        models.db.session.commit()
        return ok_message('Role updated')
    except Exception as e:
        print('Error setting role:', e)
        models.db.session.rollback()
        return err('Failed to set role')


# -------------------------------------------------
# PUT: Lock user
# -------------------------------------------------
@admin_users_bp.route('/<int:user_id>/lock', methods=['PUT'])
@authenticator
@check_role(['admin', 'superadmin'])
def lock_user(user_id):
    user = models.User.query.get(user_id)
    if not user:
        return err('User not found', 404)
    try:
        user.is_active = False
        models.db.session.commit()
        return ok_message('User locked')
    except Exception as e:
        print('Error locking user:', e)
        models.db.session.rollback()
        return err('Failed to lock user')


# -------------------------------------------------
# PUT: Unlock user
# -------------------------------------------------
@admin_users_bp.route('/<int:user_id>/unlock', methods=['PUT'])
@authenticator
@check_role(['admin', 'superadmin'])
def unlock_user(user_id):
    user = models.User.query.get(user_id)
    if not user:
        return err('User not found', 404)
    try:
        user.is_active = True
        models.db.session.commit()
        return ok_message('User unlocked')
    except Exception as e:
        print('Error unlocking user:', e)
        models.db.session.rollback()
        return err('Failed to unlock user')


# -------------------------------------------------
# POST: Tạo người dùng (Admin)
# -------------------------------------------------
@admin_users_bp.route('', methods=['POST'])
@authenticator
@check_role(['admin', 'superadmin'])
def create_user():
    data = request.get_json() or {}
    first = data.get('firstName') or data.get('first_name') or data.get('first')
    last = data.get('lastName') or data.get('last_name') or data.get('last')
    email = (data.get('email') or '').strip().lower()
    password = data.get('password')
    user_type = data.get('user_type') or data.get('userType') or data.get('role') or 'customer'

    if not all([first, last, email, password]):
        return err('Missing required fields', 400)

    # Basic validations
    if '@' not in email or len(email) < 5:
        return err('Invalid email', 400)
    if len(password) < 6:
        return err('Password must be at least 6 characters', 400)

    if models.User.query.filter_by(email=email).first():
        return err('Email already exists', 409)

    try:
        hashed = generate_password_hash(password)
        user = models.User(first_name=first, last_name=last, email=email, password=hashed, user_type=user_type)
        models.db.session.add(user)
        models.db.session.commit()
        return ok({'user': user.to_dict()}, 201)
    except Exception as e:
        print('Error creating admin user:', e)
        models.db.session.rollback()
        return err('Failed to create user', 500)


# -------------------------------------------------
# GET: Tìm kiếm người dùng
# -------------------------------------------------
@admin_users_bp.route('/search', methods=['GET'])
@authenticator
@check_role(['admin', 'superadmin'])
def search_users():
    """
    Admin: Tìm kiếm người dùng theo:
    - first_name
    - email
    - first_name + last_name
    """
    q = request.args.get('q', '').strip()

    if not q:
        return ok([])

    try:
        search = f"%{q.lower()}%"

        users = (
            models.User.query
            .filter(
                or_(
                    func.lower(models.User.first_name).ilike(search),
                    func.lower(models.User.email).ilike(search),
                    func.lower(
                        func.concat(
                            models.User.first_name, ' ', models.User.last_name
                        )
                    ).ilike(search)
                )
            )
            .all()
        )

        data = []
        for user in users:
            data.append({
                'user_id': user.user_id,
                'full_name': f"{user.first_name} {user.last_name}",
                'email': user.email,
                'pets': [pet.name for pet in getattr(user, 'pets', [])]
            })

        return ok(data)

    except Exception as e:
        print('Error searching users:', e)
        return ok([])


# -------------------------------------------------
# DELETE: Xóa người dùng (hard delete)
# -------------------------------------------------
@admin_users_bp.route('/<int:user_id>', methods=['DELETE'])
@authenticator
@check_role(['admin', 'superadmin'])
def delete_user(user_id):
    """
    Admin: Xóa người dùng (hard delete)
    - Cascade: pet, appointment, slot, report...
    """
    try:
        user = models.User.query.get(user_id)

        if not user:
            return err('User not found', 404)

        models.db.session.delete(user)
        models.db.session.commit()

        return ok_message('User deleted successfully')

    except Exception as e:
        print('Error deleting user:', e)
        models.db.session.rollback()
        return err('Failed to delete user', 500)

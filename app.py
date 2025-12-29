# app.py
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from flask_migrate import Migrate  # cho migrations
import os

app = Flask(__name__)

# ================= Database Config =================
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:iamthuw2308@localhost:5432/vet_clinic'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
migrate = Migrate(app, db)  # hỗ trợ migrations

# ================= Models =================
class User(db.Model):
    __tablename__ = "users"
    user_id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    user_type = db.Column(db.String(20), nullable=False)

    def to_dict(self):
        return {
            "user_id": self.user_id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "email": self.email,
            "user_type": self.user_type
        }

class Pet(db.Model):
    __tablename__ = "pet"
    pet_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    breed = db.Column(db.String(50))
    age = db.Column(db.Integer)
    user_id = db.Column(db.Integer, db.ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)

    # Relationship optional
    owner = db.relationship("User", backref=db.backref("pets", cascade="all, delete"))

    def to_dict(self):
        return {
            "pet_id": self.pet_id,
            "name": self.name,
            "breed": self.breed,
            "age": self.age,
            "user_id": self.user_id
        }

from sqlalchemy.dialects.postgresql import ENUM

# Enum cho doctor_shift
doctor_shift_enum = ENUM(
    'NONE', '9-12', '12-18', '9-13', '13-18', '9-17', '10-18',
    name='doctor_shift_enum',
    create_type=False  # tránh tự động tạo lại nếu đã có trong DB
)

class Doctor(db.Model):
    __tablename__ = "doctor"
    doctor_id = db.Column(db.Integer, primary_key=True)
    doctor_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    # Nếu muốn thêm shift, có thể thêm field này sau:
    # shift = db.Column(doctor_shift_enum, nullable=False, default='NONE')

    def to_dict(self):
        return {
            "doctor_id": self.doctor_id,
            "doctor_name": self.doctor_name,
            "email": self.email
            # "shift": self.shift nếu có
        }

class DoctorSlot(db.Model):
    __tablename__ = "doctor_slot"
    doctor_slot_id = db.Column(db.Integer, primary_key=True)
    shift = db.Column(doctor_shift_enum, nullable=False, default='NONE')
    slot_date = db.Column(db.Date, nullable=False)
    doctor_id = db.Column(db.Integer, db.ForeignKey("doctor.doctor_id", ondelete="CASCADE"), nullable=False)

    # Relationship optional
    doctor = db.relationship("Doctor", backref=db.backref("slots", cascade="all, delete"))

    def to_dict(self):
        return {
            "doctor_slot_id": self.doctor_slot_id,
            "shift": self.shift,
            "slot_date": self.slot_date.isoformat(),
            "doctor_id": self.doctor_id
        }

from sqlalchemy.dialects.postgresql import ENUM

# Enums
appointment_status_enum = ENUM(
    'Đang chờ xác nhận', 'Đặt lịch hẹn thành công', 'Đã hủy lịch hẹn',
    name='appointment_status_enum',
    create_type=False
)

slot_status_enum = ENUM(
    'Đang chờ', 'Đang khám', 'Đã xong',
    name='slot_status_enum',
    create_type=False
)

class Appointment(db.Model):
    __tablename__ = "appointment"
    appointment_id = db.Column(db.Integer, primary_key=True)
    booking_date = db.Column(db.Date, nullable=False)
    status = db.Column(appointment_status_enum, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, server_default=db.func.now())
    user_id = db.Column(db.Integer, db.ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)

    # Relationship
    user = db.relationship("User", backref=db.backref("appointments", cascade="all, delete"))

    def to_dict(self):
        return {
            "appointment_id": self.appointment_id,
            "booking_date": self.booking_date.isoformat(),
            "status": self.status,
            "created_at": self.created_at.isoformat(),
            "user_id": self.user_id
        }

class Slot(db.Model):
    __tablename__ = "slot"
    slot_id = db.Column(db.Integer, primary_key=True)
    check_in = db.Column(db.DateTime, nullable=False)
    check_out = db.Column(db.DateTime)
    status = db.Column(slot_status_enum, nullable=False)
    doctor_slot_id = db.Column(db.Integer, db.ForeignKey("doctor_slot.doctor_slot_id", ondelete="CASCADE"), nullable=False)
    appointment_id = db.Column(db.Integer, db.ForeignKey("appointment.appointment_id", ondelete="CASCADE"), nullable=False, unique=True)

    # Relationships
    doctor_slot = db.relationship("DoctorSlot", backref=db.backref("slots", cascade="all, delete"))
    appointment = db.relationship("Appointment", backref=db.backref("slot", cascade="all, delete", uselist=False))

    def to_dict(self):
        return {
            "slot_id": self.slot_id,
            "check_in": self.check_in.isoformat(),
            "check_out": self.check_out.isoformat() if self.check_out else None,
            "status": self.status,
            "doctor_slot_id": self.doctor_slot_id,
            "appointment_id": self.appointment_id
        }

from sqlalchemy.dialects.postgresql import ENUM

# Enum cho patient_report
patient_report_status_enum = ENUM(
    'Đang chờ khám', 'Đang khám', 'Đã khám xong',
    name='patient_report_status_enum',
    create_type=False
)

class PatientReport(db.Model):
    __tablename__ = "patient_report"
    report_id = db.Column(db.Integer, primary_key=True)
    status = db.Column(patient_report_status_enum, nullable=False)
    pet_id = db.Column(db.Integer, db.ForeignKey("pet.pet_id", ondelete="CASCADE"), nullable=False)
    slot_id = db.Column(db.Integer, db.ForeignKey("slot.slot_id", ondelete="CASCADE"), nullable=False, unique=True)

    # Relationships
    pet = db.relationship("Pet", backref=db.backref("reports", cascade="all, delete"))
    slot = db.relationship("Slot", backref=db.backref("patient_report", cascade="all, delete", uselist=False))

    def to_dict(self):
        return {
            "report_id": self.report_id,
            "status": self.status,
            "pet_id": self.pet_id,
            "slot_id": self.slot_id
        }

class Service(db.Model):
    __tablename__ = "service"
    service_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Numeric(9,0), nullable=False)
    service_category = db.Column(db.String(50), nullable=False)

    def to_dict(self):
        return {
            "service_id": self.service_id,
            "name": self.name,
            "price": float(self.price),
            "service_category": self.service_category
        }

class Medicine(db.Model):
    __tablename__ = "medicine"
    medicine_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Numeric(9,0), nullable=False)

    def to_dict(self):
        return {
            "medicine_id": self.medicine_id,
            "name": self.name,
            "price": float(self.price)
        }

class Symptom(db.Model):
    __tablename__ = "symptom"
    symptom_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)

    def to_dict(self):
        return {
            "symptom_id": self.symptom_id,
            "name": self.name
        }

class Disease(db.Model):
    __tablename__ = "disease"
    diagnose_id = db.Column(db.Integer, primary_key=True)
    disease_name = db.Column(db.String(100), nullable=False)

    def to_dict(self):
        return {
            "diagnose_id": self.diagnose_id,
            "disease_name": self.disease_name
        }

class Invoice(db.Model):
    __tablename__ = "invoice"
    invoice_id = db.Column(db.Integer, primary_key=True)
    total = db.Column(db.Numeric(9,0), nullable=False)
    report_id = db.Column(db.Integer, db.ForeignKey("patient_report.report_id", ondelete="CASCADE"), nullable=False, unique=True)

    # Relationship
    patient_report = db.relationship("PatientReport", backref=db.backref("invoice", cascade="all, delete", uselist=False))

    def to_dict(self):
        return {
            "invoice_id": self.invoice_id,
            "total": float(self.total),
            "report_id": self.report_id
        }

class MedicalImage(db.Model):
    __tablename__ = "medical_image"
    image_id = db.Column(db.Integer, primary_key=True)
    image_type = db.Column(db.String(50), nullable=False)
    image_url = db.Column(db.String(255), nullable=False)
    captured_date = db.Column(db.DateTime, nullable=False)
    description = db.Column(db.String(255))
    report_id = db.Column(db.Integer, db.ForeignKey("patient_report.report_id", ondelete="CASCADE"), nullable=False)

    # Relationship
    patient_report = db.relationship("PatientReport", backref=db.backref("medical_images", cascade="all, delete"))

    def to_dict(self):
        return {
            "image_id": self.image_id,
            "image_type": self.image_type,
            "image_url": self.image_url,
            "captured_date": self.captured_date.isoformat(),
            "description": self.description,
            "report_id": self.report_id
        }

class ReportService(db.Model):
    __tablename__ = "report_service"
    report_id = db.Column(db.Integer, db.ForeignKey("patient_report.report_id", ondelete="CASCADE"), primary_key=True)
    service_id = db.Column(db.Integer, db.ForeignKey("service.service_id", ondelete="CASCADE"), primary_key=True)

    # Relationships
    patient_report = db.relationship("PatientReport", backref=db.backref("report_services", cascade="all, delete"))
    service = db.relationship("Service", backref=db.backref("report_services", cascade="all, delete"))

    def to_dict(self):
        return {
            "report_id": self.report_id,
            "service_id": self.service_id
        }

class ReportMedicine(db.Model):
    __tablename__ = "report_medicine"
    report_id = db.Column(db.Integer, db.ForeignKey("patient_report.report_id", ondelete="CASCADE"), primary_key=True)
    medicine_id = db.Column(db.Integer, db.ForeignKey("medicine.medicine_id", ondelete="CASCADE"), primary_key=True)
    quantity = db.Column(db.Integer, nullable=False)

    # Relationships
    patient_report = db.relationship("PatientReport", backref=db.backref("report_medicines", cascade="all, delete"))
    medicine = db.relationship("Medicine", backref=db.backref("report_medicines", cascade="all, delete"))

    def to_dict(self):
        return {
            "report_id": self.report_id,
            "medicine_id": self.medicine_id,
            "quantity": self.quantity
        }

class ReportSymptom(db.Model):
    __tablename__ = "report_symptom"
    report_id = db.Column(db.Integer, db.ForeignKey("patient_report.report_id", ondelete="CASCADE"), primary_key=True)
    symptom_id = db.Column(db.Integer, db.ForeignKey("symptom.symptom_id", ondelete="CASCADE"), primary_key=True)

    # Relationships
    patient_report = db.relationship("PatientReport", backref=db.backref("report_symptoms", cascade="all, delete"))
    symptom = db.relationship("Symptom", backref=db.backref("report_symptoms", cascade="all, delete"))

    def to_dict(self):
        return {
            "report_id": self.report_id,
            "symptom_id": self.symptom_id
        }

class ReportDiagnose(db.Model):
    __tablename__ = "report_diagnose"
    report_id = db.Column(db.Integer, db.ForeignKey("patient_report.report_id", ondelete="CASCADE"), primary_key=True)
    diagnose_id = db.Column(db.Integer, db.ForeignKey("disease.diagnose_id", ondelete="CASCADE"), primary_key=True)

    # Relationships
    patient_report = db.relationship("PatientReport", backref=db.backref("report_diagnoses", cascade="all, delete"))
    disease = db.relationship("Disease", backref=db.backref("report_diagnoses", cascade="all, delete"))

    def to_dict(self):
        return {
            "report_id": self.report_id,
            "diagnose_id": self.diagnose_id
        }


class Feedback(db.Model):
    __tablename__ = "feedback"
    feedback_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.user_id", ondelete="SET NULL"), nullable=True)
    rating = db.Column(db.Enum('1','2','3','4','5', name='feedback_rating_enum'), nullable=False)
    status = db.Column(db.Enum('Hidden','Show', name='feedback_status_enum'), nullable=False)
    content = db.Column(db.Text)
    created_at = db.Column(db.DateTime, nullable=False, server_default=db.func.now())
    pet_name = db.Column(db.String(100), nullable=False)

    # Relationship
    user = db.relationship("User", backref=db.backref("feedbacks", cascade="all, delete-orphan"))

    def to_dict(self):
        return {
            "feedback_id": self.feedback_id,
            "user_id": self.user_id,
            "rating": self.rating,
            "status": self.status,
            "content": self.content,
            "created_at": self.created_at.isoformat(),
            "pet_name": self.pet_name
        }

class PetHotel(db.Model):
    __tablename__ = "pet_hotel"
    petboard_id = db.Column(db.Integer, primary_key=True)
    pet_id = db.Column(db.Integer, db.ForeignKey("pet.pet_id", ondelete="CASCADE"), nullable=False)
    check_in = db.Column(db.DateTime, nullable=False, server_default=db.func.now())
    check_out = db.Column(db.DateTime)
    notes = db.Column(db.Text)

    # Relationship
    pet = db.relationship("Pet", backref=db.backref("pet_hotels", cascade="all, delete"))

    def to_dict(self):
        return {
            "petboard_id": self.petboard_id,
            "pet_id": self.pet_id,
            "check_in": self.check_in.isoformat(),
            "check_out": self.check_out.isoformat() if self.check_out else None,
            "notes": self.notes
        }


class PetHouse(db.Model):
    __tablename__ = "pethouse"
    hotel_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Numeric(9, 0), nullable=False)

    # Relationship
    invoices = db.relationship("InvoiceHotel", back_populates="pethouse", cascade="all, delete")

    def to_dict(self):
        return {
            "hotel_id": self.hotel_id,
            "name": self.name,
            "price": float(self.price)
        }


class InvoiceHotel(db.Model):
    __tablename__ = "invoice_hotel"
    in_hotel_id = db.Column(db.Integer, primary_key=True)
    petboard_id = db.Column(db.Integer, db.ForeignKey("pet_hotel.petboard_id", ondelete="CASCADE"), nullable=False, unique=True)
    hotel_id = db.Column(db.Integer, db.ForeignKey("pethouse.hotel_id", ondelete="CASCADE"), nullable=False)
    days = db.Column(db.Integer, nullable=False)
    total = db.Column(db.Numeric(9, 0), nullable=False)

    # Relationships
    pet_hotel = db.relationship("PetHotel", backref=db.backref("invoice_hotel", uselist=False, cascade="all, delete"))
    pethouse = db.relationship("PetHouse", back_populates="invoices")

    def to_dict(self):
        return {
            "in_hotel_id": self.in_hotel_id,
            "petboard_id": self.petboard_id,
            "hotel_id": self.hotel_id,
            "days": self.days,
            "total": float(self.total)
        }

# Create a new user
@app.route("/users", methods=["POST"])
def create_user():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No input data provided"}), 400

    # Hash password trước khi lưu
    hashed_password = generate_password_hash(data['password'], method='sha256')

    new_user = User(
        first_name=data['first_name'],
        last_name=data['last_name'],
        email=data['email'],
        password=hashed_password,
        user_type=data['user_type']
    )
    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify(new_user.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# Get all users
@app.route("/users", methods=["GET"])
def get_users():
    users = User.query.all()
    return jsonify([u.to_dict() for u in users])

# Get a single user by ID
@app.route("/users/<int:user_id>", methods=["GET"])
def get_user(user_id):
    user = User.query.get_or_404(user_id)
    return jsonify(user.to_dict())

# Update a user
@app.route("/users/<int:user_id>", methods=["PUT"])
def update_user(user_id):
    user = User.query.get_or_404(user_id)
    data = request.get_json()

    user.first_name = data.get("first_name", user.first_name)
    user.last_name = data.get("last_name", user.last_name)
    user.email = data.get("email", user.email)
    if "password" in data:
        user.password = generate_password_hash(data["password"], method='sha256')
    user.user_type = data.get("user_type", user.user_type)

    try:
        db.session.commit()
        return jsonify(user.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# Delete a user
@app.route("/users/<int:user_id>", methods=["DELETE"])
def delete_user(user_id):
    user = User.query.get_or_404(user_id)
    try:
        db.session.delete(user)
        db.session.commit()
        return jsonify({"message": f"User {user_id} deleted"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# ================= Routes CRUD for Pets =================

# Create a new pet
@app.route("/pets", methods=["POST"])
def create_pet():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No input data provided"}), 400

    new_pet = Pet(
        name=data['name'],
        breed=data.get('breed'),
        age=data.get('age'),
        user_id=data['user_id']
    )
    try:
        db.session.add(new_pet)
        db.session.commit()
        return jsonify(new_pet.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# Get all pets
@app.route("/pets", methods=["GET"])
def get_pets():
    pets = Pet.query.all()
    return jsonify([p.to_dict() for p in pets])

# Get a single pet by ID
@app.route("/pets/<int:pet_id>", methods=["GET"])
def get_pet(pet_id):
    pet = Pet.query.get_or_404(pet_id)
    return jsonify(pet.to_dict())

# Update a pet
@app.route("/pets/<int:pet_id>", methods=["PUT"])
def update_pet(pet_id):
    pet = Pet.query.get_or_404(pet_id)
    data = request.get_json()

    pet.name = data.get("name", pet.name)
    pet.breed = data.get("breed", pet.breed)
    pet.age = data.get("age", pet.age)
    pet.user_id = data.get("user_id", pet.user_id)

    try:
        db.session.commit()
        return jsonify(pet.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# Delete a pet
@app.route("/pets/<int:pet_id>", methods=["DELETE"])
def delete_pet(pet_id):
    pet = Pet.query.get_or_404(pet_id)
    try:
        db.session.delete(pet)
        db.session.commit()
        return jsonify({"message": f"Pet {pet_id} deleted"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# ================= Routes CRUD for Doctors =================

# Create a new doctor
@app.route("/doctors", methods=["POST"])
def create_doctor():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No input data provided"}), 400

    hashed_password = generate_password_hash(data['password'], method='sha256')

    new_doctor = Doctor(
        doctor_name=data['doctor_name'],
        email=data['email'],
        password=hashed_password
    )
    try:
        db.session.add(new_doctor)
        db.session.commit()
        return jsonify(new_doctor.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# Get all doctors
@app.route("/doctors", methods=["GET"])
def get_doctors():
    doctors = Doctor.query.all()
    return jsonify([d.to_dict() for d in doctors])

# Get a single doctor by ID
@app.route("/doctors/<int:doctor_id>", methods=["GET"])
def get_doctor(doctor_id):
    doctor = Doctor.query.get_or_404(doctor_id)
    return jsonify(doctor.to_dict())

# Update a doctor
@app.route("/doctors/<int:doctor_id>", methods=["PUT"])
def update_doctor(doctor_id):
    doctor = Doctor.query.get_or_404(doctor_id)
    data = request.get_json()

    doctor.doctor_name = data.get("doctor_name", doctor.doctor_name)
    doctor.email = data.get("email", doctor.email)
    if "password" in data:
        doctor.password = generate_password_hash(data["password"], method='sha256')

    try:
        db.session.commit()
        return jsonify(doctor.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# Delete a doctor
@app.route("/doctors/<int:doctor_id>", methods=["DELETE"])
def delete_doctor(doctor_id):
    doctor = Doctor.query.get_or_404(doctor_id)
    try:
        db.session.delete(doctor)
        db.session.commit()
        return jsonify({"message": f"Doctor {doctor_id} deleted"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# ================= Routes CRUD for Doctor Slots =================

# Create a new doctor slot
@app.route("/doctor_slots", methods=["POST"])
def create_doctor_slot():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No input data provided"}), 400

    new_slot = DoctorSlot(
        shift=data['shift'],
        slot_date=data['slot_date'],
        doctor_id=data['doctor_id']
    )
    try:
        db.session.add(new_slot)
        db.session.commit()
        return jsonify(new_slot.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# Get all doctor slots
@app.route("/doctor_slots", methods=["GET"])
def get_doctor_slots():
    slots = DoctorSlot.query.all()
    return jsonify([s.to_dict() for s in slots])

# Get a single doctor slot by ID
@app.route("/doctor_slots/<int:doctor_slot_id>", methods=["GET"])
def get_doctor_slot(doctor_slot_id):
    slot = DoctorSlot.query.get_or_404(doctor_slot_id)
    return jsonify(slot.to_dict())

# Update a doctor slot
@app.route("/doctor_slots/<int:doctor_slot_id>", methods=["PUT"])
def update_doctor_slot(doctor_slot_id):
    slot = DoctorSlot.query.get_or_404(doctor_slot_id)
    data = request.get_json()

    slot.shift = data.get("shift", slot.shift)
    slot.slot_date = data.get("slot_date", slot.slot_date)
    slot.doctor_id = data.get("doctor_id", slot.doctor_id)

    try:
        db.session.commit()
        return jsonify(slot.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# Delete a doctor slot
@app.route("/doctor_slots/<int:doctor_slot_id>", methods=["DELETE"])
def delete_doctor_slot(doctor_slot_id):
    slot = DoctorSlot.query.get_or_404(doctor_slot_id)
    try:
        db.session.delete(slot)
        db.session.commit()
        return jsonify({"message": f"Doctor slot {doctor_slot_id} deleted"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# ================= Routes CRUD for Appointments =================

# Create appointment
@app.route("/appointments", methods=["POST"])
def create_appointment():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No input data provided"}), 400

    new_appointment = Appointment(
        booking_date=data['booking_date'],
        status=data['status'],
        user_id=data['user_id']
    )
    try:
        db.session.add(new_appointment)
        db.session.commit()
        return jsonify(new_appointment.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# Get all appointments
@app.route("/appointments", methods=["GET"])
def get_appointments():
    appointments = Appointment.query.all()
    return jsonify([a.to_dict() for a in appointments])

# Get single appointment
@app.route("/appointments/<int:appointment_id>", methods=["GET"])
def get_appointment(appointment_id):
    appointment = Appointment.query.get_or_404(appointment_id)
    return jsonify(appointment.to_dict())

# Update appointment
@app.route("/appointments/<int:appointment_id>", methods=["PUT"])
def update_appointment(appointment_id):
    appointment = Appointment.query.get_or_404(appointment_id)
    data = request.get_json()

    appointment.booking_date = data.get("booking_date", appointment.booking_date)
    appointment.status = data.get("status", appointment.status)
    appointment.user_id = data.get("user_id", appointment.user_id)

    try:
        db.session.commit()
        return jsonify(appointment.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# Delete appointment
@app.route("/appointments/<int:appointment_id>", methods=["DELETE"])
def delete_appointment(appointment_id):
    appointment = Appointment.query.get_or_404(appointment_id)
    try:
        db.session.delete(appointment)
        db.session.commit()
        return jsonify({"message": f"Appointment {appointment_id} deleted"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# ================= Routes CRUD for Slots =================

# Create slot
@app.route("/slots", methods=["POST"])
def create_slot():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No input data provided"}), 400

    new_slot = Slot(
        check_in=data['check_in'],
        check_out=data.get('check_out'),
        status=data['status'],
        doctor_slot_id=data['doctor_slot_id'],
        appointment_id=data['appointment_id']
    )
    try:
        db.session.add(new_slot)
        db.session.commit()
        return jsonify(new_slot.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# Get all slots
@app.route("/slots", methods=["GET"])
def get_slots():
    slots = Slot.query.all()
    return jsonify([s.to_dict() for s in slots])

# Get single slot
@app.route("/slots/<int:slot_id>", methods=["GET"])
def get_slot(slot_id):
    slot = Slot.query.get_or_404(slot_id)
    return jsonify(slot.to_dict())

# Update slot
@app.route("/slots/<int:slot_id>", methods=["PUT"])
def update_slot(slot_id):
    slot = Slot.query.get_or_404(slot_id)
    data = request.get_json()

    slot.check_in = data.get("check_in", slot.check_in)
    slot.check_out = data.get("check_out", slot.check_out)
    slot.status = data.get("status", slot.status)
    slot.doctor_slot_id = data.get("doctor_slot_id", slot.doctor_slot_id)
    slot.appointment_id = data.get("appointment_id", slot.appointment_id)

    try:
        db.session.commit()
        return jsonify(slot.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# Delete slot
@app.route("/slots/<int:slot_id>", methods=["DELETE"])
def delete_slot(slot_id):
    slot = Slot.query.get_or_404(slot_id)
    try:
        db.session.delete(slot)
        db.session.commit()
        return jsonify({"message": f"Slot {slot_id} deleted"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# ================= Routes CRUD for Patient Reports =================

# Create a patient report
@app.route("/patient_reports", methods=["POST"])
def create_patient_report():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No input data provided"}), 400

    new_report = PatientReport(
        status=data['status'],
        pet_id=data['pet_id'],
        slot_id=data['slot_id']
    )
    try:
        db.session.add(new_report)
        db.session.commit()
        return jsonify(new_report.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# Get all patient reports
@app.route("/patient_reports", methods=["GET"])
def get_patient_reports():
    reports = PatientReport.query.all()
    return jsonify([r.to_dict() for r in reports])

# Get a single patient report by ID
@app.route("/patient_reports/<int:report_id>", methods=["GET"])
def get_patient_report(report_id):
    report = PatientReport.query.get_or_404(report_id)
    return jsonify(report.to_dict())

# Update a patient report
@app.route("/patient_reports/<int:report_id>", methods=["PUT"])
def update_patient_report(report_id):
    report = PatientReport.query.get_or_404(report_id)
    data = request.get_json()

    report.status = data.get("status", report.status)
    report.pet_id = data.get("pet_id", report.pet_id)
    report.slot_id = data.get("slot_id", report.slot_id)

    try:
        db.session.commit()
        return jsonify(report.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# Delete a patient report
@app.route("/patient_reports/<int:report_id>", methods=["DELETE"])
def delete_patient_report(report_id):
    report = PatientReport.query.get_or_404(report_id)
    try:
        db.session.delete(report)
        db.session.commit()
        return jsonify({"message": f"Patient report {report_id} deleted"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# ================= Routes CRUD for Services =================

# Create a service
@app.route("/services", methods=["POST"])
def create_service():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No input data provided"}), 400

    new_service = Service(
        name=data['name'],
        price=data['price'],
        service_category=data['service_category']
    )
    try:
        db.session.add(new_service)
        db.session.commit()
        return jsonify(new_service.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# Get all services
@app.route("/services", methods=["GET"])
def get_services():
    services = Service.query.all()
    return jsonify([s.to_dict() for s in services])

# Get single service
@app.route("/services/<int:service_id>", methods=["GET"])
def get_service(service_id):
    service = Service.query.get_or_404(service_id)
    return jsonify(service.to_dict())

# Update service
@app.route("/services/<int:service_id>", methods=["PUT"])
def update_service(service_id):
    service = Service.query.get_or_404(service_id)
    data = request.get_json()

    service.name = data.get("name", service.name)
    service.price = data.get("price", service.price)
    service.service_category = data.get("service_category", service.service_category)

    try:
        db.session.commit()
        return jsonify(service.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# Delete service
@app.route("/services/<int:service_id>", methods=["DELETE"])
def delete_service(service_id):
    service = Service.query.get_or_404(service_id)
    try:
        db.session.delete(service)
        db.session.commit()
        return jsonify({"message": f"Service {service_id} deleted"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# ================= Routes CRUD for Medicines =================

# Create medicine
@app.route("/medicines", methods=["POST"])
def create_medicine():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No input data provided"}), 400

    new_medicine = Medicine(
        name=data['name'],
        price=data['price']
    )
    try:
        db.session.add(new_medicine)
        db.session.commit()
        return jsonify(new_medicine.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# Get all medicines
@app.route("/medicines", methods=["GET"])
def get_medicines():
    medicines = Medicine.query.all()
    return jsonify([m.to_dict() for m in medicines])

# Get single medicine
@app.route("/medicines/<int:medicine_id>", methods=["GET"])
def get_medicine(medicine_id):
    medicine = Medicine.query.get_or_404(medicine_id)
    return jsonify(medicine.to_dict())

# Update medicine
@app.route("/medicines/<int:medicine_id>", methods=["PUT"])
def update_medicine(medicine_id):
    medicine = Medicine.query.get_or_404(medicine_id)
    data = request.get_json()

    medicine.name = data.get("name", medicine.name)
    medicine.price = data.get("price", medicine.price)

    try:
        db.session.commit()
        return jsonify(medicine.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# Delete medicine
@app.route("/medicines/<int:medicine_id>", methods=["DELETE"])
def delete_medicine(medicine_id):
    medicine = Medicine.query.get_or_404(medicine_id)
    try:
        db.session.delete(medicine)
        db.session.commit()
        return jsonify({"message": f"Medicine {medicine_id} deleted"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# ================= Routes CRUD for Symptoms =================

# Create symptom
@app.route("/symptoms", methods=["POST"])
def create_symptom():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No input data provided"}), 400

    new_symptom = Symptom(name=data['name'])
    try:
        db.session.add(new_symptom)
        db.session.commit()
        return jsonify(new_symptom.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# Get all symptoms
@app.route("/symptoms", methods=["GET"])
def get_symptoms():
    symptoms = Symptom.query.all()
    return jsonify([s.to_dict() for s in symptoms])

# Get single symptom
@app.route("/symptoms/<int:symptom_id>", methods=["GET"])
def get_symptom(symptom_id):
    symptom = Symptom.query.get_or_404(symptom_id)
    return jsonify(symptom.to_dict())

# Update symptom
@app.route("/symptoms/<int:symptom_id>", methods=["PUT"])
def update_symptom(symptom_id):
    symptom = Symptom.query.get_or_404(symptom_id)
    data = request.get_json()
    symptom.name = data.get("name", symptom.name)
    try:
        db.session.commit()
        return jsonify(symptom.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# Delete symptom
@app.route("/symptoms/<int:symptom_id>", methods=["DELETE"])
def delete_symptom(symptom_id):
    symptom = Symptom.query.get_or_404(symptom_id)
    try:
        db.session.delete(symptom)
        db.session.commit()
        return jsonify({"message": f"Symptom {symptom_id} deleted"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# ================= Routes CRUD for Diseases =================

# Create disease
@app.route("/diseases", methods=["POST"])
def create_disease():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No input data provided"}), 400

    new_disease = Disease(disease_name=data['disease_name'])
    try:
        db.session.add(new_disease)
        db.session.commit()
        return jsonify(new_disease.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# Get all diseases
@app.route("/diseases", methods=["GET"])
def get_diseases():
    diseases = Disease.query.all()
    return jsonify([d.to_dict() for d in diseases])

# Get single disease
@app.route("/diseases/<int:diagnose_id>", methods=["GET"])
def get_disease(diagnose_id):
    disease = Disease.query.get_or_404(diagnose_id)
    return jsonify(disease.to_dict())

# Update disease
@app.route("/diseases/<int:diagnose_id>", methods=["PUT"])
def update_disease(diagnose_id):
    disease = Disease.query.get_or_404(diagnose_id)
    data = request.get_json()
    disease.disease_name = data.get("disease_name", disease.disease_name)
    try:
        db.session.commit()
        return jsonify(disease.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# Delete disease
@app.route("/diseases/<int:diagnose_id>", methods=["DELETE"])
def delete_disease(diagnose_id):
    disease = Disease.query.get_or_404(diagnose_id)
    try:
        db.session.delete(disease)
        db.session.commit()
        return jsonify({"message": f"Disease {diagnose_id} deleted"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# ================= Routes CRUD for Invoices =================

# Create invoice
@app.route("/invoices", methods=["POST"])
def create_invoice():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No input data provided"}), 400

    new_invoice = Invoice(
        total=data['total'],
        report_id=data['report_id']
    )
    try:
        db.session.add(new_invoice)
        db.session.commit()
        return jsonify(new_invoice.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# Get all invoices
@app.route("/invoices", methods=["GET"])
def get_invoices():
    invoices = Invoice.query.all()
    return jsonify([i.to_dict() for i in invoices])

# Get single invoice
@app.route("/invoices/<int:invoice_id>", methods=["GET"])
def get_invoice(invoice_id):
    invoice = Invoice.query.get_or_404(invoice_id)
    return jsonify(invoice.to_dict())

# Update invoice
@app.route("/invoices/<int:invoice_id>", methods=["PUT"])
def update_invoice(invoice_id):
    invoice = Invoice.query.get_or_404(invoice_id)
    data = request.get_json()

    invoice.total = data.get("total", invoice.total)
    invoice.report_id = data.get("report_id", invoice.report_id)

    try:
        db.session.commit()
        return jsonify(invoice.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# Delete invoice
@app.route("/invoices/<int:invoice_id>", methods=["DELETE"])
def delete_invoice(invoice_id):
    invoice = Invoice.query.get_or_404(invoice_id)
    try:
        db.session.delete(invoice)
        db.session.commit()
        return jsonify({"message": f"Invoice {invoice_id} deleted"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# ================= Routes CRUD for Medical Images =================

# Create medical image
@app.route("/medical_images", methods=["POST"])
def create_medical_image():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No input data provided"}), 400

    new_image = MedicalImage(
        image_type=data['image_type'],
        image_url=data['image_url'],
        captured_date=data['captured_date'],
        description=data.get('description'),
        report_id=data['report_id']
    )
    try:
        db.session.add(new_image)
        db.session.commit()
        return jsonify(new_image.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# Get all medical images
@app.route("/medical_images", methods=["GET"])
def get_medical_images():
    images = MedicalImage.query.all()
    return jsonify([i.to_dict() for i in images])

# Get single medical image
@app.route("/medical_images/<int:image_id>", methods=["GET"])
def get_medical_image(image_id):
    image = MedicalImage.query.get_or_404(image_id)
    return jsonify(image.to_dict())

# Update medical image
@app.route("/medical_images/<int:image_id>", methods=["PUT"])
def update_medical_image(image_id):
    image = MedicalImage.query.get_or_404(image_id)
    data = request.get_json()

    image.image_type = data.get("image_type", image.image_type)
    image.image_url = data.get("image_url", image.image_url)
    image.captured_date = data.get("captured_date", image.captured_date)
    image.description = data.get("description", image.description)
    image.report_id = data.get("report_id", image.report_id)

    try:
        db.session.commit()
        return jsonify(image.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# Delete medical image
@app.route("/medical_images/<int:image_id>", methods=["DELETE"])
def delete_medical_image(image_id):
    image = MedicalImage.query.get_or_404(image_id)
    try:
        db.session.delete(image)
        db.session.commit()
        return jsonify({"message": f"Medical image {image_id} deleted"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# ================= Routes CRUD for Report Services =================

# Add a service to a patient report
@app.route("/report_services", methods=["POST"])
def create_report_service():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No input data provided"}), 400

    new_rs = ReportService(
        report_id=data['report_id'],
        service_id=data['service_id']
    )
    try:
        db.session.add(new_rs)
        db.session.commit()
        return jsonify(new_rs.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# Get all report_service entries
@app.route("/report_services", methods=["GET"])
def get_report_services():
    entries = ReportService.query.all()
    return jsonify([e.to_dict() for e in entries])

# Get a single report_service by composite key
@app.route("/report_services/<int:report_id>/<int:service_id>", methods=["GET"])
def get_report_service(report_id, service_id):
    entry = ReportService.query.get_or_404((report_id, service_id))
    return jsonify(entry.to_dict())

# Delete a report_service entry
@app.route("/report_services/<int:report_id>/<int:service_id>", methods=["DELETE"])
def delete_report_service(report_id, service_id):
    entry = ReportService.query.get_or_404((report_id, service_id))
    try:
        db.session.delete(entry)
        db.session.commit()
        return jsonify({"message": f"ReportService ({report_id}, {service_id}) deleted"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# ================= Routes CRUD for Report Medicines =================

# Add medicine to a patient report
@app.route("/report_medicines", methods=["POST"])
def create_report_medicine():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No input data provided"}), 400

    if data['quantity'] <= 0:
        return jsonify({"error": "Quantity must be greater than 0"}), 400

    new_rm = ReportMedicine(
        report_id=data['report_id'],
        medicine_id=data['medicine_id'],
        quantity=data['quantity']
    )
    try:
        db.session.add(new_rm)
        db.session.commit()
        return jsonify(new_rm.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# Get all report_medicine entries
@app.route("/report_medicines", methods=["GET"])
def get_report_medicines():
    entries = ReportMedicine.query.all()
    return jsonify([e.to_dict() for e in entries])

# Get a single report_medicine by composite key
@app.route("/report_medicines/<int:report_id>/<int:medicine_id>", methods=["GET"])
def get_report_medicine(report_id, medicine_id):
    entry = ReportMedicine.query.get_or_404((report_id, medicine_id))
    return jsonify(entry.to_dict())

# Update report_medicine entry
@app.route("/report_medicines/<int:report_id>/<int:medicine_id>", methods=["PUT"])
def update_report_medicine(report_id, medicine_id):
    entry = ReportMedicine.query.get_or_404((report_id, medicine_id))
    data = request.get_json()

    quantity = data.get("quantity", entry.quantity)
    if quantity <= 0:
        return jsonify({"error": "Quantity must be greater than 0"}), 400

    entry.quantity = quantity

    try:
        db.session.commit()
        return jsonify(entry.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# Delete report_medicine entry
@app.route("/report_medicines/<int:report_id>/<int:medicine_id>", methods=["DELETE"])
def delete_report_medicine(report_id, medicine_id):
    entry = ReportMedicine.query.get_or_404((report_id, medicine_id))
    try:
        db.session.delete(entry)
        db.session.commit()
        return jsonify({"message": f"ReportMedicine ({report_id}, {medicine_id}) deleted"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# ================= Routes CRUD for Report Symptoms =================

# Add symptom to a patient report
@app.route("/report_symptoms", methods=["POST"])
def create_report_symptom():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No input data provided"}), 400

    new_rs = ReportSymptom(
        report_id=data['report_id'],
        symptom_id=data['symptom_id']
    )
    try:
        db.session.add(new_rs)
        db.session.commit()
        return jsonify(new_rs.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# Get all report_symptom entries
@app.route("/report_symptoms", methods=["GET"])
def get_report_symptoms():
    entries = ReportSymptom.query.all()
    return jsonify([e.to_dict() for e in entries])

# Get a single report_symptom by composite key
@app.route("/report_symptoms/<int:report_id>/<int:symptom_id>", methods=["GET"])
def get_report_symptom(report_id, symptom_id):
    entry = ReportSymptom.query.get_or_404((report_id, symptom_id))
    return jsonify(entry.to_dict())

# Delete report_symptom entry
@app.route("/report_symptoms/<int:report_id>/<int:symptom_id>", methods=["DELETE"])
def delete_report_symptom(report_id, symptom_id):
    entry = ReportSymptom.query.get_or_404((report_id, symptom_id))
    try:
        db.session.delete(entry)
        db.session.commit()
        return jsonify({"message": f"ReportSymptom ({report_id}, {symptom_id}) deleted"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# ================= Routes CRUD for Report Diagnoses =================

# Add diagnosis to a patient report
@app.route("/report_diagnoses", methods=["POST"])
def create_report_diagnose():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No input data provided"}), 400

    new_rd = ReportDiagnose(
        report_id=data['report_id'],
        diagnose_id=data['diagnose_id']
    )
    try:
        db.session.add(new_rd)
        db.session.commit()
        return jsonify(new_rd.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# Get all report_diagnose entries
@app.route("/report_diagnoses", methods=["GET"])
def get_report_diagnoses():
    entries = ReportDiagnose.query.all()
    return jsonify([e.to_dict() for e in entries])

# Get a single report_diagnose by composite key
@app.route("/report_diagnoses/<int:report_id>/<int:diagnose_id>", methods=["GET"])
def get_report_diagnose(report_id, diagnose_id):
    entry = ReportDiagnose.query.get_or_404((report_id, diagnose_id))
    return jsonify(entry.to_dict())

# Delete report_diagnose entry
@app.route("/report_diagnoses/<int:report_id>/<int:diagnose_id>", methods=["DELETE"])
def delete_report_diagnose(report_id, diagnose_id):
    entry = ReportDiagnose.query.get_or_404((report_id, diagnose_id))
    try:
        db.session.delete(entry)
        db.session.commit()
        return jsonify({"message": f"ReportDiagnose ({report_id}, {diagnose_id}) deleted"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# ================= Routes CRUD for Feedbacks =================

# Create feedback
@app.route("/feedbacks", methods=["POST"])
def create_feedback():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No input data provided"}), 400

    new_feedback = Feedback(
        user_id=data.get('user_id'),
        rating=data['rating'],
        status=data['status'],
        content=data.get('content'),
        pet_name=data['pet_name']
    )
    try:
        db.session.add(new_feedback)
        db.session.commit()
        return jsonify(new_feedback.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# Get all feedbacks
@app.route("/feedbacks", methods=["GET"])
def get_feedbacks():
    feedbacks = Feedback.query.all()
    return jsonify([f.to_dict() for f in feedbacks])

# Get single feedback
@app.route("/feedbacks/<int:feedback_id>", methods=["GET"])
def get_feedback(feedback_id):
    feedback = Feedback.query.get_or_404(feedback_id)
    return jsonify(feedback.to_dict())

# Update feedback
@app.route("/feedbacks/<int:feedback_id>", methods=["PUT"])
def update_feedback(feedback_id):
    feedback = Feedback.query.get_or_404(feedback_id)
    data = request.get_json()

    feedback.user_id = data.get("user_id", feedback.user_id)
    feedback.rating = data.get("rating", feedback.rating)
    feedback.status = data.get("status", feedback.status)
    feedback.content = data.get("content", feedback.content)
    feedback.pet_name = data.get("pet_name", feedback.pet_name)

    try:
        db.session.commit()
        return jsonify(feedback.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# Delete feedback
@app.route("/feedbacks/<int:feedback_id>", methods=["DELETE"])
def delete_feedback(feedback_id):
    feedback = Feedback.query.get_or_404(feedback_id)
    try:
        db.session.delete(feedback)
        db.session.commit()
        return jsonify({"message": f"Feedback {feedback_id} deleted"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# ================= Routes CRUD for Pet Hotels =================

# Create pet hotel entry
@app.route("/pet_hotels", methods=["POST"])
def create_pet_hotel():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No input data provided"}), 400

    new_entry = PetHotel(
        pet_id=data['pet_id'],
        check_in=data.get('check_in'),
        check_out=data.get('check_out'),
        notes=data.get('notes')
    )
    try:
        db.session.add(new_entry)
        db.session.commit()
        return jsonify(new_entry.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# Get all pet hotel entries
@app.route("/pet_hotels", methods=["GET"])
def get_pet_hotels():
    entries = PetHotel.query.all()
    return jsonify([e.to_dict() for e in entries])

# Get single pet hotel entry
@app.route("/pet_hotels/<int:petboard_id>", methods=["GET"])
def get_pet_hotel(petboard_id):
    entry = PetHotel.query.get_or_404(petboard_id)
    return jsonify(entry.to_dict())

# Update pet hotel entry
@app.route("/pet_hotels/<int:petboard_id>", methods=["PUT"])
def update_pet_hotel(petboard_id):
    entry = PetHotel.query.get_or_404(petboard_id)
    data = request.get_json()

    entry.pet_id = data.get("pet_id", entry.pet_id)
    entry.check_in = data.get("check_in", entry.check_in)
    entry.check_out = data.get("check_out", entry.check_out)
    entry.notes = data.get("notes", entry.notes)

    try:
        db.session.commit()
        return jsonify(entry.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# Delete pet hotel entry
@app.route("/pet_hotels/<int:petboard_id>", methods=["DELETE"])
def delete_pet_hotel(petboard_id):
    entry = PetHotel.query.get_or_404(petboard_id)
    try:
        db.session.delete(entry)
        db.session.commit()
        return jsonify({"message": f"PetHotel {petboard_id} deleted"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# ================= Routes CRUD for PetHouses =================

# Create pethouse
@app.route("/pethouses", methods=["POST"])
def create_pethouse():
    data = request.get_json()
    new_house = PetHouse(
        name=data['name'],
        price=data['price']
    )
    try:
        db.session.add(new_house)
        db.session.commit()
        return jsonify(new_house.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# Get all pethouses
@app.route("/pethouses", methods=["GET"])
def get_pethouses():
    houses = PetHouse.query.all()
    return jsonify([h.to_dict() for h in houses])

# Get single pethouse
@app.route("/pethouses/<int:hotel_id>", methods=["GET"])
def get_pethouse(hotel_id):
    house = PetHouse.query.get_or_404(hotel_id)
    return jsonify(house.to_dict())

# Update pethouse
@app.route("/pethouses/<int:hotel_id>", methods=["PUT"])
def update_pethouse(hotel_id):
    house = PetHouse.query.get_or_404(hotel_id)
    data = request.get_json()
    house.name = data.get("name", house.name)
    house.price = data.get("price", house.price)
    try:
        db.session.commit()
        return jsonify(house.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# Delete pethouse
@app.route("/pethouses/<int:hotel_id>", methods=["DELETE"])
def delete_pethouse(hotel_id):
    house = PetHouse.query.get_or_404(hotel_id)
    try:
        db.session.delete(house)
        db.session.commit()
        return jsonify({"message": f"Pethouse {hotel_id} deleted"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# ================= Routes CRUD for Invoice Hotels =================

# Create invoice hotel
@app.route("/invoice_hotels", methods=["POST"])
def create_invoice_hotel():
    data = request.get_json()
    new_invoice = InvoiceHotel(
        petboard_id=data['petboard_id'],
        hotel_id=data['hotel_id'],
        days=data['days'],
        total=data['total']
    )
    try:
        db.session.add(new_invoice)
        db.session.commit()
        return jsonify(new_invoice.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# Get all invoice hotels
@app.route("/invoice_hotels", methods=["GET"])
def get_invoice_hotels():
    invoices = InvoiceHotel.query.all()
    return jsonify([i.to_dict() for i in invoices])

# Get single invoice hotel
@app.route("/invoice_hotels/<int:in_hotel_id>", methods=["GET"])
def get_invoice_hotel(in_hotel_id):
    invoice = InvoiceHotel.query.get_or_404(in_hotel_id)
    return jsonify(invoice.to_dict())

# Update invoice hotel
@app.route("/invoice_hotels/<int:in_hotel_id>", methods=["PUT"])
def update_invoice_hotel(in_hotel_id):
    invoice = InvoiceHotel.query.get_or_404(in_hotel_id)
    data = request.get_json()
    invoice.petboard_id = data.get("petboard_id", invoice.petboard_id)
    invoice.hotel_id = data.get("hotel_id", invoice.hotel_id)
    invoice.days = data.get("days", invoice.days)
    invoice.total = data.get("total", invoice.total)
    try:
        db.session.commit()
        return jsonify(invoice.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# Delete invoice hotel
@app.route("/invoice_hotels/<int:in_hotel_id>", methods=["DELETE"])
def delete_invoice_hotel(in_hotel_id):
    invoice = InvoiceHotel.query.get_or_404(in_hotel_id)
    try:
        db.session.delete(invoice)
        db.session.commit()
        return jsonify({"message": f"InvoiceHotel {in_hotel_id} deleted"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400


# ================= Run App =================
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)


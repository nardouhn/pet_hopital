
from .extensions import db

# ================= Models =================
class User(db.Model):
    __tablename__ = "users"
    user_id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    user_type = db.Column(db.String(20), nullable=False)
    is_active = db.Column(db.Boolean, nullable=False, server_default=db.text('true'), default=True)

    def to_dict(self):
        pets_count = len(self.pets) if hasattr(self, 'pets') and self.pets is not None else 0
        is_active_val = bool(getattr(self, 'is_active', True))
        status = "Hoạt động" if is_active_val else "Tạm khóa"
        pets_list = [p.to_dict() for p in self.pets] if hasattr(self, 'pets') and self.pets is not None else []
        return {
            "user_id": self.user_id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "email": self.email,
            "user_type": self.user_type,
            "is_active": is_active_val,
            "pets_count": pets_count,
            "pets": pets_list,
            "status": status,
        }


class BlockedToken(db.Model):
    __tablename__ = 'blocked_tokens'
    token = db.Column(db.Text, primary_key=True)
    created_at = db.Column(db.DateTime(timezone=True), server_default=db.text('now()'), nullable=True)

    def __repr__(self):
        return f"<BlockedToken token={self.token[:8]}...>"


class RefreshToken(db.Model):
    __tablename__ = 'refresh_tokens'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id', ondelete='CASCADE'), nullable=False)
    token_hash = db.Column(db.String(255), nullable=False)
    revoked = db.Column(db.Boolean, nullable=False, server_default=db.text('false'), default=False)
    expires_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, server_default=db.func.now())

    user = db.relationship('User', backref=db.backref('refresh_tokens', cascade='all, delete-orphan'))

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'revoked': self.revoked,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }

class Pet(db.Model):
    __tablename__ = "pets"
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
    timeslot = db.Column(db.String(64), nullable=True)
    status = db.Column(appointment_status_enum, nullable=False)
    service = db.Column(db.String(150), nullable=True)
    description = db.Column(db.Text, nullable=True)
    invoice_url = db.Column(db.String(255), nullable=True)
    pet_id = db.Column(db.Integer, db.ForeignKey('pets.pet_id', ondelete='SET NULL'), nullable=True)
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctor.doctor_id', ondelete='SET NULL'), nullable=True)

    created_at = db.Column(db.DateTime, nullable=False, server_default=db.func.now())
    user_id = db.Column(db.Integer, db.ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)

    # Relationships
    user = db.relationship("User", backref=db.backref("appointments", cascade="all, delete"))
    pet = db.relationship("Pet", backref=db.backref("appointments", cascade="all, delete"), foreign_keys=[pet_id])
    doctor = db.relationship("Doctor", backref=db.backref("appointments", cascade="all, delete"), foreign_keys=[doctor_id])

    def to_dict(self):
        return {
            "appointment_id": self.appointment_id,
            "booking_date": self.booking_date.isoformat(),
            "timeslot": self.timeslot,
            "status": self.status,
            "service": self.service,
            "description": self.description,
            "invoice_url": self.invoice_url,
            "pet_id": self.pet_id,
            "pet": self.pet.to_dict() if getattr(self, 'pet', None) else None,
            "doctor_id": self.doctor_id,
            "doctor_name": getattr(self.doctor, 'doctor_name', None) if getattr(self, 'doctor', None) else None,
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
    pet_id = db.Column(db.Integer, db.ForeignKey("pets.pet_id", ondelete="CASCADE"), nullable=False)
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


class Vaccination(db.Model):
    __tablename__ = 'vaccination'
    vaccination_id = db.Column(db.Integer, primary_key=True)
    pet_id = db.Column(db.Integer, db.ForeignKey('pets.pet_id', ondelete='CASCADE'), nullable=False)
    vaccine = db.Column(db.String(150), nullable=False)
    date = db.Column(db.Date, nullable=True)
    notes = db.Column(db.Text, nullable=True)
    doctor_id = db.Column(db.Integer, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, server_default=db.func.now())

    def to_dict(self):
        return {
            'vaccination_id': self.vaccination_id,
            'pet_id': self.pet_id,
            'vaccine': self.vaccine,
            'date': self.date.isoformat() if self.date else None,
            'notes': self.notes,
            'doctor_id': self.doctor_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
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
    pet_id = db.Column(db.Integer, db.ForeignKey("pets.pet_id", ondelete="CASCADE"), nullable=False)
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

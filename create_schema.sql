CREATE DATABASE vet_clinic;

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name  VARCHAR(50) NOT NULL,
    email      VARCHAR(100) NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,
    user_type  VARCHAR(20) NOT NULL
);

CREATE TABLE pet (
    pet_id SERIAL PRIMARY KEY,
    name   VARCHAR(50) NOT NULL,
    breed  VARCHAR(50),
    age    INT,
    user_id INT NOT NULL,
    CONSTRAINT fk_pet_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);

CREATE TYPE doctor_shift_enum AS ENUM (
    'NONE',
    '9-12',
    '12-18',
    '9-13',
    '13-18',
    '9-17',
    '10-18'
);

CREATE TABLE doctor (
    doctor_id SERIAL PRIMARY KEY,
    doctor_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);


CREATE TABLE doctor_slot (
    doctor_slot_id SERIAL PRIMARY KEY,
    shift doctor_shift_enum NOT NULL,
    slot_date DATE NOT NULL,
    doctor_id INT NOT NULL,
    CONSTRAINT fk_doctor_slot_doctor
        FOREIGN KEY (doctor_id)
        REFERENCES doctor(doctor_id)
        ON DELETE CASCADE
);

CREATE TYPE appointment_status_enum AS ENUM (
    'Đang chờ xác nhận',
    'Đặt lịch hẹn thành công',
    'Đã hủy lịch hẹn'
);

CREATE TYPE slot_status_enum AS ENUM (
    'Đang chờ',
    'Đang khám',
    'Đã xong'
);

CREATE TABLE appointment (
    appointment_id SERIAL PRIMARY KEY,
    booking_date DATE NOT NULL,
    status appointment_status_enum NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_id INT NOT NULL,
    CONSTRAINT fk_appointment_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);

CREATE TABLE slot (
    slot_id SERIAL PRIMARY KEY,
    check_in  TIMESTAMP NOT NULL,
    check_out TIMESTAMP DEFAULT NULL,
    status slot_status_enum NOT NULL,
    doctor_slot_id INT NOT NULL,
    appointment_id INT NOT NULL,
    CONSTRAINT fk_slot_doctor_slot
        FOREIGN KEY (doctor_slot_id)
        REFERENCES doctor_slot(doctor_slot_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_slot_appointment
        FOREIGN KEY (appointment_id)
        REFERENCES appointment(appointment_id)
        ON DELETE CASCADE,
    CONSTRAINT uq_slot_appointment
        UNIQUE (appointment_id),
    CONSTRAINT chk_slot_time
        CHECK (check_out IS NULL OR check_out > check_in)
);

CREATE TYPE patient_report_status_enum AS ENUM (
    'Đang chờ khám',
    'Đang khám',
    'Đã khám xong'
);

CREATE TABLE patient_report (
    report_id SERIAL PRIMARY KEY,
    status patient_report_status_enum NOT NULL,
    pet_id INT NOT NULL,
    slot_id INT NOT NULL,
    CONSTRAINT fk_patient_report_pet
        FOREIGN KEY (pet_id)
        REFERENCES pet(pet_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_patient_report_slot
        FOREIGN KEY (slot_id)
        REFERENCES slot(slot_id)
        ON DELETE CASCADE,
    CONSTRAINT uq_patient_report_slot
        UNIQUE (slot_id)
);

CREATE TABLE service (
    service_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price NUMERIC(9, 0) NOT NULL,
    service_category VARCHAR(50) NOT NULL
);

CREATE TABLE medicine (
    medicine_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price NUMERIC(9, 0) NOT NULL
);

CREATE TABLE symptom (
    symptom_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE disease (
    diagnose_id SERIAL PRIMARY KEY,
    disease_name VARCHAR(100) NOT NULL
);

CREATE TABLE invoice (
    invoice_id SERIAL PRIMARY KEY,
    total NUMERIC(9, 0) NOT NULL,
    report_id INT NOT NULL,
    CONSTRAINT fk_invoice_report
        FOREIGN KEY (report_id)
        REFERENCES patient_report(report_id)
        ON DELETE CASCADE,
    CONSTRAINT uq_invoice_report
        UNIQUE (report_id)
);

CREATE TABLE medical_image (
    image_id SERIAL PRIMARY KEY,
    image_type VARCHAR(50) NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    captured_date TIMESTAMP NOT NULL,
    description VARCHAR(255),
    report_id INT NOT NULL,
    CONSTRAINT fk_medical_image_report
        FOREIGN KEY (report_id)
        REFERENCES patient_report(report_id)
        ON DELETE CASCADE
);

CREATE TABLE report_service (
    report_id INT NOT NULL,
    service_id INT NOT NULL,
    PRIMARY KEY (report_id, service_id),
    CONSTRAINT fk_report_service_report
        FOREIGN KEY (report_id)
        REFERENCES patient_report(report_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_report_service_service
        FOREIGN KEY (service_id)
        REFERENCES service(service_id)
        ON DELETE CASCADE
);

CREATE TABLE report_medicine (
    report_id INT NOT NULL,
    medicine_id INT NOT NULL,
    quantity INT NOT NULL,
    PRIMARY KEY (report_id, medicine_id),
    CONSTRAINT fk_report_medicine_report
        FOREIGN KEY (report_id)
        REFERENCES patient_report(report_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_report_medicine_medicine
        FOREIGN KEY (medicine_id)
        REFERENCES medicine(medicine_id)
        ON DELETE CASCADE,
    CONSTRAINT chk_report_medicine_quantity
        CHECK (quantity > 0)
);

CREATE TABLE report_symptom (
    report_id INT NOT NULL,
    symptom_id INT NOT NULL,
    PRIMARY KEY (report_id, symptom_id),
    CONSTRAINT fk_report_symptom_report
        FOREIGN KEY (report_id)
        REFERENCES patient_report(report_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_report_symptom_symptom
        FOREIGN KEY (symptom_id)
        REFERENCES symptom(symptom_id)
        ON DELETE CASCADE
);

CREATE TABLE report_diagnose (
    report_id INT NOT NULL,
    diagnose_id INT NOT NULL,
    PRIMARY KEY (report_id, diagnose_id),
    CONSTRAINT fk_report_diagnose_report
        FOREIGN KEY (report_id)
        REFERENCES patient_report(report_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_report_diagnose_disease
        FOREIGN KEY (diagnose_id)
        REFERENCES disease(diagnose_id)
        ON DELETE CASCADE
);

CREATE TYPE feedback_rating_enum AS ENUM (
    '1', '2', '3', '4', '5'
);

CREATE TYPE feedback_status_enum AS ENUM (
    'Hidden',
    'Show'
);

CREATE TABLE feedback (
    feedback_id SERIAL PRIMARY KEY,
    user_id INT NULL,
    rating feedback_rating_enum NOT NULL,
    status feedback_status_enum NOT NULL,
    content TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    pet_name VARCHAR(100) NOT NULL,
    CONSTRAINT fk_feedback_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE SET NULL
);

CREATE TABLE pet_hotel (
    petboard_id SERIAL PRIMARY KEY,
    pet_id INT NOT NULL,
    check_in TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    check_out TIMESTAMP DEFAULT NULL,
    notes TEXT,
    CONSTRAINT fk_pet_hotel_pet
        FOREIGN KEY (pet_id)
        REFERENCES pet(pet_id)
        ON DELETE CASCADE,
    CONSTRAINT chk_pet_hotel_time
        CHECK (check_out IS NULL OR check_out > check_in)
);

CREATE TABLE pethouse (
    hotel_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price NUMERIC(9, 0) NOT NULL
);

CREATE TABLE invoice_hotel (
    in_hotel_id SERIAL PRIMARY KEY,
    petboard_id INT NOT NULL,
    hotel_id INT NOT NULL,
    days INT NOT NULL,
    total NUMERIC(9, 0) NOT NULL,
    CONSTRAINT fk_invoice_hotel_petboard
        FOREIGN KEY (petboard_id)
        REFERENCES pet_hotel(petboard_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_invoice_hotel_pethouse
        FOREIGN KEY (hotel_id)
        REFERENCES pethouse(hotel_id)
        ON DELETE CASCADE,
    CONSTRAINT uq_invoice_hotel_petboard
        UNIQUE (petboard_id)
);

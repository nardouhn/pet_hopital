-- ============================================
-- DATABASE: vet_clinic
-- ============================================
CREATE DATABASE IF NOT EXISTS vet_clinic CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE vet_clinic;

-- ============================================
-- USER TABLE
-- ============================================
CREATE TABLE user (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    user_type ENUM('admin','doctor','customer') DEFAULT 'customer',
    phone VARCHAR(20),
    address VARCHAR(255),
    city VARCHAR(100),
    country VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- DOCTOR TABLE
-- ============================================
CREATE TABLE doctor (
    doctor_id INT AUTO_INCREMENT PRIMARY KEY,
    doctor_name VARCHAR(150) NOT NULL,
    birth DATE,
    email VARCHAR(150),
    phone VARCHAR(20)
);

-- ============================================
-- PETS TABLE
-- ============================================
CREATE TABLE pets (
    pet_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    breed VARCHAR(100),
    gender ENUM('male','female','unknown'),
    age INT,
    weight DECIMAL(5,2),
    color VARCHAR(50),
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES user(user_id)
);

-- ============================================
-- APPOINTMENT TABLE
-- ============================================
CREATE TABLE appointment (
    appointment_id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE,
    timeslot VARCHAR(100),
    status ENUM('pending','confirmed','completed','cancelled') DEFAULT 'pending',
    pet_id INT,
    user_id INT,
    doctor_id INT,
    FOREIGN KEY (pet_id) REFERENCES pets(pet_id),
    FOREIGN KEY (user_id) REFERENCES user(user_id),
    FOREIGN KEY (doctor_id) REFERENCES doctor(doctor_id)
);

-- ============================================
-- PATIENT REPORT TABLE
-- ============================================
CREATE TABLE patient_report (
    report_id INT AUTO_INCREMENT PRIMARY KEY,
    services TEXT,
    symptoms TEXT,
    medication TEXT,
    status VARCHAR(100),
    doctor_id INT,
    pet_id INT,
    user_id INT,
    appointment_id INT,
    FOREIGN KEY (doctor_id) REFERENCES doctor(doctor_id),
    FOREIGN KEY (pet_id) REFERENCES pets(pet_id),
    FOREIGN KEY (user_id) REFERENCES user(user_id),
    FOREIGN KEY (appointment_id) REFERENCES appointment(appointment_id)
);

-- ============================================
-- INVOICE TABLE
-- ============================================
CREATE TABLE invoice (
    invoice_id INT AUTO_INCREMENT PRIMARY KEY,
    ser_name VARCHAR(100),
    ser_qty INT,
    ser_price DECIMAL(10,2),
    ser_desc TEXT,
    med_name VARCHAR(100),
    med_qty INT,
    med_price DECIMAL(10,2),
    med_desc TEXT,
    total DECIMAL(12,2),
    date DATE,
    note TEXT,
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES user(user_id)
);

-- ============================================
-- PET HOTEL TABLE
-- ============================================
CREATE TABLE Pet_Hotel (
    petboard_id INT AUTO_INCREMENT PRIMARY KEY,
    status ENUM('booked','checked_in','checked_out') DEFAULT 'booked',
    check_in DATE,
    check_out DATE,
    notes TEXT,
    user_id INT,
    pet_id INT,
    FOREIGN KEY (user_id) REFERENCES user(user_id),
    FOREIGN KEY (pet_id) REFERENCES pets(pet_id)
);

-- ============================================
-- DOCTOR SLOTS TABLE
-- ============================================
CREATE TABLE TBL_doctor_slots (
    doctor_slots_id INT AUTO_INCREMENT PRIMARY KEY,
    doctor_id INT,
    start_time DATETIME,
    end_time DATETIME,
    number_of_slots INT,
    duration INT,
    created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (doctor_id) REFERENCES doctor(doctor_id)
);

-- ============================================
-- TIMESLOT TABLE
-- ============================================
CREATE TABLE Timeslot (
    timeslot_id INT AUTO_INCREMENT PRIMARY KEY,
    slot VARCHAR(100),
    user_id INT,
    doctor_slots_id INT,
    FOREIGN KEY (user_id) REFERENCES user(user_id),
    FOREIGN KEY (doctor_slots_id) REFERENCES TBL_doctor_slots(doctor_slots_id)
);

-- ============================================
-- SERVICES TABLE
-- ============================================
CREATE TABLE Services (
    service_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    price DECIMAL(10,2)
);

-- ============================================
-- MEDICATION TABLE
-- ============================================
CREATE TABLE medication (
    medicine_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    quantity INT,
    price DECIMAL(10,2)
);

-- ============================================
-- VACCIN TABLE
-- ============================================
CREATE TABLE Vaccin (
    vaccin_id INT AUTO_INCREMENT PRIMARY KEY,
    name_vaccin VARCHAR(100),
    price DECIMAL(10,2),
    quantity INT
);

-- ============================================
-- SYMPTOM TABLE
-- ============================================
CREATE TABLE symptom (
    symptom_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255)
);

INSERT INTO users (first_name, last_name, email, password, user_type)

-- ===== 1 ADMIN =====
SELECT
    'Vet'    AS first_name,
    'Clinic' AS last_name,
    'admin@vetclinic.com' AS email,
    'pbkdf2:sha256:260000$seed$9c6e4e6d0d8d2f1b6f4d7e5c9b0a8d4e9f0c3b2a1e7d6c5b4a3f2e1d0c9b8a' AS password,
    'admin' AS user_type

UNION ALL

-- ===== 119 CUSTOMER =====
SELECT first_name, last_name, email,
       'pbkdf2:sha256:260000$seed$9c6e4e6d0d8d2f1b6f4d7e5c9b0a8d4e9f0c3b2a1e7d6c5b4a3f2e1d0c9b8a' AS password,
       user_type
FROM (
    SELECT
        fn.fn AS first_name,
        ln.ln AS last_name,
        LOWER(REPLACE(ln.ln, ' ', '')) || '.' ||
        LOWER(REPLACE(fn.fn, ' ', '')) || gs.n || '@vetclinic.com' AS email,
        'customer' AS user_type
    FROM generate_series(1, 300) gs(n)
    CROSS JOIN (
        VALUES
            ('An'),('Bình'),('Chi'),('Dũng'),('Hạnh'),
            ('Huy'),('Lan'),('Minh'),('Ngọc'),('Thảo')
    ) fn(fn)
    CROSS JOIN (
        VALUES
            ('Nguyễn'),('Trần'),('Lê'),('Phạm'),('Hoàng'),
            ('Huỳnh'),('Phan'),('Vũ'),('Võ'),('Đặng')
    ) ln(ln)
    ORDER BY RANDOM()
    LIMIT 119
) customer_users
ON CONFLICT (email) DO NOTHING;


-- =========================
-- 2. Insert PET (random thật sự)
-- =========================
INSERT INTO pets (name, breed, age, user_id)
SELECT
    pet_names[ floor(random() * array_length(pet_names, 1))::int + 1 ],
    pet_breeds[ floor(random() * array_length(pet_breeds, 1))::int + 1 ],
    floor(random() * 15)::int + 1,
    u.user_id
FROM users u
CROSS JOIN (
    SELECT
        ARRAY[
            'Milu','Lulu','Miu','Bông','Mun','Đen','Trắng','Vàng','Đốm','Bon',
            'Bin','Bo','Bé','Cún','Còi','Mập','Tí','Tèo','Tôm','Sóc',
            'Nấm','Gạo','Sữa','Bia','Pepsi','Coca','Kẹo','Mochi','Sushi','Choco',
            'Cacao','Kem','Mít','Xoài','Ổi','Táo','Cherry','Na','Cam','Leo',
            'Lucky','Dollar','Simba','Tom','Jerry','Kitty','Mimi','Péo','Pupu'
        ] AS pet_names,
        ARRAY[
            'Chó ta','Chó Poodle','Chó Pug','Chó Corgi',
            'Chó Phốc sóc (Pomeranian)','Chó Golden Retriever',
            'Chó Labrador Retriever','Chó Husky','Chó Alaska',
            'Chó Shiba Inu','Chó Chihuahua',
            'Chó Dachshund (lạp xưởng)',
            'Mèo ta','Mèo Anh lông ngắn','Mèo Anh lông dài',
            'Mèo Ba Tư','Mèo Xiêm','Mèo Scottish Fold',
            'Mèo mướp','Mèo tam thể',
            'Chuột Hamster','Chuột lang (Guinea pig)',
            'Thỏ cảnh','Nhím kiểng (nhím gai)','Sóc bay'
        ] AS pet_breeds
) data
WHERE u.user_type = 'customer';


INSERT INTO doctor (doctor_name, email, password) VALUES
('Phạm Thị Minh Thư', 'pham.thi.minh.thu@vetclinic.com',
 'pbkdf2:sha256:260000$seed$9c6e4e6d0d8d2f1b6f4d7e5c9b0a8d4e9f0c3b2a1e7d6c5b4a3f2e1d0c9b8a'),

('Nguyễn Tuyết Như', 'nguyen.tuyet.nhu@vetclinic.com',
 'pbkdf2:sha256:260000$seed$9c6e4e6d0d8d2f1b6f4d7e5c9b0a8d4e9f0c3b2a1e7d6c5b4a3f2e1d0c9b8a'),

('Đỗ Thị Mây', 'do.thi.may@vetclinic.com',
 'pbkdf2:sha256:260000$seed$9c6e4e6d0d8d2f1b6f4d7e5c9b0a8d4e9f0c3b2a1e7d6c5b4a3f2e1d0c9b8a'),

('Nguyễn Quốc Hiệu', 'nguyen.quoc.hieu@vetclinic.com',
 'pbkdf2:sha256:260000$seed$9c6e4e6d0d8d2f1b6f4d7e5c9b0a8d4e9f0c3b2a1e7d6c5b4a3f2e1d0c9b8a'),

('Lê Ngọc Toàn', 'le.ngoc.toan@vetclinic.com',
 'pbkdf2:sha256:260000$seed$9c6e4e6d0d8d2f1b6f4d7e5c9b0a8d4e9f0c3b2a1e7d6c5b4a3f2e1d0c9b8a'),

('Vũ Tiến Dũng', 'vu.tien.dung@vetclinic.com',
 'pbkdf2:sha256:260000$seed$9c6e4e6d0d8d2f1b6f4d7e5c9b0a8d4e9f0c3b2a1e7d6c5b4a3f2e1d0c9b8a'),

('Phạm Duy Phương', 'pham.duy.phuong@vetclinic.com',
 'pbkdf2:sha256:260000$seed$9c6e4e6d0d8d2f1b6f4d7e5c9b0a8d4e9f0c3b2a1e7d6c5b4a3f2e1d0c9b8a')
ON CONFLICT (email) DO NOTHING;


-- SEED DOCTOR_SLOT
INSERT INTO doctor_slot (doctor_id, slot_date, shift)
SELECT
    d.doctor_id,
    dates.slot_date,
    CASE
        -- Thứ 7 (6) & Chủ nhật (0)
        WHEN EXTRACT(DOW FROM dates.slot_date) IN (0,6) THEN 'NONE'::doctor_shift_enum
        ELSE
            -- 10% xác suất NONE, còn lại chọn random 1 ca
            CASE 
                WHEN random() < 0.1 THEN 'NONE'::doctor_shift_enum
                ELSE (
                    ARRAY['9-12','12-18','9-13','13-18','9-17','10-18']::doctor_shift_enum[]
                )[floor(random()*6 + 1)::int]
            END
    END AS shift
FROM doctor d
CROSS JOIN (
    SELECT ('2026-01-02'::date + n) AS slot_date
    FROM generate_series(0, 13) AS n
) dates
ORDER BY d.doctor_id, dates.slot_date;


INSERT INTO appointment (booking_date, status, user_id)
SELECT
    ('2026-01-02'::date + (floor(random() * 14)::int) * INTERVAL '1 day')::date AS booking_date,
    'Đang chờ xác nhận'::appointment_status_enum AS status,
    u.user_id
FROM users u
WHERE u.user_type = 'customer'
ORDER BY random()
LIMIT 1000;


INSERT INTO appointment (booking_date, status, user_id)
SELECT
    '2026-01-03'::date AS booking_date,
    'Đặt lịch hẹn thành công'::appointment_status_enum AS status,
    u.user_id
FROM users u
WHERE u.user_type = 'customer'
ORDER BY random()
LIMIT 50;

-- Thêm pet_id cho appointment mới
UPDATE appointment a
SET pet_id = (
    SELECT p.pet_id
    FROM pets p
    WHERE p.user_id = a.user_id
    ORDER BY random()
    LIMIT 1
)
WHERE a.pet_id IS NULL;

-- 2. Cập nhật trạng thái appointment dựa vào doctor_slot
UPDATE appointment a
SET status = CASE
    WHEN EXISTS (
        SELECT 1
        FROM doctor_slot ds
        WHERE ds.slot_date = a.booking_date
          AND ds.shift <> 'NONE'
    )
    THEN 'Đặt lịch hẹn thành công'::appointment_status_enum
    ELSE 'Đã hủy lịch hẹn'::appointment_status_enum
END;

-- 1. Lấy các appointment thành công
WITH valid_appointments AS (
    SELECT a.appointment_id, a.booking_date
    FROM appointment a
    WHERE a.status = 'Đặt lịch hẹn thành công'
),
-- 2. Lấy doctor_slot cùng ngày
doctor_slot_map AS (
    SELECT va.appointment_id, ds.doctor_slot_id, ds.shift, ds.slot_date
    FROM valid_appointments va
    JOIN doctor_slot ds
      ON ds.slot_date = va.booking_date
      AND ds.shift <> 'NONE'
),
-- 3. Chọn 1 doctor_slot ngẫu nhiên cho mỗi appointment
one_slot_per_appointment AS (
    SELECT DISTINCT ON (appointment_id)
        appointment_id, doctor_slot_id, shift, slot_date
    FROM doctor_slot_map
    ORDER BY appointment_id, random()
),
-- 4. Tạo check_in ngẫu nhiên trong shift
slot_times AS (
    SELECT *,
        CASE
            WHEN shift = '9-12' THEN slot_date + interval '9 hour' + random() * interval '3 hour'
            WHEN shift = '12-18' THEN slot_date + interval '12 hour' + random() * interval '6 hour'
            WHEN shift = '9-13' THEN slot_date + interval '9 hour' + random() * interval '4 hour'
            WHEN shift = '13-18' THEN slot_date + interval '13 hour' + random() * interval '5 hour'
            WHEN shift = '9-17' THEN slot_date + interval '9 hour' + random() * interval '8 hour'
            WHEN shift = '10-18' THEN slot_date + interval '10 hour' + random() * interval '8 hour'
            ELSE slot_date + interval '10 hour'  -- default
        END AS check_in
    FROM one_slot_per_appointment
),
slot_final AS (
    SELECT *,
        check_in + interval '30 minute' + random() * interval '30 minute' AS check_out,
        'Đã xong'::slot_status_enum AS status
    FROM slot_times
)
-- 5. Chèn vào slot
INSERT INTO slot (check_in, check_out, status, doctor_slot_id, appointment_id)
SELECT check_in, check_out, status, doctor_slot_id, appointment_id
FROM slot_final
ON CONFLICT (appointment_id) DO NOTHING;

-- 6. Cập nhật các appointment không có slot thành "Đã hủy"
UPDATE appointment a
SET status = 'Đã hủy lịch hẹn'
WHERE a.status = 'Đặt lịch hẹn thành công'
AND NOT EXISTS (
    SELECT 1 FROM slot s
    WHERE s.appointment_id = a.appointment_id
);


-- 5. Seed PATIENT_REPORT từ SLOT
INSERT INTO PATIENT_REPORT (status, pet_id, slot_id)
SELECT
    (
        CASE s.status
            WHEN 'Đang chờ' THEN 'Đang chờ khám'
            WHEN 'Đang khám' THEN 'Đang khám'
            WHEN 'Đã xong' THEN 'Đã khám xong'
        END
    )::patient_report_status_enum,
    p.pet_id,
    s.slot_id
FROM SLOT s
JOIN APPOINTMENT a ON a.appointment_id = s.appointment_id
JOIN LATERAL (
    SELECT p.pet_id
    FROM pets p
    WHERE p.user_id = a.user_id
    ORDER BY random()
    LIMIT 1
) p ON true
WHERE NOT EXISTS (
    SELECT 1 FROM PATIENT_REPORT pr WHERE pr.slot_id = s.slot_id
);

-- 2. Seed dữ liệu dịch vụ (idempotent)
WITH vals(name, price, service_category) AS (
VALUES
('Khám tổng quát', 150000, 'Khám sức khỏe'),
('Khám chuyên sâu', 350000, 'Khám sức khỏe'),
('Tư vấn dinh dưỡng', 100000, 'Khám sức khỏe'),
('Khám nội trú (theo ngày)', 500000, 'Khám sức khỏe'),
('Khám bệnh ngoài da', 200000, 'Khám sức khỏe'),
('Khám tai mũi họng', 150000, 'Khám sức khỏe'),
('Khám mắt', 150000, 'Khám sức khỏe'),
('Kiểm tra xương khớp', 250000, 'Khám sức khỏe'),
('Khám sức khỏe định kỳ', 200000, 'Khám sức khỏe'),
('Tiêm phòng dại', 120000, 'Tiêm ngừa'),
('Tiêm phòng Parvo', 280000, 'Tiêm ngừa'),
('Tiêm phòng Care', 280000, 'Tiêm ngừa'),
('Tiêm phòng viêm gan', 280000, 'Tiêm ngừa'),
('Tiêm phòng leptospirosis', 280000, 'Tiêm ngừa'),
('Tiêm phòng cúm', 200000, 'Tiêm ngừa'),
('Tiêm nhắc lại (tùy loại)', 150000, 'Tiêm ngừa'),
('Tiêm phòng kết hợp', 300000, 'Tiêm ngừa'),
('Phẫu thuật cấp cứu', 3000000, 'Phẫu thuật'),
('Phẫu thuật chỉnh hình', 6000000, 'Phẫu thuật'),
('Phẫu thuật cắt bỏ khối u', 4500000, 'Phẫu thuật'),
('Phẫu thuật mắt', 5000000, 'Phẫu thuật'),
('Phẫu thuật tiêu hóa', 4000000, 'Phẫu thuật'),
('Phẫu thuật tai mũi họng', 3500000, 'Phẫu thuật'),
('Phẫu thuật sinh sản', 4000000, 'Phẫu thuật'),
('Phẫu thuật da', 2500000, 'Phẫu thuật'),
('Triệt sản chó', 1200000, 'Triệt sản'),
('Triệt sản mèo', 1000000, 'Triệt sản'),
('Triệt sản vẹt', 800000, 'Triệt sản'),
('Triệt sản heo đất', 700000, 'Triệt sản'),
('Triệt sản thỏ', 600000, 'Triệt sản'),
('Triệt sản chuột hamster', 500000, 'Triệt sản'),
('Triệt sản các thú nhỏ khác', 400000, 'Triệt sản'),
('Triệt sản combo (2 thú cùng lúc)', 1800000, 'Triệt sản'),
('Xét nghiệm máu', 350000, 'Xét nghiệm'),
('Xét nghiệm nước tiểu', 250000, 'Xét nghiệm'),
('Xét nghiệm ký sinh trùng', 300000, 'Xét nghiệm'),
('Xét nghiệm bệnh truyền nhiễm', 400000, 'Xét nghiệm'),
('Xét nghiệm hormone', 500000, 'Xét nghiệm'),
('X-quang', 500000, 'Xét nghiệm'),
('Siêu âm', 450000, 'Xét nghiệm'),
('Chẩn đoán hình ảnh khác', 600000, 'Xét nghiệm'),
('Cạo vôi răng', 300000, 'Chăm sóc răng miệng'),
('Đánh bóng răng bằng máy siêu âm', 400000, 'Chăm sóc răng miệng'),
('Điều trị nướu, nha chu', 500000, 'Chăm sóc răng miệng'),
('Nhổ răng bệnh lý, răng sữa', 400000, 'Chăm sóc răng miệng'),
('X-quang răng', 450000, 'Chăm sóc răng miệng'),
('Kiểm tra răng định kỳ', 200000, 'Chăm sóc răng miệng'),
('Tư vấn chăm sóc răng', 150000, 'Chăm sóc răng miệng'),
('Cấp cứu nội trú (theo ngày)', 600000, 'Cấp cứu'),
('Cấp cứu ngoại trú', 500000, 'Cấp cứu'),
('Cấp cứu chấn thương', 1000000, 'Cấp cứu'),
('Cấp cứu ngộ độc', 900000, 'Cấp cứu'),
('Cấp cứu bệnh lý cấp tính', 800000, 'Cấp cứu'),
('Hồi sức cấp cứu', 1200000, 'Cấp cứu'),
('Theo dõi hậu phẫu', 500000, 'Cấp cứu'),
('Tắm rửa', 150000, 'Chăm sóc & Spa'),
('Cắt tỉa lông', 300000, 'Chăm sóc & Spa'),
('Vệ sinh tai, móng', 100000, 'Chăm sóc & Spa'),
('Spa toàn diện', 600000, 'Chăm sóc & Spa'),
('Sấy chải tạo kiểu', 350000, 'Chăm sóc & Spa'),
('Chăm sóc da lông chuyên biệt', 500000, 'Chăm sóc & Spa'),
('Tắm thảo dược', 400000, 'Chăm sóc & Spa'),
('Massage thư giãn', 300000, 'Chăm sóc & Spa'),
('Tư vấn sức khỏe tổng quát', 150000, 'Tư vấn và điều trị'),
('Tư vấn dinh dưỡng', 100000, 'Tư vấn và điều trị'),
('Tư vấn hành vi', 200000, 'Tư vấn và điều trị'),
('Tư vấn tâm lý thú cưng', 200000, 'Tư vấn và điều trị'),
('Điều trị nội trú (theo ngày)', 500000, 'Tư vấn và điều trị'),
('Điều trị bệnh mãn tính', 400000, 'Tư vấn và điều trị'),
('Tư vấn phòng ngừa bệnh', 150000, 'Tư vấn và điều trị'),
('Theo dõi điều trị tại nhà', 300000, 'Tư vấn và điều trị')
)
INSERT INTO service (name, price, service_category)
SELECT v.name, v.price, v.service_category
FROM vals v
WHERE NOT EXISTS (
    SELECT 1 FROM service s WHERE s.name = v.name
);

-- Seed MEDICINE (idempotent)
WITH vals(name, price) AS (
VALUES
('Frontline', 150000),
('Advantix', 180000),
('NexGard', 250000),
('Bravecto', 300000),
('Heartgard', 200000),
('Revolution', 220000),
('Milbemax', 180000),
('Drontal', 200000),
('Ivermectin', 100000),
('Doxycycline', 150000),
('Amoxicillin', 120000),
('Cefalexin', 150000),
('Enrofloxacin', 200000),
('Metronidazole', 130000),
('Prednisolone', 180000),
('Rimadyl', 250000),
('Ketoprofen', 200000),
('Famotidine', 150000),
('Omeprazole', 200000),
('Vitamin B Complex', 100000),
('Vitamin C', 80000),
('Omega-3 Fish Oil', 150000),
('Calcium supplement', 100000),
('Iron supplement', 120000),
('Multivitamins Pet', 180000),
('Rabvac', 120000),
('Vanguard', 280000),
('Nobivac', 280000),
('Felocell', 300000),
('Duramune', 250000),
('Tricat', 280000),
('Chlorhexidine 4%', 70000),
('Betadine 10%', 50000),
('Hydrogen Peroxide 3%', 40000),
('Epi-Otic', 150000),
('Mometamax', 200000),
('Vetoxy', 100000),
('Antiseptic Spray', 100000),
('Eye drops', 120000),
('Ear drops', 100000),
('Flea & Tick Spray', 150000),
('Shampoo trị ve rận', 120000),
('Dental Gel', 200000),
('Analgesic gel', 150000),
('Hydrocortisone cream', 150000),
('Anti-fungal cream', 150000),
('Panacur', 180000),
('Cestex', 200000),
('Heartworm treatment', 250000),
('Pet Antihistamine', 100000),
('Chlorpheniramine', 120000),
('Diphenhydramine', 150000),
('Meloxicam', 200000),
('Sucralfate', 150000),
('Enzyme supplement', 120000),
('Probiotic Pet', 180000),
('Fluoxetine', 200000),
('Amitriptyline', 180000),
('Insulin', 800000),
('Thyroxine', 400000),
('Ketamine', 600000),
('Diazepam', 350000),
('Propofol', 900000),
('Atropine', 250000),
('Epinephrine', 200000)
)
INSERT INTO medicine (name, price)
SELECT v.name, v.price FROM vals v
WHERE NOT EXISTS (SELECT 1 FROM medicine m WHERE m.name = v.name);


-- Seed SYMPTOM (idempotent)
WITH vals(name) AS (
VALUES
('Chảy nước mũi'),
('Hắt hơi liên tục'),
('Ho'),
('Thở gấp'),
('Thở khò khè'),
('Nôn mửa'),
('Tiêu chảy'),
('Táo bón'),
('Chán ăn'),
('Giảm cân'),
('Tăng cân bất thường'),
('Lười vận động'),
('Mệt mỏi'),
('Sốt'),
('Rối loạn hành vi'),
('Cào cắn liên tục'),
('Ngứa da'),
('Rụng lông nhiều'),
('Lông xơ rối'),
('Viêm da'),
('Sưng khớp'),
('Đi lại khó khăn'),
('Liệt chi'),
('Co giật'),
('Lác mắt'),
('Mắt đỏ'),
('Chảy nước mắt'),
('Ngứa tai'),
('Viêm tai'),
('Hôi miệng'),
('Chảy máu chân răng'),
('Hoại tử răng'),
('Tiểu tiện bất thường'),
('Đi tiểu nhiều'),
('Tiểu ra máu'),
('Tăng uống nước'),
('Nước tiểu đậm'),
('Nôn ra máu'),
('Phồng rộp da'),
('Lở loét'),
('Xuất huyết dưới da'),
('Khó thở'),
('Thở hổn hển'),
('Chảy máu cam'),
('Đau bụng'),
('Sưng bụng'),
('Nôn sau ăn'),
('Nôn thức ăn chưa tiêu'),
('Biếng ăn'),
('Ăn quá nhiều'),
('Thèm ăn lạ'),
('Khó nuốt'),
('Ợ hơi'),
('Ợ chua'),
('Hôi miệng nặng'),
('Tiêu chảy kéo dài'),
('Phân lỏng'),
('Phân có máu'),
('Tiêu chảy có mủ'),
('Lười uống nước'),
('Khát nước bất thường'),
('Ngủ nhiều'),
('Tỉnh táo ít'),
('Thay đổi giọng kêu'),
('Gầm gừ'),
('Cào ghế'),
('Cào cửa'),
('Rung mình'),
('Run rẩy'),
('Rối loạn tiêu hóa'),
('Sưng hạch bạch huyết'),
('Biểu hiện đau khi chạm'),
('Thay đổi hành vi xã hội'),
('Thường ẩn nấp'),
('Thường gặm cắn vật lạ'),
('Nổi mụn'),
('Nổi nốt đỏ'),
('Tăng nhịp tim'),
('Giảm nhịp tim'),
('Thở nhanh khi ngủ'),
('Hơi thở hôi'),
('Co rút cơ bắp')
)
INSERT INTO symptom (name)
SELECT v.name FROM vals v
WHERE NOT EXISTS (SELECT 1 FROM symptom s WHERE s.name = v.name);


-- Seed DISEASE (idempotent)
WITH vals(disease_name) AS (
VALUES
('Bệnh dại'),
('Care chó'),
('Parvo chó'),
('Viêm gan truyền nhiễm chó'),
('Ho cũi chó'),
('Viêm ruột do coronavirus'),
('Nhiễm giun đũa'),
('Nhiễm giun móc'),
('Nhiễm sán dây'),
('Nhiễm cầu trùng'),
('Nhiễm Giardia'),
('Viêm da dị ứng'),
('Viêm da do nấm'),
('Ghẻ'),
('Ve ký sinh'),
('Bọ chét'),
('Viêm tai ngoài'),
('Viêm tai giữa'),
('Viêm kết mạc'),
('Viêm giác mạc'),
('Đục thủy tinh thể'),
('Tăng nhãn áp'),
('Viêm nướu răng'),
('Cao răng'),
('Viêm nha chu'),
('Viêm dạ dày'),
('Viêm ruột'),
('Tiêu chảy cấp'),
('Táo bón'),
('Viêm tụy'),
('Béo phì'),
('Suy dinh dưỡng'),
('Thiếu máu'),
('Suy thận mạn'),
('Suy gan'),
('Viêm bàng quang'),
('Sỏi tiết niệu'),
('Nhiễm trùng đường tiết niệu'),
('Viêm tử cung'),
('U vú'),
('Viêm tinh hoàn'),
('Viêm tuyến tiền liệt'),
('Mang thai giả'),
('Động dục kéo dài'),
('Viêm khớp'),
('Thoái hóa khớp'),
('Loạn sản hông'),
('Gãy xương'),
('Trật khớp'),
('Chấn thương phần mềm'),
('Dị vật đường tiêu hóa'),
('Ngộ độc thực phẩm'),
('Ngộ độc hóa chất'),
('Dị ứng thức ăn'),
('Viêm mũi'),
('Viêm xoang'),
('Viêm phổi'),
('Hen phế quản'),
('Suy tim'),
('Bệnh van tim'),
('Rối loạn nhịp tim'),
('Động kinh'),
('Viêm não'),
('Viêm tủy sống'),
('Rối loạn tiền đình'),
('Stress'),
('Trầm cảm ở thú cưng'),
('Rối loạn hành vi'),
('Viêm da do vi khuẩn'),
('U da'),
('Ung thư hạch'),
('Bệnh giảm bạch cầu mèo'),
('Viêm phúc mạc truyền nhiễm mèo'),
('AIDS mèo'),
('Viêm mũi truyền nhiễm mèo'),
('Viêm lợi tăng sản mèo'),
('Bệnh thận đa nang mèo'),
('Rối loạn tuyến giáp mèo'),
('Viêm tuyến giáp'),
('Đái tháo đường'),
('Hội chứng Cushing'),
('Suy tuyến thượng thận'),
('Bệnh da đen ở chuột hamster'),
('Bệnh ướt đuôi ở hamster'),
('Sai khớp răng ở chuột'),
('Viêm túi má hamster'),
('Nhiễm mạt ở chuột'),
('Viêm phổi ở chuột'),
('Áp xe'),
('Viêm mô tế bào'),
('Sốc nhiệt'),
('Hạ thân nhiệt'),
('Mất nước'),
('Rối loạn điện giải'),
('Viêm tuyến hậu môn'),
('Sa trực tràng'),
('Thoát vị'),
('U mỡ'),
('Ung thư da'),
('Nhiễm nấm men')
)
INSERT INTO disease (disease_name)
SELECT v.disease_name FROM vals v
WHERE NOT EXISTS (SELECT 1 FROM disease d WHERE d.disease_name = v.disease_name);


INSERT INTO invoice (total, report_id)
SELECT
    0 AS total,
    pr.report_id
FROM patient_report pr
WHERE pr.status = 'Đã khám xong'
  AND NOT EXISTS (
      SELECT 1
      FROM invoice i
      WHERE i.report_id = pr.report_id
  );


-- =========================================
-- Seed bảng MEDICAL_IMAGE từ danh sách image_map
-- =========================================

INSERT INTO medical_image (
    image_type,
    image_url,
    captured_date,
    description,
    report_id
)
SELECT
    im.image_type,
    'vetclinicimage/' || im.image_type || '/' || im.image_type || '_' || (floor(random()*10)+1)::int || '.jpg' AS image_url,
    s.check_in + (floor(random() * EXTRACT(EPOCH FROM s.check_out - s.check_in)) * interval '1 second') AS captured_date,
    im.description,
    pr.report_id
FROM patient_report pr
JOIN slot s ON s.slot_id = pr.slot_id
CROSS JOIN (
    VALUES
    ('X_RAY', 'Gãy xương sườn bên phải'),
    ('ULTRASOUND', 'Gan to, nhu mô không đồng nhất'),
    ('CT_SCAN', 'Khối u vùng xoang mũi xâm lấn xương'),
    ('MRI', 'Thoát vị đĩa đệm chèn ép tủy sống'),
    ('ENDOSCOPY', 'Viêm loét dạ dày, xuất huyết nhẹ'),
    ('DOPPLER', 'Dòng máu qua van tim giảm'),
    ('CLINICAL_PHOTO', 'Thú cưng mệt mỏi, lông xù, gầy sút'),
    ('WOUND', 'Vết thương hở nhiễm trùng vùng đùi'),
    ('SKIN_LESION', 'Tổn thương da dạng mảng, rụng lông'),
    ('EAR', 'Viêm tai ngoài, nhiều dịch mủ'),
    ('EYE', 'Loét giác mạc mắt trái'),
    ('ORAL', 'Cao răng nặng, viêm lợi chảy máu'),
    ('ABDOMEN', 'Bụng trướng, nghi tích dịch'),
    ('LIMB', 'Sưng khớp gối, hạn chế vận động'),
    ('PRE_SURGERY', 'Khối u tuyến vú trước phẫu thuật'),
    ('INTRA_SURGERY', 'Cắt bỏ khối u, mô hoại tử'),
    ('POST_SURGERY', 'Vết mổ khô, không sưng'),
    ('PROCEDURE', 'Đặt catheter tĩnh mạch thành công'),
    ('LAB_RESULT', 'Bạch cầu tăng cao bất thường'),
    ('BLOOD_TEST', 'Thiếu máu, hồng cầu giảm'),
    ('URINE_TEST', 'Nước tiểu đục, nhiều bạch cầu'),
    ('FECAL_TEST', 'Phát hiện trứng giun móc'),
    ('MICROSCOPE', 'Quan sát thấy ký sinh trùng Demodex'),
    ('RAPID_TEST', 'Test Parvo dương tính'),
    ('FOLLOW_UP', 'Vết thương lành tốt sau 7 ngày'),
    ('PROGRESS', 'Khối u giảm kích thước sau điều trị'),
    ('COMPARISON', 'Tổn thương da cải thiện rõ rệt'),
    ('PATIENT_ID', 'Ảnh nhận diện chó lông vàng, đeo vòng cổ đỏ'),
    ('OWNER_DOCUMENT', 'Giấy cam kết phẫu thuật đã ký')
) AS im(image_type, description)
WHERE random() < 0.15;

-- 2. Seed REPORT_SERVICE (mỗi report tối đa 3 service)
WITH max_service_per_report AS (
    SELECT
        pr.report_id,
        FLOOR(1 + random() * 3)::int AS max_service
    FROM patient_report pr
    WHERE pr.status = 'Đã khám xong'
)
INSERT INTO report_service (report_id, service_id)
SELECT
    r.report_id,
    s.service_id
FROM max_service_per_report r
JOIN LATERAL (
    SELECT s.service_id
    FROM service s
    ORDER BY random()
    LIMIT r.max_service
) s ON true
ON CONFLICT (report_id, service_id) DO NOTHING;


-- 3. Seed REPORT_MEDICINE (ngẫu nhiên 1-4 medicine mỗi report)
INSERT INTO report_medicine (report_id, medicine_id, quantity)
SELECT
    t.report_id,
    t.medicine_id,
    FLOOR(1 + random() * 10)::int AS quantity
FROM (
    SELECT
        pr.report_id,
        m.medicine_id,
        ROW_NUMBER() OVER (
            PARTITION BY pr.report_id
            ORDER BY random()
        ) AS rn
    FROM patient_report pr
    CROSS JOIN medicine m
    WHERE pr.status = 'Đã khám xong'
) t
WHERE t.rn <= FLOOR(1 + random() * 4)::int
ON CONFLICT (report_id, medicine_id) DO NOTHING;

-- 4. Seed REPORT_SYMPTOM (ngẫu nhiên 1-5 symptom mỗi report)
INSERT INTO report_symptom (report_id, symptom_id)
SELECT
    t.report_id,
    t.symptom_id
FROM (
    SELECT
        pr.report_id,
        s.symptom_id,
        ROW_NUMBER() OVER (
            PARTITION BY pr.report_id
            ORDER BY random()
        ) AS rn
    FROM patient_report pr
    CROSS JOIN symptom s
) t
WHERE t.rn <= FLOOR(1 + random() * 5)::int
ON CONFLICT (report_id, symptom_id) DO NOTHING;

-- 5. Seed REPORT_DIAGNOSE (ngẫu nhiên 1-3 diagnose mỗi report)
INSERT INTO report_diagnose (report_id, diagnose_id)
SELECT
    t.report_id,
    t.diagnose_id
FROM (
    SELECT
        pr.report_id,
        d.diagnose_id,
        ROW_NUMBER() OVER (
            PARTITION BY pr.report_id
            ORDER BY random()
        ) AS rn
    FROM patient_report pr
    CROSS JOIN disease d
) t
WHERE t.rn <= FLOOR(1 + random() * 3)::int
ON CONFLICT (report_id, diagnose_id) DO NOTHING;



-- UPDATE invoice i
-- SET total = t.service_total + t.medicine_total
-- FROM (
--     SELECT
--         pr.report_id,
--         COALESCE(SUM(s.price), 0) AS service_total,
--         COALESCE(SUM(m.price * rm.quantity), 0) AS medicine_total
--     FROM patient_report pr
--     LEFT JOIN report_service rs
--         ON pr.report_id = rs.report_id
--     LEFT JOIN service s
--         ON rs.service_id = s.service_id
--     LEFT JOIN report_medicine rm
--         ON pr.report_id = rm.report_id
--     LEFT JOIN medicine m
--         ON rm.medicine_id = m.medicine_id
--     GROUP BY pr.report_id
-- ) t
-- WHERE i.report_id = t.report_id;

UPDATE invoice i
SET total = st.service_total + mt.medicine_total
FROM patient_report pr
CROSS JOIN LATERAL (
    SELECT COALESCE(SUM(s.price), 0) AS service_total
    FROM report_service rs
    JOIN service s ON s.service_id = rs.service_id
    WHERE rs.report_id = pr.report_id
) st
CROSS JOIN LATERAL (
    SELECT COALESCE(SUM(m.price * rm.quantity), 0) AS medicine_total
    FROM report_medicine rm
    JOIN medicine m ON m.medicine_id = rm.medicine_id
    WHERE rm.report_id = pr.report_id
) mt
WHERE i.report_id = pr.report_id;


-- Seed feedback
INSERT INTO feedback (
    user_id, rating, status, content, created_at, pet_name
)
SELECT
    u.user_id,
    CASE 
        WHEN random() < 0.8 THEN '5'::feedback_rating_enum
        ELSE '4'::feedback_rating_enum
    END AS rating,
    CASE
        WHEN random() < 0.9 THEN 'Show'::feedback_status_enum
        ELSE 'Hidden'::feedback_status_enum
    END AS status,
    CASE
        WHEN random() < 0.5 THEN 'Bác sĩ rất tận tâm, giải thích rõ ràng tình trạng của thú cưng. Tôi rất yên tâm.'
        WHEN random() < 0.7 THEN 'Dịch vụ tốt, nhân viên thân thiện, phòng khám sạch sẽ.'
        WHEN random() < 0.85 THEN 'Thú cưng của tôi hồi phục rất nhanh sau điều trị, cảm ơn bệnh viện.'
        ELSE 'Trải nghiệm rất hài lòng, sẽ tiếp tục quay lại khi cần.'
    END AS content,
    timestamp '2026-01-02'
        + interval '1 day' * floor(random() * 14)
        + interval '1 hour' * floor(random() * 24)
        + interval '1 minute' * floor(random() * 60) AS created_at,
    p.name AS pet_name
FROM users u
-- Chỉ lấy user là customer
JOIN LATERAL (
    SELECT name
    FROM pets
    WHERE pets.user_id = u.user_id
    ORDER BY random()
    LIMIT 1
) p ON true
WHERE u.user_type = 'customer'
ORDER BY random()
LIMIT 100;

-- 1. Seed PET_HOTEL
INSERT INTO pet_hotel (
    pet_id,
    check_in,
    check_out,
    notes
)
SELECT
    p.pet_id,
    -- check_in: ngẫu nhiên trong 2026-01-02 → 2026-01-15
    check_in_time,
    -- check_out: sau check_in từ 1–3 ngày; một số trường hợp để NULL (đang ở)
    CASE
        WHEN random() < 0.3 THEN NULL
        ELSE LEAST(check_in_time + interval '1 day' * stay_days, '2026-01-15'::timestamp + interval '23:59:59')
    END AS check_out,
    -- notes dịch vụ trông giữ thú cưng
    CASE
        WHEN random() < 0.15 THEN 'Thú cưng hiền, quen chuồng, ăn uống bình thường.'
        WHEN random() < 0.30 THEN 'Cần cho ăn thức ăn riêng do dị ứng.'
        WHEN random() < 0.45 THEN 'Thú cưng hơi nhút nhát, cần thời gian làm quen.'
        WHEN random() < 0.60 THEN 'Đã tiêm phòng đầy đủ, sức khỏe ổn định.'
        WHEN random() < 0.75 THEN 'Cần dắt đi dạo mỗi ngày theo yêu cầu chủ nuôi.'
        WHEN random() < 0.90 THEN 'Thú cưng năng động, cần không gian vận động.'
        ELSE 'Theo dõi sát trong 1–2 ngày đầu do mới gửi lần đầu.'
    END AS notes
FROM (
    SELECT
        p.pet_id,
        '2026-01-02'::timestamp
        + interval '1 day' * floor(random() * 14)
        + interval '1 hour' * floor(random() * 24)
        + interval '1 minute' * floor(random() * 60) AS check_in_time,
        floor(1 + random() * 3)::int AS stay_days
    FROM pets p
) AS p
LIMIT 60;

-- 2. Seed PETHOUSE (idempotent)
WITH vals(name, price) AS (
VALUES
('Phòng Tiêu Chuẩn - Thú nhỏ', 120000),
('Phòng Tiêu Chuẩn - Thú vừa', 150000),
('Phòng Tiêu Chuẩn - Thú lớn', 180000),
('Phòng Thoáng Mát Có Quạt', 200000),
('Phòng Điều Hòa Cơ Bản', 250000),
('Phòng Điều Hòa Cao Cấp', 300000),
('Phòng VIP Riêng Biệt', 350000),
('Phòng VIP Có Camera Giám Sát', 400000),
('Phòng Luxury - Không Gian Rộng', 450000),
('Phòng Suite Đặc Biệt 5 Sao', 500000)
)
INSERT INTO pethouse (name, price)
SELECT v.name, v.price FROM vals v
WHERE NOT EXISTS (SELECT 1 FROM pethouse h WHERE h.name = v.name);


-- 3. Seed INVOICE_HOTEL
WITH ph_cte AS (
    SELECT ph.petboard_id,
           EXTRACT(DAY FROM (ph.check_out - ph.check_in))::int AS days,
           ROW_NUMBER() OVER () AS rn_ph
    FROM pet_hotel ph
    WHERE ph.check_out IS NOT NULL
),
hotel_cte AS (
    SELECT h.hotel_id,
           ROW_NUMBER() OVER (ORDER BY random()) AS rn_h
    FROM pethouse h
)
INSERT INTO invoice_hotel (petboard_id, hotel_id, days, total)
SELECT p.petboard_id,
       h.hotel_id,
       p.days,
       0
FROM ph_cte p
JOIN hotel_cte h
  ON (p.rn_ph % (SELECT COUNT(*) FROM pethouse)) + 1 = h.rn_h
WHERE NOT EXISTS (SELECT 1 FROM invoice_hotel ih2 WHERE ih2.petboard_id = p.petboard_id);


-- 4. Cập nhật tổng tiền
UPDATE invoice_hotel ih
SET total = ih.days * h.price
FROM pethouse h
WHERE ih.hotel_id = h.hotel_id;
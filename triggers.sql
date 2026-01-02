/* ============================================================
   1. APPOINTMENT: kiểm tra doctor_slot khi tạo appointment
   ============================================================ */
CREATE OR REPLACE FUNCTION trg_check_appointment_doctor_slot()
RETURNS TRIGGER AS $$
DECLARE
    v_has_valid_slot BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM doctor_slot ds
        WHERE ds.slot_date = NEW.booking_date
          AND ds.shift <> 'NONE'
    )
    INTO v_has_valid_slot;

    IF v_has_valid_slot THEN
        NEW.status := 'Đặt lịch hẹn thành công';
    ELSE
        NEW.status := 'Đã hủy lịch hẹn';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_insert_appointment_check_doctor
BEFORE INSERT ON appointment
FOR EACH ROW
EXECUTE FUNCTION trg_check_appointment_doctor_slot();



/* ============================================================
   2. SLOT: chọn doctor_slot phù hợp & ưu tiên slot rảnh
   ============================================================ */
CREATE OR REPLACE FUNCTION trg_assign_best_doctor_slot()
RETURNS TRIGGER AS $$
DECLARE
    v_doctor_slot_id INT;
    v_shift doctor_shift_enum;
    v_start_time TIME;
    v_end_time TIME;
BEGIN
    /* Chọn doctor_slot:
       - đúng ngày
       - shift != NONE
       - ưu tiên doctor_slot chưa có slot
       - hoặc slot gần nhất đã xong
    */
    SELECT ds.doctor_slot_id, ds.shift
    INTO v_doctor_slot_id, v_shift
    FROM doctor_slot ds
    LEFT JOIN slot s ON s.doctor_slot_id = ds.doctor_slot_id
    WHERE ds.slot_date = NEW.check_in::date
      AND ds.shift <> 'NONE'
    GROUP BY ds.doctor_slot_id, ds.shift
    ORDER BY
        COUNT(s.slot_id) FILTER (WHERE s.status <> 'Đã xong') ASC,
        RANDOM()
    LIMIT 1;

    IF v_doctor_slot_id IS NULL THEN
        UPDATE appointment
        SET status = 'Đã hủy lịch hẹn'
        WHERE appointment_id = NEW.appointment_id;
        RETURN NULL;
    END IF;

    /* Map shift → thời gian */
    IF v_shift = '9-12'  THEN v_start_time := '09:00'; v_end_time := '12:00';
    ELSIF v_shift = '9-13' THEN v_start_time := '09:00'; v_end_time := '13:00';
    ELSIF v_shift = '9-17' THEN v_start_time := '09:00'; v_end_time := '17:00';
    ELSIF v_shift = '10-18' THEN v_start_time := '10:00'; v_end_time := '18:00';
    ELSIF v_shift = '12-18' THEN v_start_time := '12:00'; v_end_time := '18:00';
    ELSIF v_shift = '13-18' THEN v_start_time := '13:00'; v_end_time := '18:00';
    ELSE
        UPDATE appointment
        SET status = 'Đã hủy lịch hẹn'
        WHERE appointment_id = NEW.appointment_id;
        RETURN NULL;
    END IF;

    /* Check check_in nằm trong ca */
    IF NEW.check_in::time < v_start_time
       OR NEW.check_in::time > v_end_time THEN
        UPDATE appointment
        SET status = 'Đã hủy lịch hẹn'
        WHERE appointment_id = NEW.appointment_id;
        RETURN NULL;
    END IF;

    NEW.doctor_slot_id := v_doctor_slot_id;
    NEW.status := 'Đang chờ';

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_insert_slot_assign_doctor
BEFORE INSERT ON slot
FOR EACH ROW
EXECUTE FUNCTION trg_assign_best_doctor_slot();



/* ============================================================
   3. SLOT: slot sau phải chờ slot trước check_out
   ============================================================ */
CREATE OR REPLACE FUNCTION trg_block_slot_if_previous_not_finished()
RETURNS TRIGGER AS $$
DECLARE
    v_conflict BOOLEAN;
BEGIN
    -- CHỈ kiểm tra khi chuyển sang trạng thái "Đang khám"
    IF OLD.status <> 'Đang khám'
       AND NEW.status = 'Đang khám' THEN

        SELECT EXISTS (
            SELECT 1
            FROM slot s
            WHERE s.doctor_slot_id = NEW.doctor_slot_id
              AND s.slot_id <> NEW.slot_id
              AND s.check_in < NEW.check_in
              AND (
                    s.check_out IS NULL
                    OR s.check_out > NEW.check_in
                  )
        )
        INTO v_conflict;

        IF v_conflict THEN
            RAISE EXCEPTION
            'Không thể bắt đầu slot: vẫn còn slot trước chưa check_out';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS before_update_slot_status_queue ON slot;

CREATE TRIGGER before_update_slot_status_queue
BEFORE UPDATE OF status ON slot
FOR EACH ROW
EXECUTE FUNCTION trg_block_slot_if_previous_not_finished();



/* ============================================================
   4. SLOT: đồng bộ slot.status ↔ patient_report.status
   ============================================================ */
CREATE OR REPLACE FUNCTION trg_sync_slot_patient_report()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE patient_report
    SET status =
        CASE NEW.status
            WHEN 'Đang chờ' THEN 'Đang chờ khám'
            WHEN 'Đang khám' THEN 'Đang khám'
            WHEN 'Đã xong' THEN 'Đã khám xong'
            ELSE status
        END
    WHERE slot_id = NEW.slot_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_update_slot_sync_report
AFTER UPDATE OF status ON slot
FOR EACH ROW
EXECUTE FUNCTION trg_sync_slot_patient_report();



/* ============================================================
   5. SLOT: validate check_out > check_in
   ============================================================ */
CREATE OR REPLACE FUNCTION trg_validate_check_out()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.check_out IS NOT NULL
       AND NEW.check_out <= NEW.check_in THEN
        RAISE EXCEPTION
        'check_out phải lớn hơn check_in';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_update_slot_time_validate
BEFORE UPDATE OF check_out ON slot
FOR EACH ROW
EXECUTE FUNCTION trg_validate_check_out();

CREATE OR REPLACE FUNCTION trg_sync_report_to_slot()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'Đã khám xong' THEN
        UPDATE slot
        SET status = 'Đã xong'
        WHERE slot_id = NEW.slot_id
          AND status <> 'Đã xong';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS after_update_report_sync_slot ON patient_report;

CREATE TRIGGER after_update_report_sync_slot
AFTER UPDATE OF status ON patient_report
FOR EACH ROW
EXECUTE FUNCTION trg_sync_report_to_slot();


-- ============================================
-- Trigger: Update invoice total when report finished
-- ============================================

CREATE OR REPLACE FUNCTION trg_update_invoice_total_when_report_done()
RETURNS TRIGGER AS $$
DECLARE
    v_service_total  NUMERIC(9,0);
    v_medicine_total NUMERIC(9,0);
BEGIN
    -- Chỉ xử lý khi status chuyển sang 'Đã khám xong'
    IF NEW.status = 'Đã khám xong'
       AND OLD.status IS DISTINCT FROM 'Đã khám xong' THEN

        -- Tổng tiền dịch vụ
        SELECT COALESCE(SUM(s.price), 0)
        INTO v_service_total
        FROM report_service rs
        JOIN service s ON s.service_id = rs.service_id
        WHERE rs.report_id = NEW.report_id;

        -- Tổng tiền thuốc (price * quantity)
        SELECT COALESCE(SUM(m.price * rm.quantity), 0)
        INTO v_medicine_total
        FROM report_medicine rm
        JOIN medicine m ON m.medicine_id = rm.medicine_id
        WHERE rm.report_id = NEW.report_id;

        -- Update invoice
        UPDATE invoice
        SET total = v_service_total + v_medicine_total
        WHERE report_id = NEW.report_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_update_patient_report_update_invoice
AFTER UPDATE OF status ON patient_report
FOR EACH ROW
EXECUTE FUNCTION trg_update_invoice_total_when_report_done();

-- ============================================
-- Trigger: Update invoice_hotel total when pet_hotel check_out is set
-- ============================================

CREATE OR REPLACE FUNCTION trg_update_invoice_hotel_total()
RETURNS TRIGGER AS $$
DECLARE
    v_days  INT;
    v_price NUMERIC(9,0);
BEGIN
    -- Chỉ xử lý khi check_out được nhập
    IF NEW.check_out IS NOT NULL
       AND (OLD.check_out IS NULL OR OLD.check_out IS DISTINCT FROM NEW.check_out) THEN

        -- Tính số ngày lưu trú
        v_days := (NEW.check_out::date - NEW.check_in::date);

        -- Lấy giá phòng
        SELECT ph.price
        INTO v_price
        FROM invoice_hotel ih
        JOIN pethouse ph ON ph.hotel_id = ih.hotel_id
        WHERE ih.petboard_id = NEW.petboard_id;

        -- Update invoice_hotel
        UPDATE invoice_hotel
        SET total = v_days * v_price,
            days  = v_days
        WHERE petboard_id = NEW.petboard_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_update_pet_hotel_checkout
AFTER UPDATE OF check_out ON pet_hotel
FOR EACH ROW
EXECUTE FUNCTION trg_update_invoice_hotel_total();

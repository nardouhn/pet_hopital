// 1. Sửa tên biến import cho đồng nhất với bên dưới
const Appointment = require("../Models/Appointment"); 
const { successResponse, errorResponse } = require("../helpers/successAndErrorResponse");
const { Op } = require("sequelize");

/* ================= CREATE APPOINTMENT ================= */
module.exports.createAppointment = async (req, res) => {
  try {
    const { ownerName, petName, petBreed, service, date, timeslot, symptoms } = req.body;

    // Lấy userId từ middleware authenticator đã gắn vào req
    const userId = req.userId || (req.user ? req.user.user_id : null);
    
    if (!userId) return res.status(401).json(errorResponse(401, "Không tìm thấy thông tin người dùng"));

    if (!ownerName || !petName || !petBreed || !service || !date || !timeslot) {
      return res.status(400).json(errorResponse(400, "Vui lòng điền đầy đủ thông tin"));
    }

    // Kiểm tra trùng lịch (Cú pháp SQL chuẩn)
    const conflict = await Appointment.findOne({
      where: {
        date,
        timeslot,
        status: { [Op.ne]: "cancelled" } // Không tính những lịch đã hủy
      }
    });

    if (conflict) {
      return res.status(409).json(errorResponse(409, "Khung giờ này đã được đặt"));
    }

    // Tạo mới trong Postgres
    const appointment = await Appointment.create({
      user_id: userId,
      owner_name: ownerName,
      pet_name: petName,
      pet_breed: petBreed,
      service,
      date,
      timeslot,
      symptoms: symptoms || "",
      status: "pending" 
    });

    res.status(201).json(successResponse(201, "Đặt lịch thành công", appointment));
  } catch (error) {
    console.error("Lỗi đặt lịch:", error);
    res.status(500).json(errorResponse(500, error.message));
  }
};

/* ================= GET USER APPOINTMENTS ================= */
module.exports.getUserAppointments = async (req, res) => {
  try {
    const userId = req.userId || (req.user ? req.user.user_id : null);
    
    const appointments = await Appointment.findAll({
      where: { user_id: userId },
      // Lưu ý: Đổi thành 'created_at' nếu bạn tắt timestamps trong Model
      order: [["appointment_id", "DESC"]] 
    });

    res.status(200).json(successResponse(200, "Thành công", appointments));
  } catch (error) {
    res.status(500).json(errorResponse(500, error.message));
  }
};

/* ================= GET APPOINTMENT BY ID ================= */
module.exports.getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) return res.status(404).json(errorResponse(404, 'Appointment not found'));

    // Only owner or admin can view
    if (appointment.user_id !== req.userId && !(req.user && ['admin','superadmin'].includes(req.user.user_type))) {
      return res.status(403).json(errorResponse(403, 'Forbidden'));
    }

    res.status(200).json(successResponse(200, 'Fetched appointment', appointment));
  } catch (error) {
    console.error('GET APPOINTMENT BY ID ERROR:', error);
    res.status(500).json(errorResponse(500, 'Failed to fetch appointment', error.message));
  }
};

/* ================= UPDATE APPOINTMENT (USER - cancel / reschedule) ================= */
module.exports.updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) return res.status(404).json(errorResponse(404, 'Appointment not found'));

    if (appointment.user_id !== req.userId && !(req.user && ['admin','superadmin'].includes(req.user.user_type))) {
      return res.status(403).json(errorResponse(403, 'Forbidden'));
    }

    const allowed = ['date','timeslot','status','service','symptoms'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    // If changing timeslot/date, check conflict
    if ((updates.date || updates.timeslot) && (updates.date || updates.timeslot)) {
      const date = updates.date || appointment.date;
      const timeslot = updates.timeslot || appointment.timeslot;

      const conflict = await Appointment.findOne({
        where: {
          date,
          timeslot,
          status: { [Op.ne]: 'cancelled' },
          appointment_id: { [Op.ne]: appointment.appointment_id }
        }
      });

      if (conflict) return res.status(409).json(errorResponse(409, 'Time slot already booked'));
    }

    await appointment.update(updates);
    res.status(200).json(successResponse(200, 'Appointment updated', appointment));
  } catch (error) {
    console.error('UPDATE APPOINTMENT ERROR:', error);
    res.status(500).json(errorResponse(500, 'Failed to update appointment', error.message));
  }
};

/* ================= ADMIN: GET ALL APPOINTMENTS ================= */
module.exports.adminGetAllAppointments = async (req, res) => {
  try {
    const data = await Appointment.findAll({ order: [['appointment_id','DESC']] });
    res.status(200).json(successResponse(200, 'Fetched all appointments', data));
  } catch (error) {
    console.error('ADMIN GET APPOINTMENTS ERROR:', error);
    res.status(500).json(errorResponse(500, 'Failed to fetch appointments', error.message));
  }
};

/* ================= ADMIN: UPDATE STATUS ================= */
module.exports.adminUpdateStatus = async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) return res.status(404).json(errorResponse(404, 'Appointment not found'));

    const { status } = req.body;
    if (!status) return res.status(400).json(errorResponse(400, 'Status is required'));

    appointment.status = status;
    await appointment.save();

    res.status(200).json(successResponse(200, 'Status updated', appointment));
  } catch (error) {
    console.error('ADMIN UPDATE STATUS ERROR:', error);
    res.status(500).json(errorResponse(500, 'Failed to update status', error.message));
  }
};

/* ================= ADMIN: ASSIGN DOCTOR ================= */
module.exports.adminAssignDoctor = async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) return res.status(404).json(errorResponse(404, 'Appointment not found'));

    const { doctorId } = req.body;
    if (!doctorId) return res.status(400).json(errorResponse(400, 'doctorId is required'));

    appointment.doctor_id = doctorId;
    appointment.status = appointment.status === 'pending' ? 'assigned' : appointment.status;
    await appointment.save();

    res.status(200).json(successResponse(200, 'Doctor assigned', appointment));
  } catch (error) {
    console.error('ADMIN ASSIGN DOCTOR ERROR:', error);
    res.status(500).json(errorResponse(500, 'Failed to assign doctor', error.message));
  }
};


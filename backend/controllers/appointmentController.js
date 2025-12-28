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


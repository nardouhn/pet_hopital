const Doctor = require('../Models/Doctor');
const DoctorSlots = require('../Models/DoctorSlots');
const { successResponse, errorResponse } = require('../helpers/successAndErrorResponse');

// POST /staff - create staff/doctor (admin)
module.exports.createStaff = async (req, res) => {
  try {
    const { doctor_name, birth, email, phone, specialization } = req.body;
    if (!doctor_name) return res.status(400).json(errorResponse(400, 'doctor_name required'));
    const d = await Doctor.create({ doctor_name, birth, email, phone, specialization });
    res.status(201).json(successResponse(201, 'Staff created', d));
  } catch (error) {
    console.error('CREATE STAFF ERROR:', error);
    res.status(500).json(errorResponse(500, 'Failed to create staff', error.message));
  }
};

// GET /staff - list staff
module.exports.getStaff = async (req, res) => {
  try {
    const docs = await Doctor.findAll();
    res.status(200).json(successResponse(200, 'Fetched staff', docs));
  } catch (error) {
    console.error('GET STAFF ERROR:', error);
    res.status(500).json(errorResponse(500, 'Failed to fetch staff', error.message));
  }
};

// PUT /staff/:id
module.exports.updateStaff = async (req, res) => {
  try {
    const d = await Doctor.findByPk(req.params.id);
    if (!d) return res.status(404).json(errorResponse(404, 'Staff not found'));
    const { doctor_name, birth, email, phone, specialization } = req.body;
    await d.update({ doctor_name: doctor_name || d.doctor_name, birth: birth || d.birth, email: email || d.email, phone: phone || d.phone, specialization: specialization || d.specialization });
    res.status(200).json(successResponse(200, 'Staff updated', d));
  } catch (error) {
    console.error('UPDATE STAFF ERROR:', error);
    res.status(500).json(errorResponse(500, 'Failed to update staff', error.message));
  }
};

// DELETE /staff/:id
module.exports.deleteStaff = async (req, res) => {
  try {
    const d = await Doctor.findByPk(req.params.id);
    if (!d) return res.status(404).json(errorResponse(404, 'Staff not found'));
    await d.destroy();
    res.status(200).json(successResponse(200, 'Staff deleted'));
  } catch (error) {
    console.error('DELETE STAFF ERROR:', error);
    res.status(500).json(errorResponse(500, 'Failed to delete staff', error.message));
  }
};

// POST /staff/:id/schedules
module.exports.createSchedule = async (req, res) => {
  try {
    const doctorId = req.params.id;
    const { start_time, end_time, number_of_slots, duration } = req.body;
    if (!start_time || !end_time) return res.status(400).json(errorResponse(400, 'start_time and end_time required'));
    const slot = await DoctorSlots.create({ doctor_id: doctorId, start_time, end_time, number_of_slots: number_of_slots || 0, duration: duration || 30 });
    res.status(201).json(successResponse(201, 'Schedule created', slot));
  } catch (error) {
    console.error('CREATE SCHEDULE ERROR:', error);
    res.status(500).json(errorResponse(500, 'Failed to create schedule', error.message));
  }
};

// GET /staff/:id/schedules
module.exports.getSchedules = async (req, res) => {
  try {
    const doctorId = req.params.id;
    const slots = await DoctorSlots.findAll({ where: { doctor_id: doctorId }, order: [['created_on','DESC']] });
    res.status(200).json(successResponse(200, 'Fetched schedules', slots));
  } catch (error) {
    console.error('GET SCHEDULES ERROR:', error);
    res.status(500).json(errorResponse(500, 'Failed to fetch schedules', error.message));
  }
};
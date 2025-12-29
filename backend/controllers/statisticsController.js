const Invoice = require('../Models/Invoice');
const Appointment = require('../Models/Appointment');
const User = require('../Models/User');
const { successResponse, errorResponse } = require('../helpers/successAndErrorResponse');
const { sequelize } = require('../config/db');

// GET /admin/statistics/appointments
module.exports.appointmentsStats = async (req, res) => {
  try {
    const total = await Appointment.count();
    const byStatus = await Appointment.findAll({ attributes: ['status', [sequelize.fn('COUNT', sequelize.col('status')), 'count']], group: ['status'] });
    res.status(200).json(successResponse(200, 'Appointments stats', { total, byStatus }));
  } catch (error) {
    console.error('APPT STATS ERROR:', error);
    res.status(500).json(errorResponse(500, 'Failed to get appointment stats', error.message));
  }
};

// GET /admin/statistics/revenue
module.exports.revenueStats = async (req, res) => {
  try {
    const totalRevenue = await Invoice.sum('total');
    res.status(200).json(successResponse(200, 'Revenue stats', { totalRevenue: totalRevenue || 0 }));
  } catch (error) {
    console.error('REVENUE STATS ERROR:', error);
    res.status(500).json(errorResponse(500, 'Failed to get revenue stats', error.message));
  }
};

// GET /admin/statistics/patients
module.exports.patientsStats = async (req, res) => {
  try {
    const patientCount = await User.count();
    res.status(200).json(successResponse(200, 'Patients stats', { patientCount }));
  } catch (error) {
    console.error('PATIENTS STATS ERROR:', error);
    res.status(500).json(errorResponse(500, 'Failed to get patients stats', error.message));
  }
};

// GET /admin/statistics/services
module.exports.servicesStats = async (req, res) => {
  try {
    // Count appointments per service
    const byService = await Appointment.findAll({ attributes: ['service', [sequelize.fn('COUNT', sequelize.col('service')), 'count']], group: ['service'] });
    res.status(200).json(successResponse(200, 'Services stats', { byService }));
  } catch (error) {
    console.error('SERVICES STATS ERROR:', error);
    res.status(500).json(errorResponse(500, 'Failed to get services stats', error.message));
  }
};
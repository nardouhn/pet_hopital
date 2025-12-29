const express = require('express');
const adminAppointmentsRouter = express.Router();
const { authenticator } = require('../middlewares/authenticator');
const { checkRole } = require('../middlewares/authorization');
const { adminGetAllAppointments, adminUpdateStatus, adminAssignDoctor } = require('../controllers/appointmentController');

// GET /admin/appointments
adminAppointmentsRouter.get('/', authenticator, checkRole(['admin','superadmin']), adminGetAllAppointments);

// PUT /admin/appointments/:id/status
adminAppointmentsRouter.put('/:id/status', authenticator, checkRole(['admin','superadmin']), adminUpdateStatus);

// PUT /admin/appointments/:id/assign-doctor
adminAppointmentsRouter.put('/:id/assign-doctor', authenticator, checkRole(['admin','superadmin']), adminAssignDoctor);

module.exports = { adminAppointmentsRouter };
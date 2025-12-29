const express = require('express');
const { authenticator } = require('../middlewares/authenticator');
const { checkRole } = require('../middlewares/authorization');
const { createStaff, getStaff, updateStaff, deleteStaff, createSchedule, getSchedules } = require('../controllers/staffController');

const staffRouter = express.Router();

// Admin-only create
staffRouter.post('/', authenticator, checkRole(['admin','superadmin']), createStaff);
// List staff (public or admin) — make it public
staffRouter.get('/', getStaff);
// Update / delete
staffRouter.put('/:id', authenticator, checkRole(['admin','superadmin']), updateStaff);
staffRouter.delete('/:id', authenticator, checkRole(['admin','superadmin']), deleteStaff);

// Schedules
staffRouter.post('/:id/schedules', authenticator, checkRole(['admin','superadmin']), createSchedule);
staffRouter.get('/:id/schedules', getSchedules);

module.exports = { staffRouter };
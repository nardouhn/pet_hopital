const express = require('express');
const { authenticator } = require('../middlewares/authenticator');
const { checkRole } = require('../middlewares/authorization');
const { appointmentsStats, revenueStats, patientsStats, servicesStats } = require('../controllers/statisticsController');

const statisticsRouter = express.Router();

statisticsRouter.get('/appointments', authenticator, checkRole(['admin','superadmin']), appointmentsStats);
statisticsRouter.get('/revenue', authenticator, checkRole(['admin','superadmin']), revenueStats);
statisticsRouter.get('/patients', authenticator, checkRole(['admin','superadmin']), patientsStats);
statisticsRouter.get('/services', authenticator, checkRole(['admin','superadmin']), servicesStats);

module.exports = { statisticsRouter };
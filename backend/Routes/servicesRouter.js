const express = require('express');
const router = express.Router();
const { getServices, getMedicines, createService, updateService, deleteService, createMedicine, updateMedicine, deleteMedicine } = require('../controllers/servicesController');
const { authenticator } = require('../middlewares/authenticator');
const { checkRole } = require('../middlewares/authorization');

// Public
router.get('/services', getServices);
router.get('/medicines', getMedicines);

// Admin routes under /admin/services and /admin/medicines will be added separately, but also provide here protected endpoints
router.post('/services', authenticator, checkRole(['admin','superadmin']), createService);
router.put('/services/:id', authenticator, checkRole(['admin','superadmin']), updateService);
router.delete('/services/:id', authenticator, checkRole(['admin','superadmin']), deleteService);

router.post('/medicines', authenticator, checkRole(['admin','superadmin']), createMedicine);
router.put('/medicines/:id', authenticator, checkRole(['admin','superadmin']), updateMedicine);
router.delete('/medicines/:id', authenticator, checkRole(['admin','superadmin']), deleteMedicine);

module.exports = { servicesRouter: router };
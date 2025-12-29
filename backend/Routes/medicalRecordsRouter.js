const express = require('express');
const { authenticator } = require('../middlewares/authenticator');
const { checkRole } = require('../middlewares/authorization');
const { createRecord, updateRecord, getRecordById } = require('../controllers/medicalRecordController');

const medicalRecordsRouter = express.Router();

// Only doctor or admin can create / update / get single
medicalRecordsRouter.post('/', authenticator, checkRole(['doctor','admin','superadmin']), createRecord);
medicalRecordsRouter.put('/:id', authenticator, checkRole(['doctor','admin','superadmin']), updateRecord);
medicalRecordsRouter.get('/:id', authenticator, checkRole(['doctor','admin','superadmin']), getRecordById);

module.exports = { medicalRecordsRouter };
const express = require('express');
const { authenticator } = require('../middlewares/authenticator');
const {
  createPet,
  getPetsForUser,
  getPetById,
  updatePet,
  deletePet
} = require('../controllers/petController');

const petRouter = express.Router();

// Create pet
petRouter.post('/', authenticator, createPet);

// Get all pets for current user
petRouter.get('/', authenticator, getPetsForUser);

// Get single pet
petRouter.get('/:id', authenticator, getPetById);

// Get medical records for a pet (owner or admin/doctor)
const { getRecordsForPet } = require('../controllers/medicalRecordController');
petRouter.get('/:id/medical-records', authenticator, getRecordsForPet);

// Update pet
petRouter.put('/:id', authenticator, updatePet);

// Delete pet
petRouter.delete('/:id', authenticator, deletePet);

module.exports = { petRouter };
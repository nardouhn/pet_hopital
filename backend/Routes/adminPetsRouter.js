const express = require('express');
const { authenticator } = require('../middlewares/authenticator');
const { checkRole } = require('../middlewares/authorization');
const { adminGetAllPets, adminGetPetById } = require('../controllers/petController');

const adminPetsRouter = express.Router();

// GET /admin/pets - admin only
adminPetsRouter.get('/', authenticator, checkRole(['admin','superadmin']), adminGetAllPets);

// GET /admin/pets/:id - admin only
adminPetsRouter.get('/:id', authenticator, checkRole(['admin','superadmin']), adminGetPetById);

module.exports = { adminPetsRouter };
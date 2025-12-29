const express = require('express');
const { authenticator } = require('../middlewares/authenticator');
const { getProfile, updateProfile } = require('../controllers/userController');

const usersRouter = express.Router();

// Get profile
usersRouter.get('/profile', authenticator, getProfile);

// Update profile
usersRouter.put('/profile', authenticator, updateProfile);

module.exports = { usersRouter };
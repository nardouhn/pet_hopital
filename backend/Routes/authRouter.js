const express = require('express');
const { authenticator } = require('../middlewares/authenticator');
const { registerNewUser, userLogin, logoutUser, getMe } = require('../controllers/userController');

const authRouter = express.Router();

// Register
authRouter.post('/register', registerNewUser);

// Login
authRouter.post('/login', userLogin);

// Logout
authRouter.post('/logout', authenticator, logoutUser);

// Get current user
authRouter.get('/me', authenticator, getMe);

module.exports = { authRouter };
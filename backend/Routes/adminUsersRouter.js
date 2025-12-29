const express = require('express');
const { authenticator } = require('../middlewares/authenticator');
const { checkRole } = require('../middlewares/authorization');
const { getAllUsers, getUserById, updateUserById, deleteUserById } = require('../controllers/userController');

const adminUsersRouter = express.Router();

// GET /admin/users
adminUsersRouter.get('/', authenticator, checkRole(['admin', 'superadmin']), getAllUsers);

// GET /admin/users/:id
adminUsersRouter.get('/:id', authenticator, checkRole(['admin', 'superadmin']), getUserById);

// PUT /admin/users/:id
adminUsersRouter.put('/:id', authenticator, checkRole(['admin', 'superadmin']), updateUserById);

// DELETE /admin/users/:id
adminUsersRouter.delete('/:id', authenticator, checkRole(['admin', 'superadmin']), deleteUserById);

module.exports = { adminUsersRouter };
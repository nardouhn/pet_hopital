const express = require('express');
const { authenticator } = require('../middlewares/authenticator');
const { checkRole } = require('../middlewares/authorization');
const { createFeedback, getMyFeedback, getAllFeedback, replyFeedback } = require('../controllers/feedbackController');

const feedbackRouter = express.Router();

feedbackRouter.post('/', authenticator, createFeedback);
feedbackRouter.get('/my', authenticator, getMyFeedback);

feedbackRouter.get('/admin', authenticator, checkRole(['admin','superadmin']), getAllFeedback);
feedbackRouter.put('/admin/:id/reply', authenticator, checkRole(['admin','superadmin']), replyFeedback);

module.exports = { feedbackRouter };
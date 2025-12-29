const Feedback = require('../Models/Feedback');
const { successResponse, errorResponse } = require('../helpers/successAndErrorResponse');

// POST /feedback (user)
module.exports.createFeedback = async (req, res) => {
  try {
    const userId = req.userId;
    const { subject, message } = req.body;
    if (!message) return res.status(400).json(errorResponse(400, 'Message is required'));

    const f = await Feedback.create({ user_id: userId, subject: subject || '', message, status: 'open' });
    res.status(201).json(successResponse(201, 'Feedback created', f));
  } catch (error) {
    console.error('CREATE FEEDBACK ERROR:', error);
    res.status(500).json(errorResponse(500, 'Failed to create feedback', error.message));
  }
};

// GET /feedback/my
module.exports.getMyFeedback = async (req, res) => {
  try {
    const userId = req.userId;
    const rows = await Feedback.findAll({ where: { user_id: userId }, order: [['created_at','DESC']] });
    res.status(200).json(successResponse(200, 'Fetched feedback', rows));
  } catch (error) {
    console.error('GET MY FEEDBACK ERROR:', error);
    res.status(500).json(errorResponse(500, 'Failed to get feedback', error.message));
  }
};

// GET /admin/feedback
module.exports.getAllFeedback = async (req, res) => {
  try {
    const rows = await Feedback.findAll({ order: [['created_at','DESC']] });
    res.status(200).json(successResponse(200, 'Fetched all feedback', rows));
  } catch (error) {
    console.error('GET ALL FEEDBACK ERROR:', error);
    res.status(500).json(errorResponse(500, 'Failed to get feedback', error.message));
  }
};

// PUT /admin/feedback/:id/reply
module.exports.replyFeedback = async (req, res) => {
  try {
    const f = await Feedback.findByPk(req.params.id);
    if (!f) return res.status(404).json(errorResponse(404, 'Feedback not found'));
    const { reply, status } = req.body;
    await f.update({ reply: reply || f.reply, status: status || f.status });
    res.status(200).json(successResponse(200, 'Replied to feedback', f));
  } catch (error) {
    console.error('REPLY FEEDBACK ERROR:', error);
    res.status(500).json(errorResponse(500, 'Failed to reply feedback', error.message));
  }
};
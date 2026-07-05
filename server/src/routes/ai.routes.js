const express = require('express');
const { chat, getHistory, submitFeedback } = require('../controllers/ai.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();
router.use(protect);

router.post('/chat', chat);
router.get('/history', getHistory);
router.put('/:id/feedback', submitFeedback);

module.exports = router;

// src/routes/ai.routes.js
const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const { generateSuggestions, personalizeMessage } = require('../controllers/ai.controller');

router.use(authenticate);
router.post('/suggestions',        generateSuggestions);
router.post('/personalize-message',personalizeMessage);

module.exports = router;

const express = require('express');
const router = express.Router();
const { verifyToken, handleMessage } = require('../controllers/webhook.controller');

router.get('/webhook', verifyToken);
router.post('/webhook', handleMessage);

module.exports = router;
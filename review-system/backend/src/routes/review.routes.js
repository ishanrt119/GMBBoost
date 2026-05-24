// src/routes/review.routes.js
const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const { listReviews, trackClick, submitReview, reviewStats } = require('../controllers/review.controller');

router.use(authenticate);
router.get('/',          listReviews);
router.get('/stats',     reviewStats);
router.post('/track',    trackClick);
router.post('/submit',   submitReview);

module.exports = router;

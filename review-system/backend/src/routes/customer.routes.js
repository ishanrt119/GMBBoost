// src/routes/customer.routes.js
const router  = require('express').Router();
const multer  = require('multer');
const { authenticate } = require('../middleware/auth.middleware');
const { uploadCSV, createCustomer, listCustomers, deleteCustomer } = require('../controllers/customer.controller');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.use(authenticate);
router.get('/',          listCustomers);
router.post('/',         createCustomer);
router.post('/upload',   upload.single('file'), uploadCSV);
router.delete('/:id',    deleteCustomer);

module.exports = router;

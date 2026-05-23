import { Router } from 'express';
import { signup, login, logout, googleCallback } from '../controllers/authController';
import { checkEmail } from '../controllers/emailController';
import { signupValidator, loginValidator } from '../validators/authValidators';
import { handleValidationErrors } from '../utils/validationHandler';
import { authLimiter, generalLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/signup', authLimiter, signupValidator, handleValidationErrors, signup);
router.post('/login', authLimiter, loginValidator, handleValidationErrors, login);
router.post('/logout', logout);
router.post('/google/callback', authLimiter, googleCallback);
router.get('/verify-email', generalLimiter, checkEmail);

export default router;

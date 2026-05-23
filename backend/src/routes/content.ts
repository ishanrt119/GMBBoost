import { Router } from 'express';
import { generate, regenerate, history, deleteContentHandler } from '../controllers/contentController';
import { authMiddleware } from '../middleware/auth';
import { generateValidator, deleteContentValidator } from '../validators/contentValidators';
import { handleValidationErrors } from '../utils/validationHandler';
import { generateLimiter } from '../middleware/rateLimiter';

const router = Router();

router.use(authMiddleware);

router.post('/generate', generateLimiter, generateValidator, handleValidationErrors, generate);
router.post('/regenerate', generateLimiter, generateValidator, handleValidationErrors, regenerate);
router.get('/history', history);
router.delete('/delete/:id', deleteContentValidator, handleValidationErrors, deleteContentHandler);

export default router;

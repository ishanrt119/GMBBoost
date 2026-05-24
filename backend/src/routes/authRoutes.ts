import { Router } from 'express';
import { register, login, deleteUserHandler } from '../controllers/authController';

const router = Router();

router.post('/auth/register', register);
router.post('/auth/login', login);
router.delete('/auth/users/:id', deleteUserHandler);

export default router;
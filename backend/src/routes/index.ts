import { Router } from 'express';
import { stats } from '../controllers/dashboardController';
import { getProfile, updateProfileHandler, changePassword } from '../controllers/profileController';
import { authMiddleware } from '../middleware/auth';

const dashboardRouter = Router();
dashboardRouter.use(authMiddleware);
dashboardRouter.get('/stats', stats);

const profileRouter = Router();
profileRouter.use(authMiddleware);
profileRouter.get('/', getProfile);
profileRouter.put('/update', updateProfileHandler);
profileRouter.put('/password', changePassword);

export { dashboardRouter, profileRouter };

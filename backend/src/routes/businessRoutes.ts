import { Router } from 'express';
import {
  searchBusinessHandler,
  saveBusinessHandler,
  getProfileHandler,
  getUsersWithDataId
} from '../controllers/businessController';

const router = Router();

router.post('/business/search', searchBusinessHandler);
router.post('/business/save', saveBusinessHandler);
router.get('/business/profile/:id', getProfileHandler);
router.get('/business/users-with-dataid', getUsersWithDataId);

export default router;
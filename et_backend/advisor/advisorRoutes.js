import express from 'express';
import { verifyToken } from '../auth/authMiddleware.js';
import {
  getRecommendationsHandler,
  generateRecommendationsHandler,
  dismissRecommendationHandler
} from './advisorController.js';

const router = express.Router();

// All recommendation routes are protected
router.use(verifyToken);

router.get('/', getRecommendationsHandler);
router.post('/generate', generateRecommendationsHandler);
router.put('/:id/dismiss', dismissRecommendationHandler);

export default router;

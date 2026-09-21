import { Router } from 'express';
import {
  getBudgetProgress,
  getBudgets,
  createOrUpdateBudget,
  deleteBudget
} from './budgetController.js';
import { verifyToken } from '../auth/authMiddleware.js';

const router = Router();

// Protected Routes (Require valid JWT)
router.get('/progress', verifyToken, getBudgetProgress);
router.get('/', verifyToken, getBudgets);
router.post('/', verifyToken, createOrUpdateBudget);
router.put('/:id', verifyToken, createOrUpdateBudget);
router.delete('/:id', verifyToken, deleteBudget);

export default router;

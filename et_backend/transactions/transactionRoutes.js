import { Router } from 'express';
import {
  getTransactions,
  createTransaction,
  updateTransactionCategory,
  syncTransactions,
  deleteTransaction
} from './transactionController.js';
import { verifyToken } from '../auth/authMiddleware.js';

const router = Router();

// Protect all transaction routes
router.use(verifyToken);

router.get('/', getTransactions);
router.post('/', createTransaction);
router.post('/sync', syncTransactions);
router.put('/:id/category', updateTransactionCategory);
router.delete('/:id', deleteTransaction);

export default router;

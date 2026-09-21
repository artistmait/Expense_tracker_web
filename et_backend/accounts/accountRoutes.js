import { Router } from 'express';
import { getUserAccounts, createAccount } from './accountController.js';
import { verifyToken } from '../auth/authMiddleware.js';

const router = Router();

router.use(verifyToken);

router.get('/', getUserAccounts);
router.post('/', createAccount);

export default router;

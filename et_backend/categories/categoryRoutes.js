import { Router } from 'express';
import { getCategories, createCategory } from './categoryController.js';
import { verifyToken } from '../auth/authMiddleware.js';

const router = Router();

router.use(verifyToken);

router.get('/', getCategories);
router.post('/', createCategory);

export default router;

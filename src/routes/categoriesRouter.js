import { createCategory, getCategorieById, getCategories } from '../controllers/categoriesController.js';
import { Router } from 'express';

const router = Router();

router.get('/categories', getCategories);
router.get('/categories/:id', getCategorieById);
router.post('/categories', createCategory);

export default router;
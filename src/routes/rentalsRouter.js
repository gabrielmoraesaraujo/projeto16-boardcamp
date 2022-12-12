import { deleteRental, finishRental, getRentals, insertRental } from '../controllers/rentalsController.js';
import { Router } from 'express';

const router = Router();

router.get('/rentals', getRentals);
router.post('/rentals', insertRental);
router.post('/rentals/:id/return', finishRental);
router.delete('/rentals/:id', deleteRental);

export default router;
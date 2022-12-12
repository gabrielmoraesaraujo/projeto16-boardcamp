import { getGames, insertGame } from '../controllers/gamesController.js';
import { Router } from 'express';

const router = Router();

router.get('/games', getGames);
router.post('/games', insertGame);

export default router;
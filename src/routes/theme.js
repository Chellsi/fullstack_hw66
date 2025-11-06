import express from 'express';
import { setTheme, getTheme } from '../controllers/themeController.js';

const router = express.Router();

// API endpoints для роботи з темами
router.post('/set', setTheme);
router.get('/current', getTheme);

export default router;
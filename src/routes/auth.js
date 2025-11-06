import express from 'express';
import {
  getRegisterPage,
  getLoginPage,
  register,
  login,
  logout,
  getCurrentUser,
  getProfilePage
} from '../controllers/authController.js';
import { authenticateToken } from '../middlewares/index.js';

const router = express.Router();

// HTML сторінки
router.get('/register', getRegisterPage);
router.get('/login', getLoginPage);
router.get('/profile', authenticateToken, getProfilePage);

// API endpoints
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', authenticateToken, getCurrentUser);

export default router;
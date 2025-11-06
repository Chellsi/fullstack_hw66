import express from 'express';
import { 
  basicAuth, 
  validateUserInput
} from '../middlewares/index.js';
import {
  getUsersPage,
  getUsersApi,
  getUserByIdPage,
  getUserByIdApi,
  createUser,
  updateUser,
  deleteUser
} from '../controllers/usersController.js';

const router = express.Router();

// HTML маршрути (використовують PUG)
router.get('/page', getUsersPage);
router.get('/page/:userId', getUserByIdPage);

// API маршрути (повертають JSON/текст)
router.get('/', basicAuth, getUsersApi);
router.post('/', basicAuth, validateUserInput, createUser);
router.get('/:userId', basicAuth, getUserByIdApi);
router.put('/:userId', basicAuth, validateUserInput, updateUser);
router.delete('/:userId', basicAuth, deleteUser);

export default router;
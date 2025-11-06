import express from 'express';
import { 
  basicAuth, 
  validateArticleInput, 
  checkArticleAccess
} from '../middlewares/index.js';
import {
  getArticlesPage,
  getArticlesApi,
  getArticleByIdPage,
  getArticleByIdApi,
  createArticle,
  updateArticle,
  deleteArticle
} from '../controllers/articlesController.js';

const router = express.Router();

// HTML маршрути (використовують EJS)
router.get('/page', getArticlesPage);
router.get('/page/:articleId', getArticleByIdPage);

// API маршрути (повертають JSON/текст)
router.get('/', basicAuth, checkArticleAccess, getArticlesApi);
router.post('/', basicAuth, checkArticleAccess, validateArticleInput, createArticle);
router.get('/:articleId', basicAuth, checkArticleAccess, getArticleByIdApi);
router.put('/:articleId', basicAuth, checkArticleAccess, validateArticleInput, updateArticle);
router.delete('/:articleId', basicAuth, checkArticleAccess, deleteArticle);

export default router;
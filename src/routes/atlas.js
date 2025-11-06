import { Router } from 'express';
import { connectToDatabase, MongoConfigurationError } from '../config/database.js';

const atlasRouter = Router();

atlasRouter.get('/data', async (req, res, next) => {
  const theme = req.cookies.theme || 'light';
  const viewModel = {
    title: 'Дані з MongoDB Atlas',
    theme,
    user: req.user,
    documents: [],
    collectionName: process.env.MONGODB_COLLECTION || 'samples',
    error: null
  };

  try {
    const { client, db } = await connectToDatabase();
    const configuredCollection = process.env.MONGODB_COLLECTION;
    let targetDb = db;
    let collectionName = viewModel.collectionName;

    if (configuredCollection && configuredCollection.includes('.')) {
      const [firstSegment, ...rest] = configuredCollection.split('.');
      const derivedCollectionName = rest.join('.');

      if (derivedCollectionName) {
        targetDb = client.db(firstSegment);
        collectionName = derivedCollectionName;
      }
    }

    const documents = await targetDb
      .collection(collectionName)
      .find({})
      .limit(25)
      .toArray();

    viewModel.collectionName = configuredCollection || collectionName;
    viewModel.documents = documents;
    res.render('atlas/index', viewModel);
  } catch (error) {
    if (error instanceof MongoConfigurationError) {
      viewModel.error = error.message;
      res.status(500).render('atlas/index', viewModel);
      return;
    }

    if (error.name === 'MongoServerSelectionError') {
      viewModel.error = 'Не вдалося підключитися до MongoDB Atlas. Перевірте параметри підключення.';
      res.status(502).render('atlas/index', viewModel);
      return;
    }

    next(error);
  }
});

export default atlasRouter;

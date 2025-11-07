import { Router } from 'express';
import { connectToDatabase, MongoConfigurationError } from '../config/database.js';

const atlasRouter = Router();

const resolveCollection = async () => {
  const { client, db } = await connectToDatabase();
  const configuredCollection = process.env.MONGODB_COLLECTION;

  let targetDb = db;
  let collectionName = configuredCollection || 'samples';

  if (configuredCollection && configuredCollection.includes('.')) {
    const [firstSegment, ...rest] = configuredCollection.split('.');
    const derivedCollectionName = rest.join('.');

    if (derivedCollectionName) {
      targetDb = client.db(firstSegment);
      collectionName = derivedCollectionName;
    }
  }

  return {
    client,
    db: targetDb,
    collection: targetDb.collection(collectionName),
    collectionName: configuredCollection || collectionName
  };
};

const parseJsonParam = (value, fallback) => {
  if (value === undefined) {
    return fallback;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    const parsingError = new Error('Не вдалося розпарсити JSON параметр. Перевірте синтаксис.');
    parsingError.status = 400;
    throw parsingError;
  }
};

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
    const { collection, collectionName } = await resolveCollection();
    const documents = await collection
      .find({})
      .limit(25)
      .toArray();

    viewModel.collectionName = collectionName;
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

atlasRouter.get('/api/documents', async (req, res, next) => {
  try {
    const { collection } = await resolveCollection();
    const filter = parseJsonParam(req.query.filter, {});
    const projection = parseJsonParam(req.query.projection, undefined);
    const limit = req.query.limit ? Math.min(parseInt(req.query.limit, 10) || 0, 100) : 25;

    const findOptions = {};

    if (projection !== undefined) {
      findOptions.projection = projection;
    }

    const cursor = collection.find(filter, findOptions);

    if (limit > 0) {
      cursor.limit(limit);
    }

    const documents = await cursor.toArray();
    res.json({
      count: documents.length,
      documents
    });
  } catch (error) {
    if (error.status === 400) {
      res.status(400).json({ error: error.message });
      return;
    }

    next(error);
  }
});

atlasRouter.post('/api/documents', async (req, res, next) => {
  try {
    const { collection } = await resolveCollection();
    const { document } = req.body;

    if (!document || typeof document !== 'object' || Array.isArray(document)) {
      res.status(400).json({ error: 'Поле "document" є обов\'язковим та має бути об\'єктом.' });
      return;
    }

    const result = await collection.insertOne(document);
    res.status(201).json({
      acknowledged: result.acknowledged,
      insertedId: result.insertedId
    });
  } catch (error) {
    next(error);
  }
});

atlasRouter.post('/api/documents/bulk', async (req, res, next) => {
  try {
    const { collection } = await resolveCollection();
    const { documents } = req.body;

    if (!Array.isArray(documents) || documents.length === 0) {
      res.status(400).json({ error: 'Поле "documents" має містити масив документів для вставки.' });
      return;
    }

    const result = await collection.insertMany(documents);
    res.status(201).json({
      acknowledged: result.acknowledged,
      insertedCount: result.insertedCount,
      insertedIds: result.insertedIds
    });
  } catch (error) {
    next(error);
  }
});

atlasRouter.patch('/api/documents/update-one', async (req, res, next) => {
  try {
    const { collection } = await resolveCollection();
    const { filter, update, options } = req.body;

    if (!filter || typeof filter !== 'object' || Array.isArray(filter)) {
      res.status(400).json({ error: 'Поле "filter" є обов\'язковим та має бути об\'єктом.' });
      return;
    }

    if (!update || typeof update !== 'object' || Array.isArray(update)) {
      res.status(400).json({ error: 'Поле "update" є обов\'язковим та має бути об\'єктом.' });
      return;
    }

    if (options !== undefined && (typeof options !== 'object' || Array.isArray(options))) {
      res.status(400).json({ error: 'Поле "options" має бути об\'єктом, якщо воно передане.' });
      return;
    }

    const result = await collection.updateOne(filter, update, options);
    res.json({
      acknowledged: result.acknowledged,
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      upsertedId: result.upsertedId ?? null
    });
  } catch (error) {
    next(error);
  }
});

atlasRouter.patch('/api/documents/update-many', async (req, res, next) => {
  try {
    const { collection } = await resolveCollection();
    const { filter, update, options } = req.body;

    if (!filter || typeof filter !== 'object' || Array.isArray(filter)) {
      res.status(400).json({ error: 'Поле "filter" є обов\'язковим та має бути об\'єктом.' });
      return;
    }

    if (!update || typeof update !== 'object' || Array.isArray(update)) {
      res.status(400).json({ error: 'Поле "update" є обов\'язковим та має бути об\'єктом.' });
      return;
    }

    if (options !== undefined && (typeof options !== 'object' || Array.isArray(options))) {
      res.status(400).json({ error: 'Поле "options" має бути об\'єктом, якщо воно передане.' });
      return;
    }

    const result = await collection.updateMany(filter, update, options);
    res.json({
      acknowledged: result.acknowledged,
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      upsertedId: result.upsertedId ?? null
    });
  } catch (error) {
    next(error);
  }
});

atlasRouter.put('/api/documents/replace-one', async (req, res, next) => {
  try {
    const { collection } = await resolveCollection();
    const { filter, replacement, options } = req.body;

    if (!filter || typeof filter !== 'object' || Array.isArray(filter)) {
      res.status(400).json({ error: 'Поле "filter" є обов\'язковим та має бути об\'єктом.' });
      return;
    }

    if (!replacement || typeof replacement !== 'object' || Array.isArray(replacement)) {
      res
        .status(400)
        .json({ error: 'Поле "replacement" є обов\'язковим та має бути об\'єктом без операторів оновлення.' });
      return;
    }

    if (options !== undefined && (typeof options !== 'object' || Array.isArray(options))) {
      res.status(400).json({ error: 'Поле "options" має бути об\'єктом, якщо воно передане.' });
      return;
    }

    const result = await collection.replaceOne(filter, replacement, options);
    res.json({
      acknowledged: result.acknowledged,
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      upsertedId: result.upsertedId ?? null
    });
  } catch (error) {
    next(error);
  }
});

atlasRouter.delete('/api/documents/delete-one', async (req, res, next) => {
  try {
    const { collection } = await resolveCollection();
    const { filter, options } = req.body;

    if (!filter || typeof filter !== 'object' || Array.isArray(filter)) {
      res.status(400).json({ error: 'Поле "filter" є обов\'язковим та має бути об\'єктом.' });
      return;
    }

    if (options !== undefined && (typeof options !== 'object' || Array.isArray(options))) {
      res.status(400).json({ error: 'Поле "options" має бути об\'єктом, якщо воно передане.' });
      return;
    }

    const result = await collection.deleteOne(filter, options);
    res.json({
      acknowledged: result.acknowledged,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    next(error);
  }
});

atlasRouter.delete('/api/documents/delete-many', async (req, res, next) => {
  try {
    const { collection } = await resolveCollection();
    const { filter, options } = req.body;

    if (!filter || typeof filter !== 'object' || Array.isArray(filter)) {
      res.status(400).json({ error: 'Поле "filter" є обов\'язковим та має бути об\'єктом.' });
      return;
    }

    if (options !== undefined && (typeof options !== 'object' || Array.isArray(options))) {
      res.status(400).json({ error: 'Поле "options" має бути об\'єктом, якщо воно передане.' });
      return;
    }

    const result = await collection.deleteMany(filter, options);
    res.json({
      acknowledged: result.acknowledged,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    next(error);
  }
});

export default atlasRouter;

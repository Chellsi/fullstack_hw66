import { MongoClient } from 'mongodb';

let cachedClient = null;
let cachedDb = null;
let clientPromise = null;

export class MongoConfigurationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'MongoConfigurationError';
  }
}

export async function connectToDatabase() {
  if (cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const { MONGODB_URI, MONGODB_DB_NAME } = process.env;

  if (!MONGODB_URI) {
    throw new MongoConfigurationError('Змінна оточення MONGODB_URI не налаштована.');
  }

  if (!MONGODB_DB_NAME) {
    throw new MongoConfigurationError('Змінна оточення MONGODB_DB_NAME не налаштована.');
  }

  if (!clientPromise) {
    const client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });

    clientPromise = client
      .connect()
      .then((connectedClient) => {
        cachedClient = connectedClient;
        cachedDb = connectedClient.db(MONGODB_DB_NAME);
        return { client: cachedClient, db: cachedDb };
      })
      .catch((error) => {
        clientPromise = null;
        throw error;
      });
  }

  return clientPromise;
}

export function getDb() {
  if (!cachedDb) {
    throw new Error('Базу даних ще не ініціалізовано. Спочатку викличте connectToDatabase().');
  }

  return cachedDb;
}

export async function closeDatabaseConnection() {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
    cachedDb = null;
    clientPromise = null;
  }
}

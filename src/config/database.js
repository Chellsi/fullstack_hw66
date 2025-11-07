import { MongoClient } from 'mongodb';

let cachedClient = null;
let cachedDb = null;
let clientPromise = null;

const truthyValues = new Set(['1', 'true', 'yes', 'y', 'on']);
const falsyValues = new Set(['0', 'false', 'no', 'n', 'off']);

const parseBoolean = (value) => {
  if (typeof value !== 'string') {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();

  if (truthyValues.has(normalized)) {
    return true;
  }

  if (falsyValues.has(normalized)) {
    return false;
  }

  return undefined;
};

const parseInteger = (value) => {
  if (value === undefined) {
    return undefined;
  }

  const parsed = Number.parseInt(value, 10);

  return Number.isNaN(parsed) ? undefined : parsed;
};

const buildMongoClientOptions = () => {
  const options = {};

  const timeoutMs = parseInteger(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS);
  options.serverSelectionTimeoutMS = timeoutMs ?? 5000;

  if (process.env.MONGODB_APP_NAME) {
    options.appName = process.env.MONGODB_APP_NAME;
  }

  const directConnection = parseBoolean(process.env.MONGODB_DIRECT_CONNECTION);
  if (directConnection !== undefined) {
    options.directConnection = directConnection;
  }

  const explicitTls = parseBoolean(process.env.MONGODB_TLS);
  if (explicitTls !== undefined) {
    options.tls = explicitTls;
  }

  if (process.env.MONGODB_TLS_CA_FILE) {
    options.tls = true;
    options.tlsCAFile = process.env.MONGODB_TLS_CA_FILE;
  }

  const allowInvalidCertificates = parseBoolean(process.env.MONGODB_TLS_ALLOW_INVALID_CERTS);
  if (allowInvalidCertificates !== undefined) {
    options.tls = true;
    options.tlsAllowInvalidCertificates = allowInvalidCertificates;
  }

  const allowInvalidHostnames = parseBoolean(process.env.MONGODB_TLS_ALLOW_INVALID_HOSTNAMES);
  if (allowInvalidHostnames !== undefined) {
    options.tls = true;
    options.tlsAllowInvalidHostnames = allowInvalidHostnames;
  }

  const tlsInsecure = parseBoolean(process.env.MONGODB_TLS_INSECURE);
  if (tlsInsecure) {
    options.tls = true;
    options.tlsInsecure = true;
  }

  if (process.env.MONGODB_TLS_CERTIFICATE_FILE) {
    options.tls = true;
    options.tlsCertificateFile = process.env.MONGODB_TLS_CERTIFICATE_FILE;
  }

  if (process.env.MONGODB_TLS_CERTIFICATE_KEY_FILE) {
    options.tls = true;
    options.tlsCertificateKeyFile = process.env.MONGODB_TLS_CERTIFICATE_KEY_FILE;
  }

  if (process.env.MONGODB_TLS_CERTIFICATE_KEY_FILE_PASSWORD) {
    options.tls = true;
    options.tlsCertificateKeyFilePassword = process.env.MONGODB_TLS_CERTIFICATE_KEY_FILE_PASSWORD;
  }

  const maxPoolSize = parseInteger(process.env.MONGODB_MAX_POOL_SIZE);
  if (maxPoolSize !== undefined) {
    options.maxPoolSize = maxPoolSize;
  }

  const minPoolSize = parseInteger(process.env.MONGODB_MIN_POOL_SIZE);
  if (minPoolSize !== undefined) {
    options.minPoolSize = minPoolSize;
  }

  const waitQueueTimeoutMS = parseInteger(process.env.MONGODB_WAIT_QUEUE_TIMEOUT_MS);
  if (waitQueueTimeoutMS !== undefined) {
    options.waitQueueTimeoutMS = waitQueueTimeoutMS;
  }

  if (process.env.MONGODB_COMPRESSORS) {
    options.compressors = process.env.MONGODB_COMPRESSORS;
  }

  if (process.env.MONGODB_SERVER_API_VERSION) {
    const strict = parseBoolean(process.env.MONGODB_SERVER_API_STRICT);
    const deprecationErrors = parseBoolean(process.env.MONGODB_SERVER_API_DEPRECATION_ERRORS);

    options.serverApi = {
      version: process.env.MONGODB_SERVER_API_VERSION,
      ...(strict !== undefined ? { strict } : {}),
      ...(deprecationErrors !== undefined ? { deprecationErrors } : {})
    };
  }

  return options;
};

export class MongoConfigurationError extends Error {
  constructor(message, options) {
    super(message, options);
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
    const clientOptions = buildMongoClientOptions();
    const client = new MongoClient(MONGODB_URI, clientOptions);

    clientPromise = client
      .connect()
      .then((connectedClient) => {
        cachedClient = connectedClient;
        cachedDb = connectedClient.db(MONGODB_DB_NAME);
        return { client: cachedClient, db: cachedDb };
      })
      .catch((error) => {
        clientPromise = null;

        if (
          error?.name === 'MongoServerSelectionError' &&
          error?.cause?.code === 'ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR'
        ) {
          throw new MongoConfigurationError(
            [
              'MongoDB Atlas відхилив TLS-з\'єднання.',
              'Переконайтеся, що ваш кластер дозволяє підключення з поточної IP-адреси та підтримує TLS 1.2.',
              'Для діагностики можна тимчасово встановити MONGODB_TLS_INSECURE=true або надати власний сертифікат через MONGODB_TLS_CA_FILE.',
              'Також спробуйте запустити Node з NODE_OPTIONS="--tls-min-v1.2" та перевірте значення MONGODB_URI.'
            ].join(' '),
            { cause: error }
          );
        }

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

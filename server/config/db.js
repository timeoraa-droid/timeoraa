const mongoose = require('mongoose');
const { logError } = require('../utils/logger');

let connectionPromise;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (connectionPromise) return connectionPromise;

  const configuredUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  const mongoUri = configuredUri || (process.env.NODE_ENV === 'production' || process.env.VERCEL
    ? ''
    : 'mongodb://127.0.0.1:27017/timeora_watches');
  if (!mongoUri) {
    throw new Error('MongoDB connection is not configured. Set MONGODB_URI in the server environment.');
  }

  connectionPromise = mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    bufferCommands: false,
  })
    .then((conn) => {
      console.log(`[TIMEORA Database] MongoDB Connected: ${conn.connection.host}`);
      return conn;
    })
    .catch((error) => {
      logError('MongoDB connection failed', { errorName: error.name, errorCode: error.code });
      throw error;
    })
    .finally(() => {
      connectionPromise = null;
    });
  return connectionPromise;
};

mongoose.connection.on('disconnected', () => {
  console.warn('[TIMEORA Database] MongoDB disconnected.');
});

mongoose.connection.on('error', (err) => {
  console.error('[TIMEORA Database] MongoDB connection error.', { errorName: err.name, errorCode: err.code });
});

mongoose.connection.on('connected', () => {
  console.log('[TIMEORA Database] MongoDB connected.');
});

module.exports = connectDB;

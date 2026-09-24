'use strict';

const mongoose = require('mongoose');


mongoose.set('strictQuery', true);

let isConnected = false;

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.error('[DB] FATAL: MONGO_URI is not defined in environment variables.');
    process.exit(1);
  }

  try {
    mongoose.connection.on('connected', () => {
      isConnected = true;
      console.log(`[DB] Mongoose connected -> ${mongoose.connection.name}`);
    });

    mongoose.connection.on('error', (err) => {
      console.error('[DB] Mongoose connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      isConnected = false;
      console.warn('[DB] Mongoose disconnected.');
    });

    mongoose.connection.on('reconnected', () => {
      isConnected = true;
      console.log('[DB] Mongoose reconnected.');
    });

    await mongoose.connect(mongoUri, {
      autoIndex: process.env.NODE_ENV !== 'production',
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      family: 4, 
      maxPoolSize: 10,
    });

    return mongoose.connection;
  } catch (err) {
    console.error('[DB] Initial connection failed:', err.message);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  if (!isConnected) return;
  try {
    await mongoose.connection.close(false);
    console.log('[DB] Mongoose connection closed gracefully.');
  } catch (err) {
    console.error('[DB] Error during disconnect:', err.message);
  }
};

// Graceful shutdown hooks
process.on('SIGINT', async () => {
  await disconnectDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectDB();
  process.exit(0);
});

const getConnectionState = () => ({
  isConnected,
  readyState: mongoose.connection.readyState, // 0=disconnected,1=connected,2=connecting,3=disconnecting
});

module.exports = {
  connectDB,
  disconnectDB,
  getConnectionState,
};
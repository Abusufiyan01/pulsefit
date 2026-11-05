/**
 * Database connection setup using Mongoose
 * Supports:
 * 1. Standard MongoDB URI (local or MongoDB Atlas via MONGODB_URI)
 * 2. Automatic zero-config embedded MongoDB fallback if no database daemon is detected
 */
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

let embeddedServer = null;

const connectDB = async () => {
  const targetUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pulsefit';

  try {
    const conn = await mongoose.connect(targetUri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 2500, // Quick check
    });

    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    // If testing and managed by mock, do not start embedded server
    if (process.env.NODE_ENV === 'test') {
      throw error;
    }

    console.warn(`[MongoDB] Could not reach '${targetUri}' (${error.message}).`);
    console.log('[MongoDB] Initializing zero-config embedded database engine...');

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const dbPath = path.join(__dirname, '../../data/db');
      if (!fs.existsSync(dbPath)) {
        fs.mkdirSync(dbPath, { recursive: true });
      }

      embeddedServer = await MongoMemoryServer.create({
        instance: {
          port: 27017,
          dbPath: dbPath,
          storageEngine: 'wiredTiger',
        },
      });

      const uri = `${embeddedServer.getUri()}pulsefit`;
      const conn = await mongoose.connect(uri, {
        autoIndex: true,
      });

      console.log(`[MongoDB] Embedded engine running and connected at: ${uri}`);
      return conn;
    } catch (embeddedErr) {
      // If port 27017 was taken or failed, try dynamic memory server
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        embeddedServer = await MongoMemoryServer.create();
        const uri = `${embeddedServer.getUri()}pulsefit`;
        const conn = await mongoose.connect(uri, {
          autoIndex: true,
        });
        console.log(`[MongoDB] In-memory engine running and connected at: ${uri}`);
        return conn;
      } catch (finalErr) {
        console.error(`[MongoDB] Fatal error starting database: ${finalErr.message}`);
        process.exit(1);
      }
    }
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    if (embeddedServer) {
      await embeddedServer.stop();
    }
    console.log('[MongoDB] Connection closed.');
  } catch (error) {
    console.error(`[MongoDB] Error disconnecting: ${error.message}`);
  }
};

module.exports = {
  connectDB,
  disconnectDB,
};

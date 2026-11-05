/**
 * PulseFit Standalone MongoDB Server (Zero-Config)
 * Runs an embedded MongoDB instance on port 27017 with persistent storage in server/data/db
 */
const path = require('path');
const fs = require('fs');
const { MongoMemoryServer } = require('mongodb-memory-server');

const dbPath = path.join(__dirname, '../data/db');
if (!fs.existsSync(dbPath)) {
  fs.mkdirSync(dbPath, { recursive: true });
}

async function startDb() {
  console.log('🚀 Starting PulseFit Embedded Database Engine...');
  console.log(`📁 Database Path: ${dbPath}`);

  try {
    const mongod = await MongoMemoryServer.create({
      instance: {
        port: 27017,
        dbPath: dbPath,
        storageEngine: 'wiredTiger',
      },
    });

    console.log(`✅ MongoDB active and listening at: ${mongod.getUri()}`);
    console.log('💡 You can now run `npm run seed` or `npm run dev` in another terminal.');

    // Graceful shutdown
    const cleanup = async () => {
      console.log('\n🛑 Shutting down database engine...');
      await mongod.stop();
      process.exit(0);
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
  } catch (err) {
    if (err.message && err.message.includes('EADDRINUSE')) {
      console.log('ℹ️  Port 27017 is already in use by a MongoDB instance. Ready to go!');
      process.exit(0);
    } else {
      console.error('❌ Failed to start database engine:', err);
      process.exit(1);
    }
  }
}

if (require.main === module) {
  startDb();
}

module.exports = { startDb };


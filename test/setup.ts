/**
 * Test Setup (runs before each test file)
 *
 * This file runs before each test file is executed.
 * It provides additional setup that complements the global setup.
 */

import { MikroORM } from '@mikro-orm/core';
import {
  getTestWorkerId,
  isParallelTestMode,
  getTestWorkerEnv,
  logWorkerConfig,
} from './utils/test-config';
import mikroOrmConfig from './mikro-orm.config';

// Increase timeout for database operations
jest.setTimeout(30000);

// Setup console logging with worker context in parallel mode
if (isParallelTestMode()) {
  const workerId = getTestWorkerId();
  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;

  console.log = (...args) => originalLog(`[Worker ${workerId}]`, ...args);
  console.error = (...args) => originalError(`[Worker ${workerId}]`, ...args);
  console.warn = (...args) => originalWarn(`[Worker ${workerId}]`, ...args);
}

// Database setup function
async function setupDatabase() {
  const workerId = getTestWorkerId();
  console.log(`🚀 Setting up database for worker ${workerId}...`);

  // Get worker-specific environment variables
  const testEnv = getTestWorkerEnv();

  // Log configuration in debug mode
  if (process.env.DEBUG_TESTS === 'true') {
    logWorkerConfig();
  }

  try {
    // Create connection to PostgreSQL server (not specific database)
    const serverConfig = {
      ...mikroOrmConfig,
      dbName: 'postgres', // Connect to default postgres database first
    };

    const orm = await MikroORM.init(serverConfig);

    // Create the test database if it doesn't exist
    const connection = orm.em.getConnection();

    console.log(`📦 Creating database: ${testEnv.TEST_DB_NAME}`);

    try {
      await connection.execute(`CREATE DATABASE "${testEnv.TEST_DB_NAME}"`);
      console.log(`✅ Database created: ${testEnv.TEST_DB_NAME}`);
    } catch (error: any) {
      if (error.code === '42P04') {
        console.log(`📦 Database ${testEnv.TEST_DB_NAME} already exists`);
      } else {
        throw error;
      }
    }

    await orm.close();

    // Now connect to the test database and set up schema
    const testOrmConfig = {
      ...mikroOrmConfig,
      dbName: testEnv.TEST_DB_NAME,
    };

    const testOrm = await MikroORM.init(testOrmConfig);

    console.log(`🗃️ Initializing database schema for worker ${workerId}...`);

    // Generate schema
    const generator = testOrm.getSchemaGenerator();
    await generator.dropSchema();
    await generator.createSchema();

    console.log(`✅ Database schema initialized for worker ${workerId}`);

    await testOrm.close();

    console.log(`✅ Database setup completed for worker ${workerId}`);
  } catch (error) {
    console.error(`❌ Database setup failed for worker ${workerId}:`, error);
    throw error;
  }
}

// Run database setup once per worker
let setupComplete = false;

beforeAll(async () => {
  if (!setupComplete) {
    await setupDatabase();
    setupComplete = true;
  }
});

// Global error handler for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  const workerId = getTestWorkerId();
  console.error(`[Worker ${workerId}] Unhandled promise rejection:`, reason);
});

// Ensure clean exit
process.on('SIGTERM', () => {
  const workerId = getTestWorkerId();
  console.log(
    `[Worker ${workerId}] Received SIGTERM, shutting down gracefully`,
  );
  process.exit(0);
});

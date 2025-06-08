/**
 * Main Test Setup (runs before each test file)
 *
 * This file runs before each test file is executed.
 * It provides the basic setup that works for all tests.
 *
 * For parallel testing, see test/parallel/ directory.
 */

import { MikroORM } from '@mikro-orm/core';
import mikroOrmConfig from './mikro-orm.config';

// Increase timeout for database operations
jest.setTimeout(30000);

// Simple database setup function for main tests
async function setupDatabase() {
  console.log('🚀 Setting up test database...');

  try {
    // Connect to the default test database
    const testOrmConfig = {
      ...mikroOrmConfig,
      dbName: process.env.TEST_DB_NAME || 'chirp_test',
    };

    const testOrm = await MikroORM.init(testOrmConfig);

    console.log('🗃️ Initializing database schema...');

    // Generate schema
    const generator = testOrm.getSchemaGenerator();
    await generator.dropSchema();
    await generator.createSchema();

    console.log('✅ Database schema initialized');

    await testOrm.close();

    console.log('✅ Database setup completed');
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    throw error;
  }
}

// Check if we're in parallel mode and use appropriate setup
let setupComplete = false;

beforeAll(async () => {
  if (!setupComplete) {
    if (process.env.TEST_PARALLEL === 'true') {
      // Use parallel setup
      const { setupParallelDatabase } = await import(
        './parallel/parallel-setup'
      );
      await setupParallelDatabase();
    } else {
      // Use simple sequential setup
      await setupDatabase();
    }
    setupComplete = true;
  }
});

// Global error handler for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled promise rejection:', reason);
});

// Ensure clean exit
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

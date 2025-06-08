import { Options } from '@mikro-orm/core';
import { getTestWorkerEnv, logWorkerConfig } from './utils/test-config';

// Get worker-specific environment variables
const testEnv = getTestWorkerEnv();

// Log configuration in debug mode
logWorkerConfig();

const config: Options = {
  entities: ['./src/entities/*.entity.ts'],
  type: 'postgresql',
  dbName: testEnv.TEST_DB_NAME,
  host: testEnv.TEST_DB_HOST,
  port: parseInt(testEnv.TEST_DB_PORT, 10),
  user: testEnv.TEST_DB_USER,
  password: testEnv.TEST_DB_PASSWORD,
  debug: false,
  allowGlobalContext: true,
  // Schema generator configuration (Django-like approach)
  schemaGenerator: {
    disableForeignKeys: true, // Temporarily disable FKs during schema operations
    createForeignKeyConstraints: true, // But ensure they are created
    ignoreSchema: [], // Don't ignore any schemas
  },
  // Validate required fields
  validateRequired: true,
  // Force UTC timezone for consistency
  forceUtcTimezone: true,
  // Use transactions for tests
  implicitTransactions: true,
  // Connection pool settings optimized for testing
  pool: {
    min: 1,
    max: 5, // Lower max connections for test environment
    acquireTimeoutMillis: 60000,
    idleTimeoutMillis: 30000,
  },
};

export default config;

/**
 * Parallel Testing Database Setup
 *
 * This module handles database setup specifically for parallel testing workers.
 * It's isolated from the main test setup to keep the main tests simple.
 */

import { MikroORM } from '@mikro-orm/core';
import {
  getTestWorkerId,
  getParallelTestWorkerEnv,
  logParallelWorkerConfig,
} from './parallel-config';
import mikroOrmConfig from '../mikro-orm.config';

export async function setupParallelDatabase() {
  const workerId = getTestWorkerId();
  console.log(`🚀 Setting up parallel database for worker ${workerId}...`);

  // Get worker-specific environment variables
  const testEnv = getParallelTestWorkerEnv();

  // Log configuration in debug mode
  if (process.env.DEBUG_TESTS === 'true') {
    logParallelWorkerConfig();
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

    console.log(`📦 Creating parallel database: ${testEnv.TEST_DB_NAME}`);

    try {
      await connection.execute(`CREATE DATABASE "${testEnv.TEST_DB_NAME}"`);
      console.log(`✅ Parallel database created: ${testEnv.TEST_DB_NAME}`);
    } catch (error: any) {
      if (error.code === '42P04') {
        console.log(
          `📦 Parallel database ${testEnv.TEST_DB_NAME} already exists`,
        );
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

    console.log(
      `🗃️ Initializing parallel database schema for worker ${workerId}...`,
    );

    // Generate schema
    const generator = testOrm.getSchemaGenerator();
    await generator.dropSchema();
    await generator.createSchema();

    console.log(
      `✅ Parallel database schema initialized for worker ${workerId}`,
    );

    await testOrm.close();

    console.log(`✅ Parallel database setup completed for worker ${workerId}`);
  } catch (error) {
    console.error(
      `❌ Parallel database setup failed for worker ${workerId}:`,
      error,
    );
    throw error;
  }
}

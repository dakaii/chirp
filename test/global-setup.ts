/**
 * Global Test Setup
 *
 * This file runs once before all tests. In parallel mode, it runs once per worker.
 * It's responsible for setting up the test environment, including databases.
 */

import { execSync } from 'child_process';
import {
  getTestWorkerId,
  getTestWorkerEnv,
  isParallelTestMode,
  logWorkerConfig,
} from './utils/test-config';

export default async function globalSetup() {
  const workerId = getTestWorkerId();
  const env = getTestWorkerEnv();
  const isParallel = isParallelTestMode();

  console.log(
    `🚀 Global setup starting for worker ${workerId}${isParallel ? ' (parallel mode)' : ''}`,
  );

  // Log configuration if debug mode is enabled
  logWorkerConfig();

  try {
    // In the future, this is where we would:
    // 1. Create worker-specific database instances
    // 2. Run migrations for each worker's database
    // 3. Set up any shared test fixtures

    if (isParallel) {
      console.log(`📦 Worker ${workerId} environment prepared`);
      console.log(`   Database: ${env.TEST_DB_NAME}`);
      console.log(`   Port: ${env.TEST_DB_PORT}`);
    }

    // For now, we'll just set up environment variables
    Object.assign(process.env, env);
  } catch (error) {
    console.error(`❌ Global setup failed for worker ${workerId}:`, error);
    throw error;
  }

  console.log(`✅ Global setup completed for worker ${workerId}`);
}

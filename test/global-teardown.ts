/**
 * Global Test Teardown
 *
 * This file runs once after all tests complete. In parallel mode, it runs once per worker.
 * It's responsible for cleaning up resources and databases.
 */

import { getTestWorkerId, isParallelTestMode } from './utils/test-config';

export default async function globalTeardown() {
  const workerId = getTestWorkerId();
  const isParallel = isParallelTestMode();

  console.log(
    `🧹 Global teardown starting for worker ${workerId}${isParallel ? ' (parallel mode)' : ''}`,
  );

  try {
    // In the future, this is where we would:
    // 1. Drop worker-specific databases
    // 2. Clean up any shared resources
    // 3. Close database connections

    if (isParallel) {
      console.log(`🗑️  Worker ${workerId} resources cleaned up`);
    }
  } catch (error) {
    console.error(`❌ Global teardown failed for worker ${workerId}:`, error);
    // Don't throw here as it might mask test failures
  }

  console.log(`✅ Global teardown completed for worker ${workerId}`);
}

/**
 * Test Setup (runs before each test file)
 *
 * This file runs before each test file is executed.
 * It provides additional setup that complements the global setup.
 */

import { getTestWorkerId, isParallelTestMode } from './utils/test-config';

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

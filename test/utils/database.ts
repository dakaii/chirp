import { EntityManager } from '@mikro-orm/core';
import { getTestWorkerId, isParallelTestMode } from './test-config';

export async function cleanDatabase(em: EntityManager) {
  const forkedEm = em.fork();
  const workerId = getTestWorkerId();

  try {
    // Get all table names dynamically from MikroORM metadata
    const metadata = em.getMetadata();
    const allMetadata = metadata.getAll();
    const tableNames = Object.values(allMetadata)
      .map((meta: any) => `"${meta.tableName}"`)
      .filter(Boolean); // Remove any undefined/null values

    if (tableNames.length === 0) {
      // No tables to clean, this can happen during initial setup
      return;
    }

    // Use TRUNCATE CASCADE to handle foreign key constraints automatically
    // RESTART IDENTITY resets auto-increment sequences
    // CASCADE automatically handles foreign key dependencies
    const truncateQuery = `TRUNCATE ${tableNames.join(', ')} RESTART IDENTITY CASCADE`;

    if (isParallelTestMode()) {
      // In parallel mode, add worker context to logs
      console.log(`Cleaning database tables:`, tableNames.length);
    }

    await forkedEm.getConnection().execute(truncateQuery);
  } catch (error) {
    const errorMessage = error.message?.toLowerCase() || '';

    // Handle common errors gracefully
    if (
      errorMessage.includes('does not exist') ||
      errorMessage.includes('relation') ||
      errorMessage.includes('table') ||
      errorMessage.includes('cannot truncate')
    ) {
      // Tables don't exist yet or can't be truncated - this is fine during setup
      if (isParallelTestMode()) {
        console.log(`Database cleanup skipped - tables not ready yet`);
      } else {
        console.log('Database cleanup skipped - tables not ready yet');
      }
      return;
    }

    // For other errors, log but don't fail tests
    console.warn(`Database cleanup warning:`, error.message);

    // Fallback: try to clear individual entities if truncate fails
    try {
      const metadata = em.getMetadata();
      const allMetadata = metadata.getAll();
      const entityNames = Object.values(allMetadata).map(
        (meta: any) => meta.className,
      );

      // Delete in reverse order to respect dependencies (usually)
      for (const entityName of entityNames.reverse()) {
        try {
          await forkedEm.nativeDelete(entityName, {});
        } catch (deleteError) {
          // Individual entity delete failed, skip it
          console.log(`Skipped cleaning ${entityName}:`, deleteError.message);
        }
      }

      await forkedEm.flush();
    } catch (fallbackError) {
      console.warn(`Fallback cleanup also failed:`, fallbackError.message);
    }
  }

  // Always clear the entity manager cache to ensure fresh state
  forkedEm.clear();
}

/**
 * Enhanced database cleanup with worker awareness
 * This function will be useful when we implement parallel testing
 */
export async function cleanDatabaseWithWorkerContext(
  em: EntityManager,
  context?: string,
): Promise<void> {
  const workerId = getTestWorkerId();

  if (context && isParallelTestMode()) {
    console.log(`Starting database cleanup for: ${context}`);
  }

  await cleanDatabase(em);

  if (context && isParallelTestMode()) {
    console.log(`Completed database cleanup for: ${context}`);
  }
}

/**
 * Utility to check database connectivity for a worker
 * Useful for debugging parallel test issues
 */
export async function checkDatabaseConnectivity(
  em: EntityManager,
): Promise<boolean> {
  const workerId = getTestWorkerId();

  try {
    await em.getConnection().execute('SELECT 1');
    if (isParallelTestMode()) {
      console.log(`Database connectivity: OK`);
    }
    return true;
  } catch (error) {
    console.error(`Database connectivity: FAILED`, error.message);
    return false;
  }
}

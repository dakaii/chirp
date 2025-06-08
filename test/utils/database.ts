import { EntityManager } from '@mikro-orm/core';

export async function cleanDatabase(em: EntityManager) {
  const forkedEm = em.fork();

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
      console.log('Database cleanup skipped - tables not ready yet');
      return;
    }

    // For other errors, log but don't fail tests
    console.warn('Database cleanup warning:', error.message);

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
      console.warn('Fallback cleanup also failed:', fallbackError.message);
    }
  }

  // Always clear the entity manager cache to ensure fresh state
  forkedEm.clear();
}

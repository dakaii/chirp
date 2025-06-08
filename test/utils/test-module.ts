import { Test, TestingModule } from '@nestjs/testing';
import { MikroORM } from '@mikro-orm/core';
import { AppModule } from '../../src/app.module';
import { createFactories } from '../factories';
import { createControllers } from '../controllers';
import { TestContext } from '../types';

export { TestContext };

export async function createTestingModule(): Promise<TestContext> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const orm = moduleFixture.get<MikroORM>(MikroORM);
  const em = orm.em;

  return {
    orm,
    ...createControllers(moduleFixture),
    ...createFactories(em),
  };
}

export async function cleanupTestingModule(
  context: TestContext,
): Promise<void> {
  await context.orm.close();
}

// Transaction-based test isolation (much more reliable than cleanup)
export async function withTestTransaction<T>(
  context: TestContext,
  testFn: () => Promise<T>,
): Promise<T> {
  return await context.orm.em.transactional(async (em) => {
    // All operations within this block use the same transaction
    // When the transaction ends, all changes are automatically rolled back
    return await testFn();
  });
}

// Legacy cleanup function for backwards compatibility
export async function cleanupDatabase(context: TestContext): Promise<void> {
  // For unit tests, we'll rely more on transaction isolation
  // But keep this for integration tests that need it
  const em = context.orm.em.fork();

  try {
    // Get all entity metadata from the ORM configuration
    const metadata = context.orm.getMetadata();
    const allMetadata = metadata.getAll();
    const entityNames = Object.values(allMetadata).map(
      (meta: any) => meta.className,
    );

    // Use PostgreSQL's CASCADE to handle foreign key dependencies
    await em.getConnection().execute('SET session_replication_role = replica;');

    // Delete all entities
    for (const entityName of entityNames) {
      await em.nativeDelete(entityName, {});
    }

    // Re-enable foreign key constraints
    await em.getConnection().execute('SET session_replication_role = DEFAULT;');

    // Flush all changes
    await em.flush();
  } catch (error) {
    // Re-enable foreign key constraints even if there was an error
    try {
      await em
        .getConnection()
        .execute('SET session_replication_role = DEFAULT;');
    } catch (resetError) {
      // Ignore reset errors
    }

    // If tables don't exist, that's fine
    if (
      !error.message.includes('does not exist') &&
      !error.message.includes('relation') &&
      !error.message.includes('table')
    ) {
      console.warn('Database cleanup warning:', error.message);
    }
  }

  // Clear the identity map
  em.clear();
}

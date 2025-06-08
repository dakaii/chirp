import { Test, TestingModule } from '@nestjs/testing';
import { MikroORM } from '@mikro-orm/core';
import { AppModule } from '../../src/app.module';
import testConfig from '../mikro-orm.config';
import { createFactories } from '../factories';
import { createControllers } from '../controllers';
import { TestContext } from '../types';

export { TestContext };

export async function createTestingModule(): Promise<TestContext> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(MikroORM)
    .useValue(await MikroORM.init(testConfig))
    .compile();

  const orm = moduleFixture.get<MikroORM>(MikroORM);

  // Use the same EntityManager for the entire test context
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

export async function cleanupDatabase(context: TestContext): Promise<void> {
  // Use MikroORM metadata to get all entities dynamically
  const em = context.orm.em.fork();

  try {
    // Get all entity metadata from the ORM configuration
    const metadata = context.orm.getMetadata();
    const allMetadata = metadata.getAll();
    const entityNames = Object.values(allMetadata).map(
      (meta: any) => meta.className,
    );

    // Use PostgreSQL's CASCADE to handle foreign key dependencies
    // This is more reliable than trying to order deletions manually
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

    // If tables don't exist, that's fine - they will be created by migrations
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

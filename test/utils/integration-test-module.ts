import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { MikroORM } from '@mikro-orm/core';
import { AppModule } from '../../src/app.module';
import { createFactories } from '../factories';
import { createControllers } from '../controllers';
import { IntegrationTestContext } from '../types';

export { IntegrationTestContext };

export async function createIntegrationTestingModule(): Promise<IntegrationTestContext> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  await app.init();

  const orm = moduleFixture.get<MikroORM>(MikroORM);

  // Use the same EntityManager for the entire test context
  const em = orm.em;

  return {
    app,
    orm,
    ...createControllers(moduleFixture),
    ...createFactories(em),
  };
}

export async function cleanupIntegrationTestingModule(
  context: IntegrationTestContext,
): Promise<void> {
  await context.app.close();
  await context.orm.close();
}

// Simple cleanup for sequential tests
export async function cleanupDatabase(
  context: IntegrationTestContext,
): Promise<void> {
  try {
    // Get all table names dynamically from metadata
    const metadata = context.orm.getMetadata();
    const allMetadata = metadata.getAll();
    const tableNames = Object.values(allMetadata).map(
      (meta: any) => `"${meta.tableName}"`,
    );

    if (tableNames.length > 0) {
      // TRUNCATE CASCADE clears all data and resets sequences
      const truncateQuery = `TRUNCATE ${tableNames.join(', ')} RESTART IDENTITY CASCADE`;
      await context.orm.em.getConnection().execute(truncateQuery);
    }

    // Clear entity manager caches to ensure fresh state
    context.orm.em.clear();
  } catch (error) {
    // Log but don't fail tests on cleanup errors
    console.warn(`Failed to cleanup database:`, error.message);
  }
}

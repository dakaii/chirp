import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { MikroORM } from '@mikro-orm/core';
import { AppModule } from '../../src/app.module';
import testConfig from '../mikro-orm.config';
import { createFactories } from '../factories';
import { createControllers } from '../controllers';
import { IntegrationTestContext } from '../types';

export { IntegrationTestContext };

export async function createIntegrationTestingModule(): Promise<IntegrationTestContext> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(MikroORM)
    .useValue(await MikroORM.init(testConfig))
    .compile();

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

// Simple and reliable cleanup for per-worker databases
export async function cleanupDatabase(
  context: IntegrationTestContext,
): Promise<void> {
  const em = context.orm.em.fork();

  try {
    // Get all table names dynamically from metadata
    const metadata = context.orm.getMetadata();
    const allMetadata = metadata.getAll();
    const tableNames = Object.values(allMetadata).map(
      (meta: any) => `"${meta.tableName}"`,
    );

    if (tableNames.length > 0) {
      // With per-worker databases, TRUNCATE CASCADE is safe and fast
      const truncateQuery = `TRUNCATE ${tableNames.join(', ')} RESTART IDENTITY CASCADE`;
      await em.getConnection().execute(truncateQuery);
    }
  } catch (error) {
    // In per-worker setup, failures should be rare. Log and re-throw for visibility
    console.error(`Failed to cleanup worker database:`, error.message);
    throw error;
  }

  // Clear all entity manager caches
  em.clear();
  context.orm.em.clear();
}

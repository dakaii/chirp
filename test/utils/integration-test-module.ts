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

export async function cleanupDatabase(
  context: IntegrationTestContext,
): Promise<void> {
  const forkedEm = context.orm.em.fork();
  try {
    // Get all user tables dynamically from PostgreSQL
    const result = await forkedEm.getConnection().execute(`
      SELECT tablename FROM pg_tables
      WHERE schemaname = 'public'
      AND tablename NOT LIKE 'pg_%'
      AND tablename NOT LIKE 'sql_%'
    `);

    const tableNames = result
      .map((row: any) => `"${row.tablename}"`)
      .join(', ');

    if (tableNames) {
      // Use PostgreSQL's constraint management to handle foreign keys properly
      await forkedEm.getConnection().execute(`
        DO $$ BEGIN
          -- Disable foreign key constraints
          EXECUTE 'SET CONSTRAINTS ALL DEFERRED';

          -- Truncate all user tables dynamically
          TRUNCATE TABLE ${tableNames} RESTART IDENTITY CASCADE;

          -- Re-enable foreign key constraints
          EXECUTE 'SET CONSTRAINTS ALL IMMEDIATE';
        END $$;
      `);
    }
  } catch (error) {
    // If tables don't exist, that's fine - they will be created by migrations
    if (
      !error.message.includes('does not exist') &&
      !error.message.includes('relation') &&
      !error.message.includes('table')
    ) {
      throw error;
    }
  }

  // Clear the identity map of the forked EntityManager
  forkedEm.clear();
}

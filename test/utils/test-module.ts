import { Test, TestingModule } from '@nestjs/testing';
import { MikroORM } from '@mikro-orm/core';
import { AppModule } from '../../src/app.module';
import { createFactories } from '../factories';
import { createControllers } from '../controllers';
import { TestContext } from '../types';
import { cleanDatabase } from './database';

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

// Simple cleanup for unit tests (backwards compatibility)
export async function cleanupDatabase(context: TestContext): Promise<void> {
  // Use the existing cleanDatabase function for consistency
  await cleanDatabase(context.orm.em);
}

// Transaction-based test isolation (much more reliable than cleanup)
export async function withTestTransaction<T>(
  context: TestContext,
  testFunction: () => Promise<T>,
): Promise<T> {
  return context.orm.em.transactional(async () => {
    return await testFunction();
  });
}

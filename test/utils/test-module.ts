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

// Database cleanup for unit tests - ensures clean state between tests
export async function cleanupDatabase(context: TestContext): Promise<void> {
  // Use the existing cleanDatabase function for consistency
  await cleanDatabase(context.orm.em);
}

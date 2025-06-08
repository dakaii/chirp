import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { MikroORM } from '@mikro-orm/core';
import { AppModule } from '../../src/app.module';
import { createFactories } from '../factories';
import { createControllers } from '../controllers';
import { IntegrationTestContext } from '../types';
import { cleanDatabase } from './database';

export { IntegrationTestContext };

export async function createIntegrationTestingModule(): Promise<IntegrationTestContext> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  await app.init();

  const orm = moduleFixture.get<MikroORM>(MikroORM);
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

// Simple cleanup for sequential tests (backwards compatibility)
export async function cleanupDatabase(
  context: IntegrationTestContext,
): Promise<void> {
  // Use the existing cleanDatabase function
  await cleanDatabase(context.orm.em);
}

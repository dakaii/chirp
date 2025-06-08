import { INestApplication } from '@nestjs/common';
import { MikroORM } from '@mikro-orm/core';
import { TestFactories } from '../factories';
import { TestControllers } from '../controllers';

export interface TestContext extends TestFactories, TestControllers {
  orm: MikroORM;
}

export interface IntegrationTestContext extends TestContext {
  app: INestApplication;
}

// Add any other shared types here

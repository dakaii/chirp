import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { MikroORM } from '@mikro-orm/core';
import { AppModule } from '../../src/app.module';
import testConfig from '../mikro-orm.config';
import { UserFactory } from '../factories/user.factory';
import { PostFactory } from '../factories/post.factory';
import { CommentFactory } from '../factories/comment.factory';
import { cleanDatabase } from './database';

export interface IntegrationTestContext {
  app: INestApplication;
  orm: MikroORM;
  userFactory: UserFactory;
  postFactory: PostFactory;
  commentFactory: CommentFactory;
}

export async function createIntegrationTestModule(): Promise<IntegrationTestContext> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(MikroORM)
    .useValue(await MikroORM.init(testConfig))
    .compile();

  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(new ValidationPipe());
  await app.init();

  const orm = app.get<MikroORM>(MikroORM);
  const em = orm.em.fork();

  await cleanDatabase(em);

  return {
    app,
    orm,
    userFactory: new UserFactory(em),
    postFactory: new PostFactory(em),
    commentFactory: new CommentFactory(em),
  };
}

export async function cleanupIntegrationTestModule(
  context: IntegrationTestContext,
) {
  const em = context.orm.em.fork();
  await cleanDatabase(em);
  await context.orm.close();
  await context.app.close();
}

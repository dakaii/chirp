import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { MikroORM } from '@mikro-orm/core';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from '../../src/entities/user.entity';
import { Post } from '../../src/entities/post.entity';
import { Comment } from '../../src/entities/comment.entity';
import { UsersService } from '../../src/services/users.service';
import { PostsService } from '../../src/services/posts.service';
import { CommentsService } from '../../src/services/comments.service';
import { UsersController } from '../../src/controllers/users.controller';
import { PostsController } from '../../src/controllers/posts.controller';
import { CommentsController } from '../../src/controllers/comments.controller';
import mikroOrmConfig from '../mikro-orm.config';
import { createTestDataProvider, TestDataProvider } from './test-data-provider';

export interface IntegrationTestContext {
  app: INestApplication;
  module: TestingModule;
  orm: MikroORM;
  data: TestDataProvider;
}

export async function createIntegrationTestingModule(): Promise<IntegrationTestContext> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [
      MikroOrmModule.forRoot(mikroOrmConfig),
      MikroOrmModule.forFeature([User, Post, Comment]),
    ],
    controllers: [UsersController, PostsController, CommentsController],
    providers: [UsersService, PostsService, CommentsService],
  }).compile();

  const app = moduleFixture.createNestApplication();
  await app.init();

  const orm = moduleFixture.get<MikroORM>(MikroORM);

  // Create data provider that handles entity creation with factories
  const data = createTestDataProvider(orm.em);

  return {
    app,
    module: moduleFixture,
    orm,
    data,
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
  const em = context.orm.em.fork();

  // Clean all tables completely - no seeded data to preserve
  await em.nativeDelete(Comment, {});
  await em.nativeDelete(Post, {});
  await em.nativeDelete(User, {});

  console.log('✅ Database tables cleaned');
}

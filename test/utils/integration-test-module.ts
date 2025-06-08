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
import { createFactories } from '../factories';
import { createControllers } from '../controllers';
import { IntegrationTestContext } from '../types';
import { cleanDatabase } from './database';

export { IntegrationTestContext };

export async function createIntegrationTestingModule(): Promise<IntegrationTestContext> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [
      MikroOrmModule.forRoot(),
      MikroOrmModule.forFeature([User, Post, Comment]),
    ],
    controllers: [UsersController, PostsController, CommentsController],
    providers: [UsersService, PostsService, CommentsService],
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
  if (context?.app) {
    await context.app.close();
  }
  if (context?.orm) {
    await context.orm.close();
  }
}

// Simple cleanup for sequential tests (backwards compatibility)
export async function cleanupDatabase(
  context: IntegrationTestContext,
): Promise<void> {
  // Use the existing cleanDatabase function
  if (context?.orm?.em) {
    await cleanDatabase(context.orm.em);
  }
}

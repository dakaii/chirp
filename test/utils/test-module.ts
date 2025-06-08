import { Test, TestingModule } from '@nestjs/testing';
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
import { TestContext } from '../types';
import { cleanDatabase } from './database';

export { TestContext };

export async function createTestingModule(): Promise<TestContext> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [
      MikroOrmModule.forRoot(),
      MikroOrmModule.forFeature([User, Post, Comment]),
    ],
    controllers: [UsersController, PostsController, CommentsController],
    providers: [UsersService, PostsService, CommentsService],
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
  if (context?.orm) {
    await context.orm.close();
  }
}

// Database cleanup for unit tests - ensures clean state between tests
export async function cleanupDatabase(context: TestContext): Promise<void> {
  // Use the existing cleanDatabase function for consistency
  if (context?.orm?.em) {
    await cleanDatabase(context.orm.em);
  }
}

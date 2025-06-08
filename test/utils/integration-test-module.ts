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

/**
 * Ensure seeded users exist in the database for tests to reference
 */
async function ensureSeededUsers(orm: MikroORM): Promise<void> {
  const em = orm.em.fork();

  // Check if seeded users already exist
  const existingUsers = await em.find(User, { id: { $in: [1, 2, 3] } });

  if (existingUsers.length < 3) {
    console.log('🌱 Creating seeded users for integration tests...');

    // Create/update seeded users
    for (let i = 1; i <= 3; i++) {
      let user = await em.findOne(User, { id: i });

      if (!user) {
        user = em.create(User, {
          id: i,
          username: `test_user_${i}`,
          email: `test_user_${i}@example.com`,
          password: 'password123',
        });
      }
    }

    await em.flush();
    console.log('✅ Seeded users ready for integration tests');
  }
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

  // Ensure seeded users exist for this test context
  await ensureSeededUsers(orm);

  // Create data provider that handles entity provision from outside
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

  // Clean tables in correct order (handle foreign keys)
  await em.nativeDelete(Comment, {});
  await em.nativeDelete(Post, {});
  // Only delete users that are NOT seeded (preserve IDs 1, 2, 3)
  await em.nativeDelete(User, { id: { $gt: 3 } });

  console.log('Cleaning database tables (preserving seeded users)');
}

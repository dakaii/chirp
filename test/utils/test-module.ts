import { Test, TestingModule } from '@nestjs/testing';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { EntityManager, MikroORM } from '@mikro-orm/core';
import testConfig from '../mikro-orm.config';
import { User } from '../../src/entities/user.entity';
import { Post } from '../../src/entities/post.entity';
import { Comment } from '../../src/entities/comment.entity';
import { UsersController } from '../../src/controllers/users.controller';
import { PostsController } from '../../src/controllers/posts.controller';
import { CommentsController } from '../../src/controllers/comments.controller';
import { UsersService } from '../../src/services/users.service';
import { PostsService } from '../../src/services/posts.service';
import { CommentsService } from '../../src/services/comments.service';
import { UserFactory } from '../factories/user.factory';
import { PostFactory } from '../factories/post.factory';
import { CommentFactory } from '../factories/comment.factory';
import { cleanDatabase } from './database';

export interface TestContext {
  module: TestingModule;
  orm: MikroORM;
  em: EntityManager;
  userFactory: UserFactory;
  postFactory: PostFactory;
  commentFactory: CommentFactory;
  usersController: UsersController;
  postsController: PostsController;
  commentsController: CommentsController;
}

export async function createTestingModule(): Promise<TestContext> {
  process.env.NODE_ENV = 'test';
  const orm = await MikroORM.init(testConfig);

  const module = await Test.createTestingModule({
    imports: [
      MikroOrmModule.forRoot(testConfig),
      MikroOrmModule.forFeature([User, Post, Comment]),
    ],
    controllers: [UsersController, PostsController, CommentsController],
    providers: [
      UsersService,
      PostsService,
      CommentsService,
      UserFactory,
      PostFactory,
      CommentFactory,
    ],
  }).compile();

  const em = module.get<EntityManager>(EntityManager);
  await cleanDatabase(em);

  return {
    module,
    orm,
    em,
    userFactory: module.get<UserFactory>(UserFactory),
    postFactory: module.get<PostFactory>(PostFactory),
    commentFactory: module.get<CommentFactory>(CommentFactory),
    usersController: module.get<UsersController>(UsersController),
    postsController: module.get<PostsController>(PostsController),
    commentsController: module.get<CommentsController>(CommentsController),
  };
}

export async function cleanupTestingModule(context: TestContext) {
  await cleanDatabase(context.em);
  await context.orm.close();
  await context.module.close();
}

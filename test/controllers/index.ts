import { TestingModule } from '@nestjs/testing';
import { UsersController } from '../../src/controllers/users.controller';
import { PostsController } from '../../src/controllers/posts.controller';
import { CommentsController } from '../../src/controllers/comments.controller';

export interface TestControllers {
  usersController: UsersController;
  postsController: PostsController;
  commentsController: CommentsController;
}

export function createControllers(
  moduleFixture: TestingModule,
): TestControllers {
  return {
    usersController: moduleFixture.get<UsersController>(UsersController),
    postsController: moduleFixture.get<PostsController>(PostsController),
    commentsController:
      moduleFixture.get<CommentsController>(CommentsController),
  };
}

export { UsersController, PostsController, CommentsController };

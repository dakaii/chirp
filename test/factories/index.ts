import { EntityManager } from '@mikro-orm/core';
import { UserFactory } from './user.factory';
import { PostFactory } from './post.factory';
import { CommentFactory } from './comment.factory';

export interface TestFactories {
  userFactory: UserFactory;
  postFactory: PostFactory;
  commentFactory: CommentFactory;
}

export function createFactories(em: EntityManager): TestFactories {
  return {
    userFactory: new UserFactory(em),
    postFactory: new PostFactory(em),
    commentFactory: new CommentFactory(em),
  };
}

export { UserFactory, PostFactory, CommentFactory };

/**
 * Factory Provider - Clean Separation of Concerns
 *
 * This provider handles all parallel testing complexity so that:
 * 1. Main factories stay simple and focused
 * 2. Parallel logic is centralized in one place
 * 3. Tests just call factories.createUser() without knowing about workers
 */

import { EntityManager } from '@mikro-orm/core';
import { User } from '../../src/entities/user.entity';
import { Post } from '../../src/entities/post.entity';
import { Comment } from '../../src/entities/comment.entity';
import { UserFactory } from '../factories/user.factory';
import { PostFactory } from '../factories/post.factory';
import { CommentFactory } from '../factories/comment.factory';

export interface TestFactories {
  createUser(data?: Partial<User>): Promise<User>;
  createPost(data?: Partial<Post> & { user?: User }): Promise<Post>;
  createComment(
    data?: Partial<Comment> & { user?: User; post?: Post },
  ): Promise<Comment>;
  createManyUsers(count: number, data?: Partial<User>): Promise<User[]>;
  createManyPosts(
    count: number,
    data?: Partial<Post> & { user?: User },
  ): Promise<Post[]>;
}

/**
 * Simple factories for sequential testing
 */
class SequentialFactories implements TestFactories {
  private userFactory: UserFactory;
  private postFactory: PostFactory;
  private commentFactory: CommentFactory;

  constructor(em: EntityManager) {
    this.userFactory = new UserFactory(em);
    this.postFactory = new PostFactory(em);
    this.commentFactory = new CommentFactory(em);
  }

  async createUser(data?: Partial<User>): Promise<User> {
    return this.userFactory.create(data);
  }

  async createPost(data?: Partial<Post> & { user?: User }): Promise<Post> {
    return this.postFactory.create(data);
  }

  async createComment(
    data?: Partial<Comment> & { user?: User; post?: Post },
  ): Promise<Comment> {
    return this.commentFactory.create(data);
  }

  async createManyUsers(count: number, data?: Partial<User>): Promise<User[]> {
    return this.userFactory.createMany(count, data);
  }

  async createManyPosts(
    count: number,
    data?: Partial<Post> & { user?: User },
  ): Promise<Post[]> {
    return this.postFactory.createMany(count, data);
  }
}

/**
 * Parallel-aware factories for parallel testing
 */
class ParallelFactories implements TestFactories {
  private parallelUserFactory: any;
  private parallelPostFactory: any;
  private commentFactory: CommentFactory;
  private initialized = false;

  constructor(private em: EntityManager) {
    this.commentFactory = new CommentFactory(em);
  }

  private async ensureInitialized() {
    if (!this.initialized) {
      const { ParallelUserFactory } = await import(
        '../parallel/factories/user.factory'
      );
      const { ParallelPostFactory } = await import(
        '../parallel/factories/post.factory'
      );

      this.parallelUserFactory = new ParallelUserFactory(this.em);
      this.parallelPostFactory = new ParallelPostFactory(this.em);
      this.initialized = true;
    }
  }

  async createUser(data?: Partial<User>): Promise<User> {
    await this.ensureInitialized();
    return this.parallelUserFactory.create(data);
  }

  async createPost(data?: Partial<Post> & { user?: User }): Promise<Post> {
    await this.ensureInitialized();
    return this.parallelPostFactory.create(data);
  }

  async createComment(
    data?: Partial<Comment> & { user?: User; post?: Post },
  ): Promise<Comment> {
    return this.commentFactory.create(data);
  }

  async createManyUsers(count: number, data?: Partial<User>): Promise<User[]> {
    await this.ensureInitialized();
    return this.parallelUserFactory.createMany(count, data);
  }

  async createManyPosts(
    count: number,
    data?: Partial<Post> & { user?: User },
  ): Promise<Post[]> {
    await this.ensureInitialized();
    return this.parallelPostFactory.createMany(count, data);
  }
}

/**
 * Get the appropriate factories based on test mode
 * This is the ONLY place that knows about parallel vs sequential testing
 */
export function createTestFactories(em: EntityManager): TestFactories {
  if (process.env.TEST_PARALLEL === 'true') {
    return new ParallelFactories(em);
  }
  return new SequentialFactories(em);
}

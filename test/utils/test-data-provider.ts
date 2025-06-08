/**
 * Test Data Provider - Provides Seeded Entities to Tests
 *
 * Simple provider that gives access to seeded entities and factories.
 * No redundant wrapper functions - just clean access to what you need.
 */

import { EntityManager } from '@mikro-orm/core';
import { User } from '../../src/entities/user.entity';
import { UserFactory } from '../factories/user.factory';
import { PostFactory } from '../factories/post.factory';
import { CommentFactory } from '../factories/comment.factory';

export class TestDataProvider {
  // Expose factories directly - no wrappers needed
  readonly userFactory: UserFactory;
  readonly postFactory: PostFactory;
  readonly commentFactory: CommentFactory;

  constructor(private em: EntityManager) {
    this.userFactory = new UserFactory(em);
    this.postFactory = new PostFactory(em);
    this.commentFactory = new CommentFactory(em);
  }

  /**
   * Get a seeded user that exists in every worker database
   */
  getSeededUser(id: number = 1): User {
    return this.em.getReference(User, id);
  }
}

/**
 * Create test data provider for current context
 */
export function createTestDataProvider(em: EntityManager): TestDataProvider {
  return new TestDataProvider(em);
}

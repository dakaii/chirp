/**
 * Parallel Post Factory
 *
 * This factory ensures posts are created with users that exist in the same
 * worker's database, preventing foreign key constraint violations.
 */

import { EntityManager } from '@mikro-orm/core';
import { Post } from '../../../src/entities/post.entity';
import { User } from '../../../src/entities/user.entity';
import { faker } from '@faker-js/faker';
import { getTestWorkerId } from '../parallel-config';
import { ParallelUserFactory } from './user.factory';

export class ParallelPostFactory {
  constructor(private readonly em: EntityManager) {}

  async create(data: Partial<Post> & { user?: User } = {}): Promise<Post> {
    const { user, ...rest } = data;
    const workerId = getTestWorkerId();

    // Always ensure we have a user in this worker's database
    let targetUser = user;
    if (!targetUser) {
      const userFactory = new ParallelUserFactory(this.em);
      targetUser = await userFactory.create();
    } else {
      // If user is provided, make sure it's persisted in this worker's database
      if (!targetUser.id) {
        await this.em.persistAndFlush(targetUser);
      }
    }

    const post = this.em.create(Post, {
      title: `Worker${workerId} ${faker.lorem.sentence()}`,
      content: faker.lorem.paragraphs(3),
      createdAt: new Date(),
      user: targetUser,
      ...rest,
    });

    await this.em.persistAndFlush(post);
    return post;
  }

  async createMany(
    count: number,
    data: Partial<Post> & { user?: User } = {},
  ): Promise<Post[]> {
    const { user, ...rest } = data;
    const posts: Post[] = [];

    // Create a user for all posts if none provided
    let targetUser = user;
    if (!targetUser) {
      const userFactory = new ParallelUserFactory(this.em);
      targetUser = await userFactory.create();
    }

    for (let i = 0; i < count; i++) {
      const post = this.em.create(Post, {
        title: `Batch Post ${i} - ${faker.lorem.sentence()}`,
        content: faker.lorem.paragraphs(2),
        createdAt: new Date(),
        user: targetUser,
        ...rest,
      });
      posts.push(post);
    }

    await this.em.persistAndFlush(posts);
    return posts;
  }
}

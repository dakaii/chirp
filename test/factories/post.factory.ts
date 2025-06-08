import { EntityManager } from '@mikro-orm/core';
import { Post } from '../../src/entities/post.entity';
import { User } from '../../src/entities/user.entity';
import { faker } from '@faker-js/faker';

export class PostFactory {
  constructor(private readonly em: EntityManager) {}

  async create(user: User, partial: Partial<Post> = {}): Promise<Post> {
    const post = this.em.create(Post, {
      title: partial.title || faker.lorem.sentence(),
      content: partial.content || faker.lorem.paragraphs(),
      user,
      createdAt: new Date(),
      ...partial,
    });

    await this.em.persistAndFlush(post);
    return post;
  }

  async createMany(
    user: User,
    count: number,
    partial: Partial<Post> = {},
  ): Promise<Post[]> {
    const posts: Post[] = [];
    for (let i = 0; i < count; i++) {
      posts.push(await this.create(user, partial));
    }
    return posts;
  }
}

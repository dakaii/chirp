import { EntityManager } from '@mikro-orm/core';
import { Post } from '../../src/entities/post.entity';
import { User } from '../../src/entities/user.entity';
import { faker } from '@faker-js/faker';

export class PostFactory {
  constructor(private readonly em: EntityManager) {}

  async create(data: Partial<Post> & { user: User }): Promise<Post> {
    const { user, ...rest } = data;

    const post = this.em.create(Post, {
      title: faker.lorem.sentence(),
      content: faker.lorem.paragraphs(3),
      createdAt: new Date(),
      user,
      ...rest,
    });

    await this.em.persistAndFlush(post);
    return post;
  }

  async createMany(
    count: number,
    data: Partial<Post> & { user: User },
  ): Promise<Post[]> {
    const { user, ...rest } = data;

    const posts: Post[] = [];
    for (let i = 0; i < count; i++) {
      const post = this.em.create(Post, {
        title: `${faker.lorem.sentence()} ${i}`,
        content: faker.lorem.paragraphs(2),
        createdAt: new Date(),
        user,
        ...rest,
      });
      posts.push(post);
    }

    await this.em.persistAndFlush(posts);
    return posts;
  }
}

import { EntityManager } from '@mikro-orm/core';
import { Post } from '../../src/entities/post.entity';
import { User } from '../../src/entities/user.entity';
import { faker } from '@faker-js/faker';

export class PostFactory {
  constructor(private readonly em: EntityManager) {}

  async create(data: Partial<Post> & { user?: User } = {}): Promise<Post> {
    let { user, ...rest } = data;

    // If no user is provided, create one
    if (!user) {
      user = this.em.create(User, {
        username: faker.internet.userName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
      });
      await this.em.persistAndFlush(user);
    }

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
    data: Partial<Post> & { user?: User } = {},
  ): Promise<Post[]> {
    let { user, ...rest } = data;

    // If no user is provided, create one
    if (!user) {
      user = this.em.create(User, {
        username: faker.internet.userName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
      });
      await this.em.persistAndFlush(user);
    }

    const posts = Array.from({ length: count }, () =>
      this.em.create(Post, {
        title: faker.lorem.sentence(),
        content: faker.lorem.paragraphs(3),
        createdAt: new Date(),
        user,
        ...rest,
      }),
    );

    await this.em.persistAndFlush(posts);
    return posts;
  }
}

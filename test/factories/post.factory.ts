import { EntityManager } from '@mikro-orm/core';
import { Post } from '../../src/entities/post.entity';
import { User } from '../../src/entities/user.entity';
import { faker } from '@faker-js/faker';

export class PostFactory {
  constructor(private readonly em: EntityManager) {}

  async create(data: Partial<Post> & { user?: User } = {}): Promise<Post> {
    // Fork the EntityManager to avoid conflicts
    const em = this.em.fork();

    let { user, ...rest } = data;

    // If no user is provided, create one
    if (!user) {
      user = em.create(User, {
        username: faker.internet.userName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
      });
      await em.persistAndFlush(user);
    }

    const post = em.create(Post, {
      title: faker.lorem.sentence(),
      content: faker.lorem.paragraphs(3),
      createdAt: new Date(),
      user,
      ...rest,
    });

    await em.persistAndFlush(post);
    return post;
  }

  async createMany(
    count: number,
    data: Partial<Post> & { user?: User } = {},
  ): Promise<Post[]> {
    // Fork the EntityManager to avoid conflicts
    const em = this.em.fork();

    let { user, ...rest } = data;

    // If no user is provided, create one
    if (!user) {
      user = em.create(User, {
        username: faker.internet.userName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
      });
      await em.persistAndFlush(user);
    }

    const posts = Array.from({ length: count }, () =>
      em.create(Post, {
        title: faker.lorem.sentence(),
        content: faker.lorem.paragraphs(3),
        createdAt: new Date(),
        user,
        ...rest,
      }),
    );

    await em.persistAndFlush(posts);
    return posts;
  }
}

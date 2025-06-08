import { EntityManager } from '@mikro-orm/core';
import { Post } from '../../src/entities/post.entity';
import { User } from '../../src/entities/user.entity';
import { faker } from '@faker-js/faker';

export class PostFactory {
  constructor(private readonly em: EntityManager) {}

  async create(data: Partial<Post> & { user?: User } = {}): Promise<Post> {
    const { user, ...rest } = data;

    // Get or create user
    let targetUser = user;
    if (!targetUser) {
      targetUser = this.em.create(User, {
        username: `${faker.internet.userName()}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}@${faker.internet.domainName()}`,
        password: faker.internet.password(),
      });
      await this.em.persistAndFlush(targetUser);
    }

    const post = this.em.create(Post, {
      title: faker.lorem.sentence(),
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

    // Get or create user once for all posts
    let targetUser = user;
    if (!targetUser) {
      targetUser = this.em.create(User, {
        username: `${faker.internet.userName()}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}@${faker.internet.domainName()}`,
        password: faker.internet.password(),
      });
      await this.em.persistAndFlush(targetUser);
    }

    const posts: Post[] = [];
    for (let i = 0; i < count; i++) {
      const post = this.em.create(Post, {
        title: faker.lorem.sentence(),
        content: faker.lorem.paragraphs(3),
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

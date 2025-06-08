import { EntityManager } from '@mikro-orm/core';
import { Comment } from '../../src/entities/comment.entity';
import { User } from '../../src/entities/user.entity';
import { Post } from '../../src/entities/post.entity';
import { faker } from '@faker-js/faker';

export class CommentFactory {
  constructor(private readonly em: EntityManager) {}

  async create(
    data: Partial<Comment> & { user?: User; post?: Post } = {},
  ): Promise<Comment> {
    // Fork the EntityManager to avoid conflicts
    const em = this.em.fork();

    let { user, post, ...rest } = data;

    // If no user is provided, create one
    if (!user) {
      user = em.create(User, {
        username: faker.internet.userName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
      });
      await em.persistAndFlush(user);
    }

    // If no post is provided, create one (with the user)
    if (!post) {
      post = em.create(Post, {
        title: faker.lorem.sentence(),
        content: faker.lorem.paragraphs(3),
        createdAt: new Date(),
        user,
      });
      await em.persistAndFlush(post);
    }

    const comment = em.create(Comment, {
      content: faker.lorem.paragraph(),
      createdAt: new Date(),
      user,
      post,
      ...rest,
    });

    await em.persistAndFlush(comment);
    return comment;
  }

  async createMany(
    count: number,
    data: Partial<Comment> & { user?: User; post?: Post } = {},
  ): Promise<Comment[]> {
    // Fork the EntityManager to avoid conflicts
    const em = this.em.fork();

    let { user, post, ...rest } = data;

    // If no user is provided, create one
    if (!user) {
      user = em.create(User, {
        username: faker.internet.userName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
      });
      await em.persistAndFlush(user);
    }

    // If no post is provided, create one (with the user)
    if (!post) {
      post = em.create(Post, {
        title: faker.lorem.sentence(),
        content: faker.lorem.paragraphs(3),
        createdAt: new Date(),
        user,
      });
      await em.persistAndFlush(post);
    }

    const comments = Array.from({ length: count }, () =>
      em.create(Comment, {
        content: faker.lorem.paragraph(),
        createdAt: new Date(),
        user,
        post,
        ...rest,
      }),
    );

    await em.persistAndFlush(comments);
    return comments;
  }
}

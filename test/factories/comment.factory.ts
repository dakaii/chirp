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
    let { user, post, ...rest } = data;

    // If no user is provided, create one
    if (!user) {
      user = this.em.create(User, {
        username: faker.internet.userName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
      });
      await this.em.persistAndFlush(user);
    }

    // If no post is provided, create one (with the user)
    if (!post) {
      post = this.em.create(Post, {
        title: faker.lorem.sentence(),
        content: faker.lorem.paragraphs(3),
        createdAt: new Date(),
        user,
      });
      await this.em.persistAndFlush(post);
    }

    const comment = this.em.create(Comment, {
      content: faker.lorem.paragraph(),
      createdAt: new Date(),
      user,
      post,
      ...rest,
    });

    await this.em.persistAndFlush(comment);
    return comment;
  }

  async createMany(
    count: number,
    data: Partial<Comment> & { user?: User; post?: Post } = {},
  ): Promise<Comment[]> {
    let { user, post, ...rest } = data;

    // If no user is provided, create one
    if (!user) {
      user = this.em.create(User, {
        username: faker.internet.userName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
      });
      await this.em.persistAndFlush(user);
    }

    // If no post is provided, create one (with the user)
    if (!post) {
      post = this.em.create(Post, {
        title: faker.lorem.sentence(),
        content: faker.lorem.paragraphs(3),
        createdAt: new Date(),
        user,
      });
      await this.em.persistAndFlush(post);
    }

    const comments = Array.from({ length: count }, () =>
      this.em.create(Comment, {
        content: faker.lorem.paragraph(),
        createdAt: new Date(),
        user,
        post,
        ...rest,
      }),
    );

    await this.em.persistAndFlush(comments);
    return comments;
  }
}

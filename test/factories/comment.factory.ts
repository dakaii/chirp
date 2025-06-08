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
    const { user, post, ...rest } = data;

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

    // Get or create post
    let targetPost = post;
    if (!targetPost) {
      targetPost = this.em.create(Post, {
        title: faker.lorem.sentence(),
        content: faker.lorem.paragraphs(3),
        createdAt: new Date(),
        user: targetUser,
      });
      await this.em.persistAndFlush(targetPost);
    }

    const comment = this.em.create(Comment, {
      content: faker.lorem.paragraph(),
      createdAt: new Date(),
      user: targetUser,
      post: targetPost,
      ...rest,
    });

    await this.em.persistAndFlush(comment);
    return comment;
  }

  async createMany(
    count: number,
    data: Partial<Comment> & { user?: User; post?: Post } = {},
  ): Promise<Comment[]> {
    const { user, post, ...rest } = data;

    // Get or create user once for all comments
    let targetUser = user;
    if (!targetUser) {
      targetUser = this.em.create(User, {
        username: `${faker.internet.userName()}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}@${faker.internet.domainName()}`,
        password: faker.internet.password(),
      });
      await this.em.persistAndFlush(targetUser);
    }

    // Get or create post once for all comments
    let targetPost = post;
    if (!targetPost) {
      targetPost = this.em.create(Post, {
        title: faker.lorem.sentence(),
        content: faker.lorem.paragraphs(3),
        createdAt: new Date(),
        user: targetUser,
      });
      await this.em.persistAndFlush(targetPost);
    }

    const comments: Comment[] = [];
    for (let i = 0; i < count; i++) {
      const comment = this.em.create(Comment, {
        content: faker.lorem.paragraph(),
        createdAt: new Date(),
        user: targetUser,
        post: targetPost,
        ...rest,
      });
      comments.push(comment);
    }

    await this.em.persistAndFlush(comments);
    return comments;
  }
}

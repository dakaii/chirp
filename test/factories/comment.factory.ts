import { EntityManager } from '@mikro-orm/core';
import { Comment } from '../../src/entities/comment.entity';
import { User } from '../../src/entities/user.entity';
import { Post } from '../../src/entities/post.entity';
import { faker } from '@faker-js/faker';

export class CommentFactory {
  constructor(private readonly em: EntityManager) {}

  async create(
    data: Partial<Comment> & { user: User; post: Post },
  ): Promise<Comment> {
    const { user, post, ...rest } = data;

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
    data: Partial<Comment> & { user: User; post: Post },
  ): Promise<Comment[]> {
    const { user, post, ...rest } = data;

    const comments: Comment[] = [];
    for (let i = 0; i < count; i++) {
      const comment = this.em.create(Comment, {
        content: faker.lorem.paragraph(),
        createdAt: new Date(),
        user,
        post,
        ...rest,
      });
      comments.push(comment);
    }

    await this.em.persistAndFlush(comments);
    return comments;
  }
}

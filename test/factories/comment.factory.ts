import { EntityManager } from '@mikro-orm/core';
import { Comment } from '../../src/entities/comment.entity';
import { User } from '../../src/entities/user.entity';
import { Post } from '../../src/entities/post.entity';
import { faker } from '@faker-js/faker';

export class CommentFactory {
  constructor(private readonly em: EntityManager) {}

  async create(
    user: User,
    post: Post,
    partial: Partial<Comment> = {},
  ): Promise<Comment> {
    const comment = this.em.create(Comment, {
      content: partial.content || faker.lorem.paragraph(),
      user,
      post,
      createdAt: new Date(),
      ...partial,
    });

    await this.em.persistAndFlush(comment);
    return comment;
  }

  async createMany(
    user: User,
    post: Post,
    count: number,
    partial: Partial<Comment> = {},
  ): Promise<Comment[]> {
    const comments: Comment[] = [];
    for (let i = 0; i < count; i++) {
      comments.push(await this.create(user, post, partial));
    }
    return comments;
  }
}

import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Comment } from '../../src/entities/comment.entity';
import { Post } from '../../src/entities/post.entity';
import { User } from '../../src/entities/user.entity';
import { faker } from '@faker-js/faker';

@Injectable()
export class CommentFactory {
  constructor(private readonly em: EntityManager) {}

  async create(
    partial: Partial<Comment> & { post: Post; user: User },
  ): Promise<Comment> {
    const { post, user, ...rest } = partial;
    const comment = this.em.create(Comment, {
      content: rest.content || faker.lorem.paragraph(),
      createdAt: new Date(),
      post,
      user,
      ...rest,
    });

    await this.em.persistAndFlush(comment);
    return comment;
  }

  async createMany(
    count: number,
    partial: Partial<Comment> & { post: Post; user: User },
  ): Promise<Comment[]> {
    const comments: Comment[] = [];
    for (let i = 0; i < count; i++) {
      comments.push(await this.create(partial));
    }
    return comments;
  }
}

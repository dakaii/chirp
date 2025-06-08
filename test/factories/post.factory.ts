import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Post } from '../../src/entities/post.entity';
import { User } from '../../src/entities/user.entity';
import { faker } from '@faker-js/faker';

@Injectable()
export class PostFactory {
  constructor(private readonly em: EntityManager) {}

  async create(partial: Partial<Post> & { user: User }): Promise<Post> {
    const { user, ...rest } = partial;
    const post = this.em.create(Post, {
      title: rest.title || faker.lorem.sentence(),
      content: rest.content || faker.lorem.paragraphs(),
      createdAt: new Date(),
      user,
      ...rest,
    });

    await this.em.persistAndFlush(post);
    return post;
  }

  async createMany(
    count: number,
    partial: Partial<Post> & { user: User },
  ): Promise<Post[]> {
    const posts: Post[] = [];
    for (let i = 0; i < count; i++) {
      posts.push(await this.create(partial));
    }
    return posts;
  }
}

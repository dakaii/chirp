import { EntityManager } from '@mikro-orm/core';
import { User } from '../../src/entities/user.entity';
import { faker } from '@faker-js/faker';

export class UserFactory {
  constructor(private readonly em: EntityManager) {}

  async create(partial: Partial<User> = {}): Promise<User> {
    const user = this.em.create(User, {
      username: partial.username || faker.internet.userName(),
      email: partial.email || faker.internet.email(),
      password: partial.password || faker.internet.password(),
      ...partial,
    });

    await this.em.persistAndFlush(user);
    return user;
  }

  async createMany(
    count: number,
    partial: Partial<User> = {},
  ): Promise<User[]> {
    const users: User[] = [];
    for (let i = 0; i < count; i++) {
      users.push(await this.create(partial));
    }
    return users;
  }
}

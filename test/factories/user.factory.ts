import { EntityManager } from '@mikro-orm/core';
import { User } from '../../src/entities/user.entity';
import { faker } from '@faker-js/faker';

export class UserFactory {
  constructor(private readonly em: EntityManager) {}

  async create(data: Partial<User> = {}): Promise<User> {
    const user = this.em.create(User, {
      username: faker.internet.userName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      ...data,
    });

    await this.em.persistAndFlush(user);
    return user;
  }

  async createMany(count: number, data: Partial<User> = {}): Promise<User[]> {
    const users = Array.from({ length: count }, () =>
      this.em.create(User, {
        username: faker.internet.userName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        ...data,
      }),
    );

    await this.em.persistAndFlush(users);
    return users;
  }
}

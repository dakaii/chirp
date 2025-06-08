import { EntityManager } from '@mikro-orm/core';
import { User } from '../../src/entities/user.entity';
import { faker } from '@faker-js/faker';

export class UserFactory {
  constructor(private readonly em: EntityManager) {}

  async create(data: Partial<User> = {}): Promise<User> {
    // Fork the EntityManager to avoid conflicts
    const em = this.em.fork();

    const user = em.create(User, {
      username: faker.internet.userName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      ...data,
    });

    await em.persistAndFlush(user);
    return user;
  }

  async createMany(count: number, data: Partial<User> = {}): Promise<User[]> {
    // Fork the EntityManager to avoid conflicts
    const em = this.em.fork();

    const users = Array.from({ length: count }, () =>
      em.create(User, {
        username: faker.internet.userName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        ...data,
      }),
    );

    await em.persistAndFlush(users);
    return users;
  }
}

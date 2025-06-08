import { EntityManager } from '@mikro-orm/core';
import { User } from '../../src/entities/user.entity';
import { faker } from '@faker-js/faker';

export class UserFactory {
  constructor(private readonly em: EntityManager) {}

  async create(data: Partial<User> = {}): Promise<User> {
    const user = this.em.create(User, {
      username: `${faker.internet.userName()}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}@${faker.internet.domainName()}`,
      password: faker.internet.password(),
      ...data,
    });

    await this.em.persistAndFlush(user);
    return user;
  }

  async createMany(count: number, data: Partial<User> = {}): Promise<User[]> {
    const users: User[] = [];

    for (let i = 0; i < count; i++) {
      const user = this.em.create(User, {
        username: `${faker.internet.userName()}_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`,
        email: `${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}@${faker.internet.domainName()}`,
        password: faker.internet.password(),
        ...data,
      });
      users.push(user);
    }

    await this.em.persistAndFlush(users);
    return users;
  }
}

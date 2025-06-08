/**
 * Parallel User Factory
 *
 * This factory is designed for parallel testing where each worker
 * has its own isolated database. It ensures unique data per worker.
 */

import { EntityManager } from '@mikro-orm/core';
import { User } from '../../../src/entities/user.entity';
import { faker } from '@faker-js/faker';
import { getTestWorkerId } from '../parallel-config';

export class ParallelUserFactory {
  constructor(private readonly em: EntityManager) {}

  async create(data: Partial<User> = {}): Promise<User> {
    const workerId = getTestWorkerId();

    const user = this.em.create(User, {
      username: `worker${workerId}_${faker.internet.userName()}_${Date.now()}`,
      email: `worker${workerId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}@example.com`,
      password: faker.internet.password(),
      ...data,
    });

    await this.em.persistAndFlush(user);
    return user;
  }

  async createMany(count: number, data: Partial<User> = {}): Promise<User[]> {
    const users: User[] = [];

    for (let i = 0; i < count; i++) {
      const user = await this.create({
        ...data,
        // Ensure each user in the batch is unique
        username: data.username ? `${data.username}_${i}` : undefined,
        email: data.email ? `${i}_${data.email}` : undefined,
      });
      users.push(user);
    }

    return users;
  }
}

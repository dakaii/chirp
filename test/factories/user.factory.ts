import { Factory } from '@mikro-orm/seeder';
import { User } from '../../src/entities/user.entity';
import { faker } from '@faker-js/faker';

export class UserFactory extends Factory<User> {
  model = User;

  definition(): Partial<User> {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substr(2, 9);

    return {
      username: `${faker.internet.userName()}_${timestamp}_${randomSuffix}`,
      email: `${timestamp}_${randomSuffix}@${faker.internet.domainName()}`,
      password: faker.internet.password(),
    };
  }
}

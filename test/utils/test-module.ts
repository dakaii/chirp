import { Test, TestingModule } from '@nestjs/testing';
import { MikroORM } from '@mikro-orm/core';
import { AppModule } from '../../src/app.module';
import testConfig from '../mikro-orm.config';
import { createFactories } from '../factories';
import { createControllers } from '../controllers';
import { TestContext } from '../types';

export { TestContext };

export async function createTestingModule(): Promise<TestContext> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(MikroORM)
    .useValue(await MikroORM.init(testConfig))
    .compile();

  const orm = moduleFixture.get<MikroORM>(MikroORM);

  // Use the same EntityManager for the entire test context
  const em = orm.em;

  return {
    orm,
    ...createControllers(moduleFixture),
    ...createFactories(em),
  };
}

export async function cleanupTestingModule(
  context: TestContext,
): Promise<void> {
  await context.orm.close();
}

export async function cleanupDatabase(context: TestContext): Promise<void> {
  const em = context.orm.em.fork();

  try {
    // For PostgreSQL, we need to delete in the correct order to avoid foreign key violations
    // Delete comments first (they reference posts and users)
    await em.nativeDelete('Comment', {});

    // Delete posts second (they reference users)
    await em.nativeDelete('Post', {});

    // Delete users last (they are referenced by posts and comments)
    await em.nativeDelete('User', {});

    // Reset sequences
    await em
      .getConnection()
      .execute('ALTER SEQUENCE comment_id_seq RESTART WITH 1');
    await em
      .getConnection()
      .execute('ALTER SEQUENCE post_id_seq RESTART WITH 1');
    await em
      .getConnection()
      .execute('ALTER SEQUENCE user_id_seq RESTART WITH 1');
  } catch (error) {
    // Fallback: try with TRUNCATE CASCADE (might work in some PostgreSQL configurations)
    console.warn(
      'Native delete failed, trying TRUNCATE CASCADE:',
      error.message,
    );
    try {
      await em
        .getConnection()
        .execute(
          'TRUNCATE TABLE "comment", "post", "user" RESTART IDENTITY CASCADE',
        );
    } catch (truncateError) {
      console.error('Both cleanup methods failed:', truncateError.message);
      throw truncateError;
    }
  }

  await em.clear();
}

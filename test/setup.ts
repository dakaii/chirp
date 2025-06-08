/**
 * Main Test Setup (runs before each test file)
 *
 * This file runs before each test file is executed.
 * It conditionally loads parallel or sequential setup based on TEST_PARALLEL environment variable.
 */

import { MikroORM } from '@mikro-orm/core';
import { User } from '../src/entities/user.entity';
import mikroOrmConfig from './mikro-orm.config';

// Increase timeout for database operations
jest.setTimeout(30000);

// Conditionally load parallel setup if TEST_PARALLEL is enabled
if (process.env.TEST_PARALLEL === 'true') {
  // Import and use parallel setup for worker databases
  const { setupParallelDatabase } = require('./parallel/parallel-setup');

  // Setup once before all tests in this worker
  let parallelSetupComplete = false;

  beforeAll(async () => {
    if (!parallelSetupComplete) {
      await setupParallelDatabase();
      parallelSetupComplete = true;
    }
  });
} else {
  // Use sequential setup for regular testing

  /**
   * Simple database setup function for sequential tests
   */
  async function setupSequentialDatabase() {
    console.log('🚀 Setting up sequential test database...');

    try {
      // Connect to the default test database
      const testOrmConfig = {
        ...mikroOrmConfig,
        dbName: process.env.TEST_DB_NAME || 'chirp_test',
      };

      const testOrm = await MikroORM.init(testOrmConfig);

      console.log('🗃️ Initializing database schema...');

      // Generate schema
      const generator = testOrm.getSchemaGenerator();
      await generator.dropSchema();
      await generator.createSchema();

      // 🎯 SEED BASIC ENTITIES - This solves foreign key issues!
      await seedBasicEntities(testOrm);

      console.log('✅ Database schema initialized');

      await testOrm.close();

      console.log('✅ Sequential database setup completed');
    } catch (error) {
      console.error('❌ Sequential database setup failed:', error);
      throw error;
    }
  }

  /**
   * Seed database with basic entities that factories can reference
   * This solves foreign key constraint violations without complicating factories
   */
  async function seedBasicEntities(orm: MikroORM) {
    const em = orm.em;

    console.log('🌱 Seeding basic entities...');

    // Create basic users that will always exist (IDs 1, 2, 3)
    const users: User[] = [];
    for (let i = 1; i <= 3; i++) {
      const user = em.create(User, {
        id: i,
        username: `test_user_${i}`,
        email: `test_user_${i}@example.com`,
        password: 'password123',
      });
      users.push(user);
    }

    await em.persistAndFlush(users);
    console.log(`✅ Seeded ${users.length} basic users`);
  }

  // Setup once before all tests
  let setupComplete = false;

  beforeAll(async () => {
    if (!setupComplete) {
      await setupSequentialDatabase();
      setupComplete = true;
    }
  });
}

// Global error handlers (apply to both parallel and sequential tests)
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled promise rejection:', reason);
});

// Ensure clean exit
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

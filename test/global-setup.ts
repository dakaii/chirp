import { MikroORM } from '@mikro-orm/core';
import testConfig from './mikro-orm.config';

export default async function globalSetup() {
  const orm = await MikroORM.init(testConfig);

  try {
    // Drop all existing tables (like Django does)
    const generator = orm.getSchemaGenerator();
    await generator.dropSchema();

    // Create fresh schema from entities (like Django's model creation)
    await generator.createSchema();

    // Update schema if needed (like Django's implicit migrations)
    await generator.updateSchema();
  } catch (error) {
    console.error('Error during test database setup:', error);
    throw error;
  } finally {
    await orm.close();
  }
}

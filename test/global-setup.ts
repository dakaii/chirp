import { MikroORM } from '@mikro-orm/core';
import testConfig from './mikro-orm.config';

export default async function globalSetup() {
  const orm = await MikroORM.init(testConfig);

  try {
    console.log(`Setting up test database: ${orm.config.get('dbName')}`);

    // Drop all existing tables (like Django does)
    const generator = orm.getSchemaGenerator();
    await generator.dropSchema();

    // Create fresh schema from entities (like Django's model creation)
    await generator.createSchema();

    // Update schema if needed (like Django's implicit migrations)
    await generator.updateSchema();

    console.log(`✓ Database ${orm.config.get('dbName')} ready`);
  } catch (error) {
    // If database doesn't exist, create it
    if (error.message.includes('does not exist')) {
      console.log(`Creating database: ${orm.config.get('dbName')}`);
      // The database will be created automatically by PostgreSQL
    } else {
      console.error(
        `Error setting up database ${orm.config.get('dbName')}:`,
        error,
      );
    }
  } finally {
    await orm.close();
  }
}

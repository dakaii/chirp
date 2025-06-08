import { Options } from '@mikro-orm/core';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';

const config: Options = {
  metadataProvider: TsMorphMetadataProvider,
  entities: ['./src/entities/*.entity.ts'],
  type: 'postgresql',
  dbName: process.env.TEST_DB_NAME || 'chirp_test',
  host: process.env.TEST_DB_HOST || 'test-db',
  port: +(process.env.TEST_DB_PORT || 5432),
  user: process.env.TEST_DB_USER || 'postgres',
  password: process.env.TEST_DB_PASSWORD || 'postgres',
  debug: false,
  allowGlobalContext: true,
  // Schema generator configuration (Django-like approach)
  schemaGenerator: {
    disableForeignKeys: true, // Temporarily disable FKs during schema operations
    createForeignKeyConstraints: true, // But ensure they are created
    ignoreSchema: [], // Don't ignore any schemas
  },
  // Validate required fields
  validateRequired: true,
  // Force UTC timezone for consistency
  forceUtcTimezone: true,
  // Use transactions for tests
  implicitTransactions: true,
};

export default config;

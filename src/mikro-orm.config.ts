import { Options } from '@mikro-orm/core';

const config: Options = {
  entities:
    process.env.NODE_ENV === 'production'
      ? ['./dist/entities/*.entity.js']
      : ['./src/entities/*.entity.ts'],
  type: 'postgresql',
  dbName: process.env.DB_NAME || 'chirp',
  host: process.env.DB_HOST || 'db',
  port: +(process.env.DB_PORT || 5432),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  debug: process.env.NODE_ENV === 'development',
  allowGlobalContext:
    process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID !== undefined,
  migrations: {
    path: './migrations',
    glob: '!(*.d).{js,ts}',
    transactional: true,
    allOrNothing: true,
    snapshot: false,
  },
};

export default config;

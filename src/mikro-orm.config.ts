import { Options } from '@mikro-orm/core';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';

const config: Options = {
  metadataProvider: TsMorphMetadataProvider,
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
  migrations: {
    path: './migrations',
    glob: '!(*.d).{js,ts}',
    transactional: true,
    allOrNothing: true,
    snapshot: false,
  },
};

export default config;

import { defineConfig } from '@mikro-orm/postgresql';
import { User } from './entities/user.entity';
import { Post } from './entities/post.entity';
import { Comment } from './entities/comment.entity';

const isTest = process.env.NODE_ENV === 'test';

export default defineConfig({
  entities: [User, Post, Comment],
  dbName: isTest
    ? process.env.TEST_DB_NAME || 'chirp_test'
    : process.env.DB_NAME || 'chirp',
  host: isTest
    ? process.env.TEST_DB_HOST || 'localhost'
    : process.env.DB_HOST || 'localhost',
  port: isTest
    ? +(process.env.TEST_DB_PORT || 5433)
    : +(process.env.DB_PORT || 5432),
  user: isTest
    ? process.env.TEST_DB_USER || 'postgres'
    : process.env.DB_USER || 'postgres',
  password: isTest
    ? process.env.TEST_DB_PASSWORD || 'postgres'
    : process.env.DB_PASSWORD || 'postgres',
  debug: process.env.NODE_ENV === 'development',
  migrations: {
    path: './migrations',
    glob: '!(*.d).{js,ts}',
    transactional: true,
    allOrNothing: true,
    safe: true,
  },
  allowGlobalContext: true,
  driverOptions: {
    connection: { ssl: false },
  },
});

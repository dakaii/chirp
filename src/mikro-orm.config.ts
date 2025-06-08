import { Options } from '@mikro-orm/core';
import { User } from './entities/user.entity';
import { Post } from './entities/post.entity';
import { Comment } from './entities/comment.entity';

const config: Options = {
  entities: [User, Post, Comment],
  type: 'postgresql',
  dbName:
    process.env.NODE_ENV === 'test'
      ? process.env.TEST_DB_NAME || 'chirp_test'
      : process.env.DB_NAME || 'chirp_db',
  host:
    process.env.NODE_ENV === 'test'
      ? process.env.TEST_DB_HOST || 'localhost'
      : process.env.DB_HOST || 'localhost',
  port:
    process.env.NODE_ENV === 'test'
      ? +(process.env.TEST_DB_PORT || 5432)
      : +(process.env.DB_PORT || 5432),
  user:
    process.env.NODE_ENV === 'test'
      ? process.env.TEST_DB_USER || 'postgres'
      : process.env.DB_USER || 'postgres',
  password:
    process.env.NODE_ENV === 'test'
      ? process.env.TEST_DB_PASSWORD || 'postgres'
      : process.env.DB_PASSWORD || 'postgres',
  debug: process.env.NODE_ENV === 'development',
  allowGlobalContext: process.env.NODE_ENV === 'test',
};

export default config;

import { EntityManager } from '@mikro-orm/core';
import { User } from '../../src/entities/user.entity';
import { Post } from '../../src/entities/post.entity';
import { Comment } from '../../src/entities/comment.entity';

export async function cleanDatabase(em: EntityManager) {
  const forkedEm = em.fork();
  try {
    // Disable foreign key checks, truncate tables, then re-enable foreign key checks
    await forkedEm.getConnection().execute(`
      DO $$ BEGIN
        -- Disable foreign key constraints
        EXECUTE 'SET CONSTRAINTS ALL DEFERRED';

        -- Truncate all tables
        TRUNCATE TABLE "comment", "post", "user" RESTART IDENTITY CASCADE;

        -- Re-enable foreign key constraints
        EXECUTE 'SET CONSTRAINTS ALL IMMEDIATE';
      END $$;
    `);
  } catch (error) {
    // If tables don't exist, that's fine - they will be created by migrations
    if (!error.message.includes('does not exist')) {
      throw error;
    }
  }

  // Clear the identity map of the forked EntityManager
  forkedEm.clear();
}

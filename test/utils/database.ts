import { EntityManager } from '@mikro-orm/core';

export async function cleanDatabase(em: EntityManager) {
  await em.getConnection().execute(`
    TRUNCATE TABLE "comment", "post", "user" RESTART IDENTITY CASCADE;
  `);
  await em.clear();
}

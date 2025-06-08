import { Migration } from '@mikro-orm/migrations';

export class Migration20240214000000 extends Migration {
  async up(): Promise<void> {
    this.addSql(`
      CREATE TABLE "user" (
        "id" SERIAL PRIMARY KEY,
        "username" VARCHAR(255) NOT NULL UNIQUE,
        "email" VARCHAR(255) NOT NULL UNIQUE,
        "password" VARCHAR(255) NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE "post" (
        "id" SERIAL PRIMARY KEY,
        "title" VARCHAR(255) NOT NULL,
        "content" TEXT NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "user_id" INTEGER NOT NULL REFERENCES "user"("id") ON DELETE CASCADE
      );

      CREATE TABLE "comment" (
        "id" SERIAL PRIMARY KEY,
        "content" TEXT NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "user_id" INTEGER NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
        "post_id" INTEGER NOT NULL REFERENCES "post"("id") ON DELETE CASCADE
      );

      CREATE INDEX "post_user_id_idx" ON "post"("user_id");
      CREATE INDEX "comment_user_id_idx" ON "comment"("user_id");
      CREATE INDEX "comment_post_id_idx" ON "comment"("post_id");
    `);
  }

  async down(): Promise<void> {
    this.addSql(`
      DROP TABLE IF EXISTS "comment";
      DROP TABLE IF EXISTS "post";
      DROP TABLE IF EXISTS "user";
    `);
  }
}

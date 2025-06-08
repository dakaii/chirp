import * as request from 'supertest';
import { User } from '../../src/entities/user.entity';
import { Post } from '../../src/entities/post.entity';
import {
  IntegrationTestContext,
  createIntegrationTestModule,
  cleanupIntegrationTestModule,
} from '../utils/integration-test-module';

describe('CommentsController (e2e)', () => {
  let context: IntegrationTestContext;
  let testUser: User;
  let testPost: Post;

  beforeAll(async () => {
    context = await createIntegrationTestModule();
  });

  beforeEach(async () => {
    const em = context.orm.em.fork();
    await em.getConnection().execute(`
      TRUNCATE TABLE "comment", "post", "user" RESTART IDENTITY CASCADE;
    `);
    await em.clear();

    // Create test user and post for each test
    testUser = await context.userFactory.create();
    testPost = await context.postFactory.create({ user: testUser });
  });

  afterAll(async () => {
    await cleanupIntegrationTestModule(context);
  });

  describe('POST /comments', () => {
    it('should create a new comment', () => {
      return request(context.app.getHttpServer())
        .post('/comments')
        .send({
          content: 'Test Comment',
          postId: testPost.id,
          userId: testUser.id,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.content).toBe('Test Comment');
          expect(res.body.user.id).toBe(testUser.id);
          expect(res.body.post.id).toBe(testPost.id);
        });
    });

    it('should return 400 for invalid data', () => {
      return request(context.app.getHttpServer())
        .post('/comments')
        .send({
          postId: testPost.id,
          userId: testUser.id,
          // missing content
        })
        .expect(400);
    });

    it('should return 404 for non-existent user', () => {
      return request(context.app.getHttpServer())
        .post('/comments')
        .send({
          content: 'Test Comment',
          postId: testPost.id,
          userId: 999,
        })
        .expect(404);
    });

    it('should return 404 for non-existent post', () => {
      return request(context.app.getHttpServer())
        .post('/comments')
        .send({
          content: 'Test Comment',
          postId: 999,
          userId: testUser.id,
        })
        .expect(404);
    });
  });

  describe('GET /comments/post/:postId', () => {
    it('should return comments for a specific post', async () => {
      await context.commentFactory.createMany(3, {
        user: testUser,
        post: testPost,
      });

      return request(context.app.getHttpServer())
        .get(`/comments/post/${testPost.id}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body).toHaveLength(3);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('content');
          expect(res.body[0].user.id).toBe(testUser.id);
        });
    });

    it('should return 404 for non-existent post', () => {
      return request(context.app.getHttpServer())
        .get('/comments/post/999')
        .expect(404);
    });
  });

  describe('GET /comments/user/:userId', () => {
    it('should return comments for a specific user', async () => {
      await context.commentFactory.createMany(3, {
        user: testUser,
        post: testPost,
      });

      return request(context.app.getHttpServer())
        .get(`/comments/user/${testUser.id}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body).toHaveLength(3);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('content');
          expect(res.body[0].post.id).toBe(testPost.id);
        });
    });

    it('should return 404 for non-existent user', () => {
      return request(context.app.getHttpServer())
        .get('/comments/user/999')
        .expect(404);
    });
  });

  describe('GET /comments/:id', () => {
    it('should return a comment by id', async () => {
      const comment = await context.commentFactory.create({
        user: testUser,
        post: testPost,
      });

      return request(context.app.getHttpServer())
        .get(`/comments/${comment.id}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(comment.id);
          expect(res.body.content).toBe(comment.content);
          expect(res.body.user.id).toBe(testUser.id);
          expect(res.body.post.id).toBe(testPost.id);
        });
    });

    it('should return 404 for non-existent comment', () => {
      return request(context.app.getHttpServer())
        .get('/comments/999')
        .expect(404);
    });
  });

  describe('PATCH /comments/:id', () => {
    it('should update a comment', async () => {
      const comment = await context.commentFactory.create({
        user: testUser,
        post: testPost,
      });

      return request(context.app.getHttpServer())
        .patch(`/comments/${comment.id}`)
        .send({
          content: 'Updated Comment',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(comment.id);
          expect(res.body.content).toBe('Updated Comment');
        });
    });

    it('should return 404 for non-existent comment', () => {
      return request(context.app.getHttpServer())
        .patch('/comments/999')
        .send({
          content: 'Updated Comment',
        })
        .expect(404);
    });
  });

  describe('DELETE /comments/:id', () => {
    it('should delete a comment', async () => {
      const comment = await context.commentFactory.create({
        user: testUser,
        post: testPost,
      });

      return request(context.app.getHttpServer())
        .delete(`/comments/${comment.id}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBe('Comment deleted successfully');
        });
    });

    it('should return 404 for non-existent comment', () => {
      return request(context.app.getHttpServer())
        .delete('/comments/999')
        .expect(404);
    });
  });
});

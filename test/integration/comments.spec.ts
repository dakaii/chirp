import * as request from 'supertest';
import { User } from '../../src/entities/user.entity';
import { Post } from '../../src/entities/post.entity';
import {
  IntegrationTestContext,
  createIntegrationTestModule,
  cleanupIntegrationTestModule,
  cleanupDatabase,
} from '../utils/integration-test-module';

describe('CommentsController (e2e)', () => {
  let context: IntegrationTestContext;
  let testUser: User;
  let testPost: Post;

  beforeAll(async () => {
    context = await createIntegrationTestModule();
  });

  beforeEach(async () => {
    await cleanupDatabase(context);
    testUser = await context.userFactory.create();
    testPost = await context.postFactory.create({ user: testUser });
  });

  afterAll(async () => {
    await cleanupIntegrationTestModule(context);
  });

  describe('POST /comments', () => {
    it('should create a new comment', async () => {
      const response = await request(context.app.getHttpServer())
        .post('/comments')
        .send({
          content: 'This is a test comment',
          userId: testUser.id,
          postId: testPost.id,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.content).toBe('This is a test comment');
      expect(response.body.user.id).toBe(testUser.id);
      expect(response.body.post.id).toBe(testPost.id);
    });

    it('should return 404 if user not found', async () => {
      const response = await request(context.app.getHttpServer())
        .post('/comments')
        .send({
          content: 'This is a test comment',
          userId: 999,
          postId: testPost.id,
        });

      expect(response.status).toBe(404);
    });

    it('should return 404 if post not found', async () => {
      const response = await request(context.app.getHttpServer())
        .post('/comments')
        .send({
          content: 'This is a test comment',
          userId: testUser.id,
          postId: 999,
        });

      expect(response.status).toBe(404);
    });
  });

  describe('GET /comments/by-post/:postId', () => {
    it('should return all comments for a post', async () => {
      await context.commentFactory.createMany(2, {
        user: testUser,
        post: testPost,
      });

      const response = await request(context.app.getHttpServer()).get(
        `/comments/by-post/${testPost.id}`,
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('content');
      expect(response.body[0].user.id).toBe(testUser.id);
      expect(response.body[0].post.id).toBe(testPost.id);
    });

    it('should return empty array if post has no comments', async () => {
      const response = await request(context.app.getHttpServer()).get(
        `/comments/by-post/${testPost.id}`,
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(0);
    });

    it('should return 404 if post not found', async () => {
      const response = await request(context.app.getHttpServer()).get(
        '/comments/by-post/999',
      );

      expect(response.status).toBe(404);
    });
  });

  describe('GET /comments/by-user/:userId', () => {
    it('should return all comments by a user', async () => {
      await context.commentFactory.createMany(2, {
        user: testUser,
        post: testPost,
      });

      const response = await request(context.app.getHttpServer()).get(
        `/comments/by-user/${testUser.id}`,
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('content');
      expect(response.body[0].user.id).toBe(testUser.id);
      expect(response.body[0].post.id).toBe(testPost.id);
    });

    it('should return empty array if user has no comments', async () => {
      const response = await request(context.app.getHttpServer()).get(
        `/comments/by-user/${testUser.id}`,
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(0);
    });

    it('should return 404 if user not found', async () => {
      const response = await request(context.app.getHttpServer()).get(
        '/comments/by-user/999',
      );

      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /comments/:id', () => {
    it('should update a comment', async () => {
      const comment = await context.commentFactory.create({
        user: testUser,
        post: testPost,
      });

      const response = await request(context.app.getHttpServer())
        .patch(`/comments/${comment.id}`)
        .send({
          content: 'Updated comment content',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', comment.id);
      expect(response.body).toHaveProperty(
        'content',
        'Updated comment content',
      );
      expect(response.body.user.id).toBe(testUser.id);
      expect(response.body.post.id).toBe(testPost.id);
    });

    it('should return 404 if comment not found', async () => {
      const response = await request(context.app.getHttpServer())
        .patch('/comments/999')
        .send({
          content: 'Updated comment content',
        });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /comments/:id', () => {
    it('should delete a comment', async () => {
      const comment = await context.commentFactory.create({
        user: testUser,
        post: testPost,
      });

      const response = await request(context.app.getHttpServer()).delete(
        `/comments/${comment.id}`,
      );

      expect(response.status).toBe(204);

      const getResponse = await request(context.app.getHttpServer()).get(
        `/comments/by-post/${testPost.id}`,
      );
      expect(getResponse.body).toHaveLength(0);
    });

    it('should return 404 if comment not found', async () => {
      const response = await request(context.app.getHttpServer()).delete(
        '/comments/999',
      );

      expect(response.status).toBe(404);
    });
  });
});

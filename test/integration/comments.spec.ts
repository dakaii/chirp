import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { User } from '../../src/entities/user.entity';
import { Post } from '../../src/entities/post.entity';
import {
  IntegrationTestContext,
  createIntegrationTestingModule,
  cleanupIntegrationTestingModule,
  cleanupDatabase,
} from '../utils/integration-test-module';

describe('CommentsController (e2e)', () => {
  let context: IntegrationTestContext;
  let testUser: User;
  let testPost: Post;

  beforeAll(async () => {
    context = await createIntegrationTestingModule();
  });

  beforeEach(async () => {
    await cleanupDatabase(context);
    testUser = await context.data.userFactory.create();
    testPost = await context.data.postFactory.create({ user: testUser });
  });

  afterAll(async () => {
    await cleanupIntegrationTestingModule(context);
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

  describe('GET /posts/:id/comments', () => {
    it('should return all comments for a post', async () => {
      await context.data.commentFactory.createMany(2, {
        user: testUser,
        post: testPost,
      });

      const response = await request(context.app.getHttpServer()).get(
        `/posts/${testPost.id}/comments`,
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
        `/posts/${testPost.id}/comments`,
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(0);
    });

    it('should return 404 if post not found', async () => {
      const response = await request(context.app.getHttpServer()).get(
        '/posts/999/comments',
      );

      expect(response.status).toBe(404);
    });
  });

  describe('GET /users/:id/comments', () => {
    it('should return all comments by a user', async () => {
      await context.data.commentFactory.createMany(2, {
        user: testUser,
        post: testPost,
      });

      const response = await request(context.app.getHttpServer()).get(
        `/users/${testUser.id}/comments`,
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
        `/users/${testUser.id}/comments`,
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(0);
    });

    it('should return 404 if user not found', async () => {
      const response = await request(context.app.getHttpServer()).get(
        '/users/999/comments',
      );

      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /comments/:id', () => {
    it('should update a comment', async () => {
      const comment = await context.data.commentFactory.create({
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
      const comment = await context.data.commentFactory.create({
        user: testUser,
        post: testPost,
      });

      const response = await request(context.app.getHttpServer()).delete(
        `/comments/${comment.id}`,
      );

      expect(response.status).toBe(204);

      const getResponse = await request(context.app.getHttpServer()).get(
        `/posts/${testPost.id}/comments`,
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

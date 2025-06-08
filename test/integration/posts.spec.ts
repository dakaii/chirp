import * as request from 'supertest';
import { User } from '../../src/entities/user.entity';
import {
  IntegrationTestContext,
  createIntegrationTestModule,
  cleanupIntegrationTestModule,
  cleanupDatabase,
} from '../utils/integration-test-module';

describe('PostsController (e2e)', () => {
  let context: IntegrationTestContext;
  let testUser: User;

  beforeAll(async () => {
    context = await createIntegrationTestModule();
  });

  beforeEach(async () => {
    await cleanupDatabase(context);
    testUser = await context.userFactory.create();
  });

  afterAll(async () => {
    await cleanupIntegrationTestModule(context);
  });

  describe('POST /posts', () => {
    it('should create a new post', async () => {
      const response = await request(context.app.getHttpServer())
        .post('/posts')
        .send({
          title: 'Test Post',
          content: 'This is a test post',
          userId: testUser.id,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('Test Post');
      expect(response.body.content).toBe('This is a test post');
      expect(response.body.user.id).toBe(testUser.id);
    });

    it('should return 404 if user not found', async () => {
      const response = await request(context.app.getHttpServer())
        .post('/posts')
        .send({
          title: 'Test Post',
          content: 'This is a test post',
          userId: 999,
        });

      expect(response.status).toBe(404);
    });
  });

  describe('GET /posts', () => {
    it('should return all posts', async () => {
      await context.postFactory.createMany(2, { user: testUser });

      const response = await request(context.app.getHttpServer()).get('/posts');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('title');
      expect(response.body[0]).toHaveProperty('content');
      expect(response.body[0].user.id).toBe(testUser.id);
    });
  });

  describe('GET /posts/:id', () => {
    it('should return a post by id', async () => {
      const post = await context.postFactory.create({ user: testUser });

      const response = await request(context.app.getHttpServer()).get(
        `/posts/${post.id}`,
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', post.id);
      expect(response.body).toHaveProperty('title', post.title);
      expect(response.body).toHaveProperty('content', post.content);
      expect(response.body.user).toHaveProperty('id', testUser.id);
    });

    it('should return 404 if post not found', async () => {
      const response = await request(context.app.getHttpServer()).get(
        '/posts/999',
      );

      expect(response.status).toBe(404);
    });
  });

  describe('GET /posts/user/:userId', () => {
    it('should return posts for a specific user', async () => {
      await context.postFactory.createMany(2, { user: testUser });

      const response = await request(context.app.getHttpServer()).get(
        `/posts/user/${testUser.id}`,
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('title');
      expect(response.body[0]).toHaveProperty('content');
      expect(response.body[0].user.id).toBe(testUser.id);
    });

    it('should return empty array if user has no posts', async () => {
      const response = await request(context.app.getHttpServer()).get(
        `/posts/user/${testUser.id}`,
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(0);
    });

    it('should return 404 if user not found', async () => {
      const response = await request(context.app.getHttpServer()).get(
        '/posts/user/999',
      );

      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /posts/:id', () => {
    it('should update a post', async () => {
      const post = await context.postFactory.create({ user: testUser });

      const response = await request(context.app.getHttpServer())
        .patch(`/posts/${post.id}`)
        .send({
          title: 'Updated Post',
          content: 'This is an updated post',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', post.id);
      expect(response.body).toHaveProperty('title', 'Updated Post');
      expect(response.body).toHaveProperty(
        'content',
        'This is an updated post',
      );
      expect(response.body.user.id).toBe(testUser.id);
    });

    it('should return 404 if post not found', async () => {
      const response = await request(context.app.getHttpServer())
        .patch('/posts/999')
        .send({
          title: 'Updated Post',
          content: 'This is an updated post',
        });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /posts/:id', () => {
    it('should delete a post', async () => {
      const post = await context.postFactory.create({ user: testUser });

      const response = await request(context.app.getHttpServer()).delete(
        `/posts/${post.id}`,
      );

      expect(response.status).toBe(204);

      const getResponse = await request(context.app.getHttpServer()).get(
        `/posts/${post.id}`,
      );
      expect(getResponse.status).toBe(404);
    });

    it('should return 404 if post not found', async () => {
      const response = await request(context.app.getHttpServer()).delete(
        '/posts/999',
      );

      expect(response.status).toBe(404);
    });
  });
});

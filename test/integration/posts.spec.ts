import * as request from 'supertest';
import { User } from '../../src/entities/user.entity';
import {
  IntegrationTestContext,
  createIntegrationTestModule,
  cleanupIntegrationTestModule,
} from '../utils/integration-test-module';

describe('PostsController (e2e)', () => {
  let context: IntegrationTestContext;
  let testUser: User;

  beforeAll(async () => {
    context = await createIntegrationTestModule();
  });

  beforeEach(async () => {
    const em = context.orm.em.fork();
    await em.getConnection().execute(`
      TRUNCATE TABLE "comment", "post", "user" RESTART IDENTITY CASCADE;
    `);
    await em.clear();

    // Create a test user for each test
    testUser = await context.userFactory.create();
  });

  afterAll(async () => {
    await cleanupIntegrationTestModule(context);
  });

  describe('POST /posts', () => {
    it('should create a new post', () => {
      return request(context.app.getHttpServer())
        .post('/posts')
        .send({
          title: 'Test Post',
          content: 'Test Content',
          userId: testUser.id,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.title).toBe('Test Post');
          expect(res.body.content).toBe('Test Content');
          expect(res.body.user.id).toBe(testUser.id);
        });
    });

    it('should return 400 for invalid data', () => {
      return request(context.app.getHttpServer())
        .post('/posts')
        .send({
          content: 'Test Content',
          userId: testUser.id,
          // missing title
        })
        .expect(400);
    });

    it('should return 404 for non-existent user', () => {
      return request(context.app.getHttpServer())
        .post('/posts')
        .send({
          title: 'Test Post',
          content: 'Test Content',
          userId: 999,
        })
        .expect(404);
    });
  });

  describe('GET /posts', () => {
    it('should return an array of posts', async () => {
      await context.postFactory.createMany(3, { user: testUser });

      return request(context.app.getHttpServer())
        .get('/posts')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body).toHaveLength(3);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('title');
          expect(res.body[0]).toHaveProperty('content');
          expect(res.body[0]).toHaveProperty('user');
        });
    });
  });

  describe('GET /posts/:id', () => {
    it('should return a post by id', async () => {
      const post = await context.postFactory.create({ user: testUser });

      return request(context.app.getHttpServer())
        .get(`/posts/${post.id}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(post.id);
          expect(res.body.title).toBe(post.title);
          expect(res.body.content).toBe(post.content);
          expect(res.body.user.id).toBe(testUser.id);
        });
    });

    it('should return 404 for non-existent post', () => {
      return request(context.app.getHttpServer()).get('/posts/999').expect(404);
    });
  });

  describe('GET /posts/user/:userId', () => {
    it('should return posts for a specific user', async () => {
      await context.postFactory.createMany(3, { user: testUser });

      return request(context.app.getHttpServer())
        .get(`/posts/user/${testUser.id}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body).toHaveLength(3);
          res.body.forEach((post) => {
            expect(post.user.id).toBe(testUser.id);
          });
        });
    });

    it('should return 404 for non-existent user', () => {
      return request(context.app.getHttpServer())
        .get('/posts/user/999')
        .expect(404);
    });
  });

  describe('PATCH /posts/:id', () => {
    it('should update a post', async () => {
      const post = await context.postFactory.create({ user: testUser });

      return request(context.app.getHttpServer())
        .patch(`/posts/${post.id}`)
        .send({
          title: 'Updated Title',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(post.id);
          expect(res.body.title).toBe('Updated Title');
          expect(res.body.content).toBe(post.content);
        });
    });

    it('should return 404 for non-existent post', () => {
      return request(context.app.getHttpServer())
        .patch('/posts/999')
        .send({
          title: 'Updated Title',
        })
        .expect(404);
    });
  });

  describe('DELETE /posts/:id', () => {
    it('should delete a post', async () => {
      const post = await context.postFactory.create({ user: testUser });

      return request(context.app.getHttpServer())
        .delete(`/posts/${post.id}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBe('Post deleted successfully');
        });
    });

    it('should return 404 for non-existent post', () => {
      return request(context.app.getHttpServer())
        .delete('/posts/999')
        .expect(404);
    });
  });
});

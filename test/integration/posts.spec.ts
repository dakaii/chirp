import * as request from 'supertest';
import {
  IntegrationTestContext,
  createIntegrationTestingModule,
  cleanupIntegrationTestingModule,
  cleanupDatabase,
} from '../utils/integration-test-module';

describe('PostsController (e2e)', () => {
  let context: IntegrationTestContext;

  beforeAll(async () => {
    context = await createIntegrationTestingModule();
  });

  afterEach(async () => {
    await cleanupDatabase(context);
  });

  afterAll(async () => {
    await cleanupIntegrationTestingModule(context);
  });

  describe('POST /posts', () => {
    it('should create a new post', async () => {
      const user = await context.data.userFactory.create();

      const createPostDto = {
        title: 'Test Post',
        content: 'This is a test post content',
        userId: user.id,
      };

      const response = await request(context.app.getHttpServer())
        .post('/posts')
        .send(createPostDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('Test Post');
      expect(response.body.content).toBe('This is a test post content');
      expect(response.body.user.id).toBe(user.id);
    });
  });

  describe('GET /posts', () => {
    it('should return all posts', async () => {
      const user = await context.data.userFactory.create();
      const posts = await Promise.all([
        context.data.postFactory.create({ title: 'Post 1', user }),
        context.data.postFactory.create({ title: 'Post 2', user }),
      ]);

      const response = await request(context.app.getHttpServer())
        .get('/posts')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('title');
      expect(response.body[0]).toHaveProperty('content');
    });
  });

  describe('GET /posts/:id', () => {
    it('should return a post by id', async () => {
      const user = await context.data.userFactory.create();
      const post = await context.data.postFactory.create({ user });

      const response = await request(context.app.getHttpServer())
        .get(`/posts/${post.id}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', post.id);
      expect(response.body).toHaveProperty('title', post.title);
      expect(response.body).toHaveProperty('content', post.content);
    });

    it('should return 404 for non-existent post', async () => {
      await request(context.app.getHttpServer()).get('/posts/999').expect(404);
    });
  });

  describe('PATCH /posts/:id', () => {
    it('should update a post', async () => {
      const user = await context.data.userFactory.create();
      const post = await context.data.postFactory.create({ user });
      const updatePostDto = {
        title: 'Updated Post',
        content: 'This is updated content',
      };

      const response = await request(context.app.getHttpServer())
        .patch(`/posts/${post.id}`)
        .send(updatePostDto)
        .expect(200);

      expect(response.body).toHaveProperty('id', post.id);
      expect(response.body).toHaveProperty('title', 'Updated Post');
      expect(response.body).toHaveProperty(
        'content',
        'This is updated content',
      );
    });
  });

  describe('DELETE /posts/:id', () => {
    it('should delete a post', async () => {
      const user = await context.data.userFactory.create();
      const post = await context.data.postFactory.create({ user });

      await request(context.app.getHttpServer())
        .delete(`/posts/${post.id}`)
        .expect(204);

      await request(context.app.getHttpServer())
        .get(`/posts/${post.id}`)
        .expect(404);
    });
  });

  describe('GET /posts/user/:userId', () => {
    it('should return posts by user', async () => {
      const user = await context.data.userFactory.create();
      const posts = await context.data.postFactory.createMany(3, { user });

      const response = await request(context.app.getHttpServer())
        .get(`/posts/user/${user.id}`)
        .expect(200);

      expect(response.body).toHaveLength(3);
      expect(response.body[0].user.id).toBe(user.id);
    });
  });
});

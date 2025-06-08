import * as request from 'supertest';
import {
  IntegrationTestContext,
  createIntegrationTestModule,
  cleanupIntegrationTestModule,
} from '../utils/integration-test-module';

describe('UsersController (e2e)', () => {
  let context: IntegrationTestContext;

  beforeAll(async () => {
    context = await createIntegrationTestModule();
  });

  beforeEach(async () => {
    const em = context.orm.em.fork();
    await em.getConnection().execute(`
      TRUNCATE TABLE "comment", "post", "user" RESTART IDENTITY CASCADE;
    `);
    await em.clear();
  });

  afterAll(async () => {
    await cleanupIntegrationTestModule(context);
  });

  describe('POST /users', () => {
    it('should create a new user', () => {
      return request(context.app.getHttpServer())
        .post('/users')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.username).toBe('testuser');
          expect(res.body.email).toBe('test@example.com');
          expect(res.body).not.toHaveProperty('password');
        });
    });

    it('should return 400 for invalid data', () => {
      return request(context.app.getHttpServer())
        .post('/users')
        .send({
          username: 'te', // too short
          email: 'invalid-email',
          password: '123', // too short
        })
        .expect(400);
    });
  });

  describe('GET /users', () => {
    it('should return an array of users', async () => {
      await context.userFactory.createMany(3);

      return request(context.app.getHttpServer())
        .get('/users')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body).toHaveLength(3);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('username');
          expect(res.body[0]).toHaveProperty('email');
          expect(res.body[0]).not.toHaveProperty('password');
        });
    });
  });

  describe('GET /users/:id', () => {
    it('should return a user by id', async () => {
      const user = await context.userFactory.create();

      return request(context.app.getHttpServer())
        .get(`/users/${user.id}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(user.id);
          expect(res.body.username).toBe(user.username);
          expect(res.body.email).toBe(user.email);
          expect(res.body).not.toHaveProperty('password');
        });
    });

    it('should return 404 for non-existent user', () => {
      return request(context.app.getHttpServer()).get('/users/999').expect(404);
    });
  });

  describe('PATCH /users/:id', () => {
    it('should update a user', async () => {
      const user = await context.userFactory.create();

      return request(context.app.getHttpServer())
        .patch(`/users/${user.id}`)
        .send({
          username: 'updated',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(user.id);
          expect(res.body.username).toBe('updated');
          expect(res.body.email).toBe(user.email);
          expect(res.body).not.toHaveProperty('password');
        });
    });

    it('should return 404 for non-existent user', () => {
      return request(context.app.getHttpServer())
        .patch('/users/999')
        .send({
          username: 'updated',
        })
        .expect(404);
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete a user', async () => {
      const user = await context.userFactory.create();

      return request(context.app.getHttpServer())
        .delete(`/users/${user.id}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBe('User deleted successfully');
        });
    });

    it('should return 404 for non-existent user', () => {
      return request(context.app.getHttpServer())
        .delete('/users/999')
        .expect(404);
    });
  });
});

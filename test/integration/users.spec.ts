import * as request from 'supertest';
import {
  IntegrationTestContext,
  createIntegrationTestingModule,
  cleanupIntegrationTestingModule,
  cleanupDatabase,
} from '../utils/integration-test-module';

describe('UsersController (e2e)', () => {
  let context: IntegrationTestContext;

  beforeAll(async () => {
    context = await createIntegrationTestingModule();
  });

  beforeEach(async () => {
    await cleanupDatabase(context);
  });

  afterAll(async () => {
    await cleanupIntegrationTestingModule(context);
  });

  describe('POST /users', () => {
    it('should create a new user', async () => {
      const createUserDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      const response = await request(context.app.getHttpServer())
        .post('/users')
        .send(createUserDto);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.username).toBe(createUserDto.username);
      expect(response.body.email).toBe(createUserDto.email);
      expect(response.body).not.toHaveProperty('password');
    });

    it('should return 409 for duplicate email', async () => {
      const createUserDto = {
        username: 'testuser',
        email: 'duplicate@example.com',
        password: 'password123',
      };

      // Create first user
      await request(context.app.getHttpServer())
        .post('/users')
        .send(createUserDto);

      // Try to create another user with same email
      const response = await request(context.app.getHttpServer())
        .post('/users')
        .send({ ...createUserDto, username: 'differentuser' });

      expect(response.status).toBe(409);
    });
  });

  describe('GET /users', () => {
    it('should return all users', async () => {
      // Create exactly 2 users for this test
      await context.userFactory.createMany(2);

      const response = await request(context.app.getHttpServer()).get('/users');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('username');
      expect(response.body[0]).toHaveProperty('email');
      expect(response.body[0]).not.toHaveProperty('password');
    });
  });

  describe('GET /users/:id', () => {
    it('should return a user by id', async () => {
      const user = await context.userFactory.create();
      const response = await request(context.app.getHttpServer()).get(
        `/users/${user.id}`,
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', user.id);
      expect(response.body).toHaveProperty('username', user.username);
      expect(response.body).toHaveProperty('email', user.email);
      expect(response.body).not.toHaveProperty('password');
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(context.app.getHttpServer()).get(
        '/users/999',
      );

      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /users/:id', () => {
    it('should update a user', async () => {
      const user = await context.userFactory.create();
      const updateUserDto = {
        username: 'updateduser',
        email: 'updated@example.com',
      };

      const response = await request(context.app.getHttpServer())
        .patch(`/users/${user.id}`)
        .send(updateUserDto);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', user.id);
      expect(response.body).toHaveProperty('username', 'updateduser');
      expect(response.body).toHaveProperty('email', 'updated@example.com');
      expect(response.body).not.toHaveProperty('password');
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(context.app.getHttpServer())
        .patch('/users/999')
        .send({ username: 'updateduser' });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete a user', async () => {
      const user = await context.userFactory.create();
      const response = await request(context.app.getHttpServer()).delete(
        `/users/${user.id}`,
      );

      expect(response.status).toBe(204);

      const getResponse = await request(context.app.getHttpServer()).get(
        `/users/${user.id}`,
      );
      expect(getResponse.status).toBe(404);
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(context.app.getHttpServer()).delete(
        '/users/999',
      );

      expect(response.status).toBe(404);
    });
  });
});

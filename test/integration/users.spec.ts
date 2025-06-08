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

  afterEach(async () => {
    // Clean up after each test instead of before to prevent race conditions
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
        .send(createUserDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.username).toBe('testuser');
      expect(response.body.email).toBe('test@example.com');
      expect(response.body).not.toHaveProperty('password');
    });

    it('should return 409 for duplicate email', async () => {
      const uniqueId = Date.now();
      const createUserDto = {
        username: `testuser_${uniqueId}`,
        email: `duplicate_${uniqueId}@example.com`,
        password: 'password123',
      };

      // Create first user
      await request(context.app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(201);

      // Try to create second user with same email
      const duplicateDto = {
        username: `differentuser_${uniqueId}`,
        email: `duplicate_${uniqueId}@example.com`,
        password: 'password123',
      };

      await request(context.app.getHttpServer())
        .post('/users')
        .send(duplicateDto)
        .expect(409);
    });
  });

  describe('GET /users', () => {
    it('should return all users', async () => {
      // Use seeded users - no need to create new ones
      const response = await request(context.app.getHttpServer())
        .get('/users')
        .expect(200);

      expect(response.status).toBe(200);
      // Expect 3 seeded users
      expect(response.body).toHaveLength(3);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('username');
      expect(response.body[0]).toHaveProperty('email');
      expect(response.body[0]).not.toHaveProperty('password');
    });
  });

  describe('GET /users/:id', () => {
    it('should return a user by id', async () => {
      // Use seeded user instead of creating new one
      const user = context.data.getSeededUser();

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
      await request(context.app.getHttpServer()).get('/users/999').expect(404);
    });
  });

  describe('PATCH /users/:id', () => {
    it('should update a user', async () => {
      const user = context.data.getSeededUser();
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
      const updateUserDto = {
        username: 'updateduser',
        email: 'updated@example.com',
      };

      await request(context.app.getHttpServer())
        .patch('/users/999')
        .send(updateUserDto)
        .expect(404);
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete a user', async () => {
      const user = context.data.getSeededUser();

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
      await request(context.app.getHttpServer())
        .delete('/users/999')
        .expect(404);
    });
  });
});

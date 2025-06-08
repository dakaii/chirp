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
    // Clean up before each test to ensure clean state
    await cleanupDatabase(context);
  });

  afterEach(async () => {
    // Clean up after each test as well to prevent race conditions
    await cleanupDatabase(context);
  });

  afterAll(async () => {
    await cleanupIntegrationTestingModule(context);
  });

  describe('POST /users', () => {
    it('should create a new user', async () => {
      const workerId = process.env.JEST_WORKER_ID || '1';
      const testId = 'create_new_user';
      const uniqueSuffix = `${workerId}_${testId}_${Math.random().toString(36).substr(2, 6)}`;
      const createUserDto = {
        username: `completely_unique_user_${uniqueSuffix}`,
        email: `totally_unique_${uniqueSuffix}@different-domain.com`,
        password: 'password123',
      };

      const response = await request(context.app.getHttpServer())
        .post('/users')
        .send(createUserDto);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.username).toBe(
        `completely_unique_user_${uniqueSuffix}`,
      );
      expect(response.body.email).toBe(
        `totally_unique_${uniqueSuffix}@different-domain.com`,
      );
      expect(response.body).not.toHaveProperty('password');
    });

    it('should return 409 for duplicate email', async () => {
      const workerId = process.env.JEST_WORKER_ID || '1';
      const testId = 'duplicate_email';
      const uniqueSuffix = `${workerId}_${testId}_${Math.random().toString(36).substr(2, 6)}`;
      const createUserDto = {
        username: `firstuser_${uniqueSuffix}`,
        email: `duplicate_${uniqueSuffix}@unique.test`,
        password: 'password123',
      };

      // Create first user
      await request(context.app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(201);

      // Try to create second user with same email
      const duplicateDto = {
        username: `seconduser_${uniqueSuffix}`,
        email: `duplicate_${uniqueSuffix}@unique.test`,
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
      // Create users as needed instead of relying on seeded ones
      await context.data.userFactory.create({
        username: 'user1',
        email: 'user1@test.com',
      });
      await context.data.userFactory.create({
        username: 'user2',
        email: 'user2@test.com',
      });
      await context.data.userFactory.create({
        username: 'user3',
        email: 'user3@test.com',
      });

      const response = await request(context.app.getHttpServer())
        .get('/users')
        .expect(200);

      expect(response.status).toBe(200);
      // Expect 3 created users (not hardcoded seeded ones)
      expect(response.body).toHaveLength(3);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('username');
      expect(response.body[0]).toHaveProperty('email');
      expect(response.body[0]).not.toHaveProperty('password');
    });
  });

  describe('GET /users/:id', () => {
    it('should return a user by id', async () => {
      // Create user as needed instead of using seeded user
      const user = await context.data.userFactory.create();

      const response = await request(context.app.getHttpServer()).get(
        `/users/${user.id}`,
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', user.id);
      expect(response.body).toHaveProperty('username');
      expect(response.body).toHaveProperty('email');
      expect(response.body).not.toHaveProperty('password');
    });

    it('should return 404 for non-existent user', async () => {
      await request(context.app.getHttpServer()).get('/users/999').expect(404);
    });
  });

  describe('PATCH /users/:id', () => {
    it('should update a user', async () => {
      // Create user as needed
      const user = await context.data.userFactory.create();
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
      // Create user as needed
      const user = await context.data.userFactory.create();

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

import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import {
  TestContext,
  createTestingModule,
  cleanupTestingModule,
  withTestTransaction,
} from '../utils/test-module';

describe('UsersController', () => {
  let context: TestContext;

  beforeAll(async () => {
    context = await createTestingModule();
  });

  afterAll(async () => {
    await cleanupTestingModule(context);
  });

  it('should be defined', async () => {
    await withTestTransaction(context, async (testContext) => {
      expect(testContext.usersController).toBeDefined();
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      await withTestTransaction(context, async (testContext) => {
        const createUserDto = {
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
        };

        const result = await testContext.usersController.create(createUserDto);

        expect(result).toHaveProperty('id');
        expect(result.username).toBe('testuser');
        expect(result.email).toBe('test@example.com');
        expect(result).not.toHaveProperty('password');
      });
    });

    it('should throw conflict exception for duplicate email', async () => {
      await withTestTransaction(context, async (testContext) => {
        const createUserDto = {
          username: 'testuser',
          email: 'duplicate@example.com',
          password: 'password123',
        };

        // Create first user
        await testContext.usersController.create(createUserDto);

        // Try to create second user with same email
        const duplicateDto = {
          username: 'differentuser',
          email: 'duplicate@example.com',
          password: 'password123',
        };

        await expect(
          testContext.usersController.create(duplicateDto),
        ).rejects.toThrow();
      });
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      await withTestTransaction(context, async (testContext) => {
        // Create test users
        await testContext.userFactory.createMany(3);

        const result = await testContext.usersController.findAll();

        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(3);
        expect(result[0]).toHaveProperty('id');
        expect(result[0]).toHaveProperty('username');
        expect(result[0]).toHaveProperty('email');
        expect(result[0]).not.toHaveProperty('password');
      });
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      await withTestTransaction(context, async (testContext) => {
        const user = await testContext.userFactory.create();

        const result = await testContext.usersController.findOne(user.id);

        expect(result).toHaveProperty('id', user.id);
        expect(result).toHaveProperty('username', user.username);
        expect(result).toHaveProperty('email', user.email);
        expect(result).not.toHaveProperty('password');
      });
    });

    it('should return null for non-existent user', async () => {
      await withTestTransaction(context, async (testContext) => {
        const result = await testContext.usersController.findOne(999);
        expect(result).toBeNull();
      });
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      await withTestTransaction(context, async (testContext) => {
        const user = await testContext.userFactory.create();
        const updateUserDto = {
          username: 'updateduser',
          email: 'updated@example.com',
        };

        const result = await testContext.usersController.update(
          user.id,
          updateUserDto,
        );

        expect(result).toHaveProperty('id', user.id);
        expect(result).toHaveProperty('username', 'updateduser');
        expect(result).toHaveProperty('email', 'updated@example.com');
        expect(result).not.toHaveProperty('password');
      });
    });

    it('should return null for non-existent user', async () => {
      await withTestTransaction(context, async (testContext) => {
        const updateUserDto = {
          username: 'updateduser',
          email: 'updated@example.com',
        };

        const result = await testContext.usersController.update(
          999,
          updateUserDto,
        );
        expect(result).toBeNull();
      });
    });
  });

  describe('remove', () => {
    it('should delete a user', async () => {
      await withTestTransaction(context, async (testContext) => {
        const user = await testContext.userFactory.create();

        const result = await testContext.usersController.remove(user.id);
        expect(result).toBe(true);

        const deletedUser = await testContext.usersController.findOne(user.id);
        expect(deletedUser).toBeNull();
      });
    });

    it('should return false for non-existent user', async () => {
      await withTestTransaction(context, async (testContext) => {
        const result = await testContext.usersController.remove(999);
        expect(result).toBe(false);
      });
    });
  });
});

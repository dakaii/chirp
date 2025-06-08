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
    await withTestTransaction(context, async () => {
      expect(context.usersController).toBeDefined();
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      await withTestTransaction(context, async () => {
        const uniqueId = Date.now() + Math.random();
        const createUserDto = {
          username: `testuser_${uniqueId}`,
          email: `test_${uniqueId}@example.com`,
          password: 'password123',
        };

        const result = await context.usersController.create(createUserDto);

        expect(result).toHaveProperty('id');
        expect(result.username).toBe(`testuser_${uniqueId}`);
        expect(result.email).toBe(`test_${uniqueId}@example.com`);
        expect(result).not.toHaveProperty('password');
      });
    });

    it('should throw conflict exception for duplicate email', async () => {
      await withTestTransaction(context, async () => {
        const uniqueId = Date.now() + Math.random();
        const createUserDto = {
          username: `testuser_${uniqueId}`,
          email: `duplicate_${uniqueId}@example.com`,
          password: 'password123',
        };

        // Create first user
        await context.usersController.create(createUserDto);

        // Try to create second user with same email
        const duplicateDto = {
          username: `differentuser_${uniqueId}`,
          email: `duplicate_${uniqueId}@example.com`,
          password: 'password123',
        };

        await expect(
          context.usersController.create(duplicateDto),
        ).rejects.toThrow(HttpException);
      });
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      await withTestTransaction(context, async () => {
        // Create test users
        const createdUsers = await context.userFactory.createMany(3);

        const result = await context.usersController.findAll();

        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThanOrEqual(3);
        expect(result[0]).toHaveProperty('id');
        expect(result[0]).toHaveProperty('username');
        expect(result[0]).toHaveProperty('email');
        expect(result[0]).not.toHaveProperty('password');

        // Verify our created users are in the result
        const createdUserIds = createdUsers.map((u) => u.id);
        const resultIds = result.map((u) => u.id);
        createdUserIds.forEach((id) => {
          expect(resultIds).toContain(id);
        });
      });
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      await withTestTransaction(context, async () => {
        const user = await context.userFactory.create();

        const result = await context.usersController.findOne(
          user.id.toString(),
        );

        expect(result).toHaveProperty('id', user.id);
        expect(result).toHaveProperty('username', user.username);
        expect(result).toHaveProperty('email', user.email);
        expect(result).not.toHaveProperty('password');
      });
    });

    it('should throw NotFoundException for non-existent user', async () => {
      await withTestTransaction(context, async () => {
        await expect(context.usersController.findOne('999')).rejects.toThrow(
          NotFoundException,
        );
      });
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      await withTestTransaction(context, async () => {
        const user = await context.userFactory.create();
        const updateUserDto = {
          username: 'updateduser',
          email: 'updated@example.com',
        };

        const result = await context.usersController.update(
          user.id.toString(),
          updateUserDto,
        );

        expect(result).toHaveProperty('id', user.id);
        expect(result).toHaveProperty('username', 'updateduser');
        expect(result).toHaveProperty('email', 'updated@example.com');
        expect(result).not.toHaveProperty('password');
      });
    });

    it('should throw NotFoundException for non-existent user', async () => {
      await withTestTransaction(context, async () => {
        const updateUserDto = {
          username: 'updateduser',
          email: 'updated@example.com',
        };

        await expect(
          context.usersController.update('999', updateUserDto),
        ).rejects.toThrow(NotFoundException);
      });
    });
  });

  describe('remove', () => {
    it('should delete a user', async () => {
      await withTestTransaction(context, async () => {
        const user = await context.userFactory.create();

        const result = await context.usersController.remove(user.id.toString());
        expect(result).toEqual({ message: 'User deleted successfully' });

        await expect(
          context.usersController.findOne(user.id.toString()),
        ).rejects.toThrow(NotFoundException);
      });
    });

    it('should throw NotFoundException for non-existent user', async () => {
      await withTestTransaction(context, async () => {
        await expect(context.usersController.remove('999')).rejects.toThrow(
          NotFoundException,
        );
      });
    });
  });
});

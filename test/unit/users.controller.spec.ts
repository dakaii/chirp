import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import {
  TestContext,
  createTestingModule,
  cleanupTestingModule,
  cleanupDatabase,
} from '../utils/test-module';

describe('UsersController (Integration)', () => {
  let context: TestContext;

  beforeEach(async () => {
    context = await createTestingModule();
    await cleanupDatabase(context);
  });

  afterEach(async () => {
    await cleanupDatabase(context);
    await cleanupTestingModule(context);
  });

  it('should be defined', () => {
    expect(context.usersController).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      const result = await context.usersController.create(createUserDto);
      expect(result).toBeDefined();
      expect(result.username).toBe(createUserDto.username);
      expect(result.email).toBe(createUserDto.email);
      expect((result as any).password).toBeUndefined();
    });

    it('should throw conflict exception for duplicate email', async () => {
      const createUserDto = {
        username: 'testuser',
        email: 'duplicate.test@example.com',
        password: 'password123',
      };

      // First creation should succeed
      await context.usersController.create(createUserDto);

      // Second creation with same email should fail
      await expect(
        context.usersController.create({
          ...createUserDto,
          username: 'differentuser', // Different username but same email
        }),
      ).rejects.toThrow(
        new HttpException(
          'Username or email already exists',
          HttpStatus.CONFLICT,
        ),
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      // Create exactly 3 users
      const users = await context.userFactory.createMany(3);

      const result = await context.usersController.findAll();

      expect(result).toHaveLength(users.length);
      expect((result[0] as any).password).toBeUndefined();
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const user = await context.userFactory.create();
      const result = await context.usersController.findOne(user.id.toString());

      expect(result).toBeDefined();
      expect(result.id).toBe(user.id);
      expect((result as any).password).toBeUndefined();
    });

    it('should throw not found exception for non-existent user', async () => {
      await expect(context.usersController.findOne('999')).rejects.toThrow(
        new NotFoundException('User with ID 999 not found'),
      );
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const user = await context.userFactory.create();
      const updateUserDto = { username: 'updateduser' };

      const result = await context.usersController.update(
        user.id.toString(),
        updateUserDto,
      );

      expect(result).toBeDefined();
      expect(result.username).toBe(updateUserDto.username);
      expect((result as any).password).toBeUndefined();
    });

    it('should throw not found exception for non-existent user', async () => {
      await expect(
        context.usersController.update('999', { username: 'updateduser' }),
      ).rejects.toThrow(new NotFoundException('User with ID 999 not found'));
    });
  });

  describe('remove', () => {
    it('should delete a user', async () => {
      const user = await context.userFactory.create();
      const result = await context.usersController.remove(user.id.toString());

      expect(result).toEqual({ message: 'User deleted successfully' });
    });

    it('should throw not found exception for non-existent user', async () => {
      await expect(context.usersController.remove('999')).rejects.toThrow(
        new NotFoundException('User with ID 999 not found'),
      );
    });
  });
});

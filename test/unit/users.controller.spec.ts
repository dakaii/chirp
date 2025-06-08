import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../../src/controllers/users.controller';
import { UsersService } from '../../src/services/users.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from '../../src/entities/user.entity';
import { UserFactory } from '../factories/user.factory';
import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import mikroOrmConfig from '../../src/mikro-orm.config';
import { EntityManager } from '@mikro-orm/core';
import { SerializedUser } from '../../src/entities/user.entity';

describe('UsersController', () => {
  let controller: UsersController;
  let userFactory: UserFactory;
  let em: EntityManager;

  beforeEach(async () => {
    process.env.NODE_ENV = 'test';
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MikroOrmModule.forRoot(mikroOrmConfig),
        MikroOrmModule.forFeature([User]),
      ],
      controllers: [UsersController],
      providers: [UsersService, UserFactory],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    userFactory = module.get<UserFactory>(UserFactory);
    em = module.get<EntityManager>(EntityManager);

    // Clear all data before each test
    await em.nativeDelete(User, {});
    await em.flush();
    await em.clear();
  });

  afterEach(async () => {
    // Clear all data after each test
    await em.nativeDelete(User, {});
    await em.flush();
    await em.clear();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      const result = await controller.create(createUserDto);
      expect(result).toBeDefined();
      expect(result.username).toBe(createUserDto.username);
      expect(result.email).toBe(createUserDto.email);
      expect((result as any).password).toBeUndefined();
    });

    it('should throw conflict exception for duplicate email', async () => {
      const createUserDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      await controller.create(createUserDto);

      await expect(controller.create(createUserDto)).rejects.toThrow(
        new HttpException(
          'Username or email already exists',
          HttpStatus.CONFLICT,
        ),
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users = await userFactory.createMany(3);
      const result = await controller.findAll();

      expect(result).toHaveLength(users.length);
      expect((result[0] as any).password).toBeUndefined();
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const user = await userFactory.create();
      const result = await controller.findOne(user.id.toString());

      expect(result).toBeDefined();
      expect(result.id).toBe(user.id);
      expect((result as any).password).toBeUndefined();
    });

    it('should throw not found exception for non-existent user', async () => {
      await expect(controller.findOne('999')).rejects.toThrow(
        new NotFoundException('User with ID 999 not found'),
      );
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const user = await userFactory.create();
      const updateUserDto = { username: 'updateduser' };

      const result = await controller.update(user.id.toString(), updateUserDto);

      expect(result).toBeDefined();
      expect(result.username).toBe(updateUserDto.username);
      expect((result as any).password).toBeUndefined();
    });

    it('should throw not found exception for non-existent user', async () => {
      await expect(
        controller.update('999', { username: 'updateduser' }),
      ).rejects.toThrow(new NotFoundException('User with ID 999 not found'));
    });
  });

  describe('remove', () => {
    it('should delete a user', async () => {
      const user = await userFactory.create();
      const result = await controller.remove(user.id.toString());

      expect(result).toEqual({ message: 'User deleted successfully' });
    });

    it('should throw not found exception for non-existent user', async () => {
      await expect(controller.remove('999')).rejects.toThrow(
        new NotFoundException('User with ID 999 not found'),
      );
    });
  });
});

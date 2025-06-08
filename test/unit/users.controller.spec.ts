import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../../src/controllers/users.controller';
import { UsersService } from '../../src/services/users.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from '../../src/entities/user.entity';
import { UserFactory } from '../factories/user.factory';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let userFactory: UserFactory;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        MikroOrmModule.forRoot({
          type: 'postgresql',
          dbName: process.env.DB_NAME || 'chirp_test_db',
          host: process.env.DB_HOST || 'localhost',
          port: +(process.env.DB_PORT || 5432),
          user: process.env.DB_USER || 'postgres',
          password: process.env.DB_PASSWORD || 'postgres',
          entities: [User],
        }),
        MikroOrmModule.forFeature([User]),
      ],
      controllers: [UsersController],
      providers: [UsersService],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    const em = module.get('EntityManager');
    userFactory = new UserFactory(em);
  });

  afterEach(async () => {
    await module.close();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      const user = await controller.create(createUserDto);
      expect(user).toBeDefined();
      expect(user.username).toBe(createUserDto.username);
      expect(user.email).toBe(createUserDto.email);
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
      await userFactory.createMany(3);
      const result = await controller.findAll();
      expect(result).toHaveLength(3);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const user = await userFactory.create();
      const result = await controller.findOne(String(user.id));
      expect(result.id).toBe(user.id);
    });

    it('should throw not found exception for non-existent user', async () => {
      await expect(controller.findOne('999')).rejects.toThrow(
        new HttpException('User not found', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const user = await userFactory.create();
      const updateUserDto = { username: 'updated' };
      const result = await controller.update(String(user.id), updateUserDto);
      expect(result.username).toBe('updated');
    });

    it('should throw not found exception for non-existent user', async () => {
      await expect(
        controller.update('999', { username: 'updated' }),
      ).rejects.toThrow(
        new HttpException('User not found', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('remove', () => {
    it('should delete a user', async () => {
      const user = await userFactory.create();
      const result = await controller.remove(String(user.id));
      expect(result.message).toBe('User deleted successfully');
    });

    it('should throw not found exception for non-existent user', async () => {
      await expect(controller.remove('999')).rejects.toThrow(
        new HttpException('User not found', HttpStatus.NOT_FOUND),
      );
    });
  });
});

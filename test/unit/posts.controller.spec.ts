import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from '../../src/controllers/posts.controller';
import { PostsService } from '../../src/services/posts.service';
import { UsersService } from '../../src/services/users.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Post } from '../../src/entities/post.entity';
import { User } from '../../src/entities/user.entity';
import { PostFactory } from '../factories/post.factory';
import { UserFactory } from '../factories/user.factory';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('PostsController', () => {
  let controller: PostsController;
  let postFactory: PostFactory;
  let userFactory: UserFactory;
  let module: TestingModule;
  let testUser: User;

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
          entities: [Post, User],
        }),
        MikroOrmModule.forFeature([Post, User]),
      ],
      controllers: [PostsController],
      providers: [PostsService, UsersService],
    }).compile();

    controller = module.get<PostsController>(PostsController);
    const em = module.get('EntityManager');
    postFactory = new PostFactory(em);
    userFactory = new UserFactory(em);

    testUser = await userFactory.create();
  });

  afterEach(async () => {
    await module.close();
  });

  describe('create', () => {
    it('should create a new post', async () => {
      const createPostDto = {
        title: 'Test Post',
        content: 'Test Content',
        userId: testUser.id,
      };

      const post = await controller.create(createPostDto);
      expect(post).toBeDefined();
      expect(post.title).toBe(createPostDto.title);
      expect(post.content).toBe(createPostDto.content);
      expect(post.user.id).toBe(testUser.id);
    });

    it('should throw not found exception for non-existent user', async () => {
      const createPostDto = {
        title: 'Test Post',
        content: 'Test Content',
        userId: 999,
      };

      await expect(controller.create(createPostDto)).rejects.toThrow(
        new HttpException('User not found', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of posts', async () => {
      await postFactory.createMany(testUser, 3);
      const result = await controller.findAll();
      expect(result).toHaveLength(3);
    });
  });

  describe('findOne', () => {
    it('should return a post by id', async () => {
      const post = await postFactory.create(testUser);
      const result = await controller.findOne(String(post.id));
      expect(result.id).toBe(post.id);
    });

    it('should throw not found exception for non-existent post', async () => {
      await expect(controller.findOne('999')).rejects.toThrow(
        new HttpException('Post not found', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('findByUser', () => {
    it('should return posts for a specific user', async () => {
      await postFactory.createMany(testUser, 3);
      const result = await controller.findByUser(String(testUser.id));
      expect(result).toHaveLength(3);
      result.forEach((post) => {
        expect(post.user.id).toBe(testUser.id);
      });
    });

    it('should throw not found exception for non-existent user', async () => {
      await expect(controller.findByUser('999')).rejects.toThrow(
        new HttpException('User not found', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('update', () => {
    it('should update a post', async () => {
      const post = await postFactory.create(testUser);
      const updatePostDto = { title: 'Updated Title' };
      const result = await controller.update(String(post.id), updatePostDto);
      expect(result.title).toBe('Updated Title');
    });

    it('should throw not found exception for non-existent post', async () => {
      await expect(
        controller.update('999', { title: 'Updated Title' }),
      ).rejects.toThrow(
        new HttpException('Post not found', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('remove', () => {
    it('should delete a post', async () => {
      const post = await postFactory.create(testUser);
      const result = await controller.remove(String(post.id));
      expect(result.message).toBe('Post deleted successfully');
    });

    it('should throw not found exception for non-existent post', async () => {
      await expect(controller.remove('999')).rejects.toThrow(
        new HttpException('Post not found', HttpStatus.NOT_FOUND),
      );
    });
  });
});

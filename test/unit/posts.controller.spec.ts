import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from '../../src/controllers/posts.controller';
import { PostsService } from '../../src/services/posts.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Post } from '../../src/entities/post.entity';
import { User } from '../../src/entities/user.entity';
import { PostFactory } from '../factories/post.factory';
import { UserFactory } from '../factories/user.factory';
import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import mikroOrmConfig from '../../src/mikro-orm.config';
import { EntityManager } from '@mikro-orm/core';
import { UsersService } from '../../src/services/users.service';

describe('PostsController', () => {
  let controller: PostsController;
  let postFactory: PostFactory;
  let userFactory: UserFactory;
  let em: EntityManager;
  let testUser: User;

  beforeEach(async () => {
    process.env.NODE_ENV = 'test';
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MikroOrmModule.forRoot(mikroOrmConfig),
        MikroOrmModule.forFeature([Post, User]),
      ],
      controllers: [PostsController],
      providers: [PostsService, PostFactory, UserFactory, UsersService],
    }).compile();

    controller = module.get<PostsController>(PostsController);
    postFactory = module.get<PostFactory>(PostFactory);
    userFactory = module.get<UserFactory>(UserFactory);
    em = module.get<EntityManager>(EntityManager);

    // Create a test user for each test
    testUser = await userFactory.create();
  });

  afterEach(async () => {
    await em.nativeDelete(Post, {});
    await em.nativeDelete(User, {});
    await em.flush();
    await em.clear();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new post', async () => {
      const createPostDto = {
        title: 'Test Post',
        content: 'Test Content',
        userId: testUser.id,
      };

      const result = await controller.create(createPostDto);
      expect(result).toBeDefined();
      expect(result.title).toBe(createPostDto.title);
      expect(result.content).toBe(createPostDto.content);
      expect(result.user.id).toBe(testUser.id);
    });

    it('should throw not found exception for non-existent user', async () => {
      const createPostDto = {
        title: 'Test Post',
        content: 'Test Content',
        userId: 999,
      };

      await expect(controller.create(createPostDto)).rejects.toThrow(
        new NotFoundException('User not found'),
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of posts', async () => {
      const posts = await postFactory.createMany(3, { user: testUser });
      const result = await controller.findAll();

      expect(result).toHaveLength(posts.length);
      expect(result[0].user.id).toBe(testUser.id);
    });
  });

  describe('findOne', () => {
    it('should return a post by id', async () => {
      const post = await postFactory.create({ user: testUser });
      const result = await controller.findOne(post.id.toString());

      expect(result).toBeDefined();
      expect(result.id).toBe(post.id);
      expect(result.user.id).toBe(testUser.id);
    });

    it('should throw not found exception for non-existent post', async () => {
      await expect(controller.findOne('999')).rejects.toThrow(
        new NotFoundException('Post with ID 999 not found'),
      );
    });
  });

  describe('update', () => {
    it('should update a post', async () => {
      const post = await postFactory.create({ user: testUser });
      const updatePostDto = { title: 'Updated Title' };

      const result = await controller.update(post.id.toString(), updatePostDto);

      expect(result).toBeDefined();
      expect(result.title).toBe(updatePostDto.title);
      expect(result.user.id).toBe(testUser.id);
    });

    it('should throw not found exception for non-existent post', async () => {
      await expect(
        controller.update('999', { title: 'Updated Title' }),
      ).rejects.toThrow(new NotFoundException('Post with ID 999 not found'));
    });
  });

  describe('remove', () => {
    it('should delete a post', async () => {
      const post = await postFactory.create({ user: testUser });
      const result = await controller.remove(post.id.toString());

      expect(result).toEqual({ message: 'Post deleted successfully' });
    });

    it('should throw not found exception for non-existent post', async () => {
      await expect(controller.remove('999')).rejects.toThrow(
        new NotFoundException('Post with ID 999 not found'),
      );
    });
  });
});

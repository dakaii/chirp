import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { User } from '../../src/entities/user.entity';
import {
  TestContext,
  createTestingModule,
  cleanupTestingModule,
} from '../utils/test-module';

describe('PostsController', () => {
  let context: TestContext;
  let testUser: User;

  beforeEach(async () => {
    context = await createTestingModule();
    testUser = await context.userFactory.create();
  });

  afterEach(async () => {
    await cleanupTestingModule(context);
  });

  it('should be defined', () => {
    expect(context.postsController).toBeDefined();
  });

  describe('create', () => {
    it('should create a new post', async () => {
      const createPostDto = {
        title: 'Test Post',
        content: 'Test Content',
        userId: testUser.id,
      };

      const result = await context.postsController.create(createPostDto);
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

      await expect(
        context.postsController.create(createPostDto),
      ).rejects.toThrow(new NotFoundException('User not found'));
    });
  });

  describe('findAll', () => {
    it('should return an array of posts', async () => {
      // Then create posts for that user
      const posts = await context.postFactory.createMany(3, { user: testUser });

      const result = await context.postsController.findAll();

      expect(result).toHaveLength(posts.length);
      expect(result[0].user.id).toBe(testUser.id);
    });
  });

  describe('findOne', () => {
    it('should return a post by id', async () => {
      const post = await context.postFactory.create({ user: testUser });
      const result = await context.postsController.findOne(post.id.toString());

      expect(result).toBeDefined();
      expect(result.id).toBe(post.id);
      expect(result.user.id).toBe(testUser.id);
    });

    it('should throw not found exception for non-existent post', async () => {
      await expect(context.postsController.findOne('999')).rejects.toThrow(
        new NotFoundException('Post with ID 999 not found'),
      );
    });
  });

  describe('update', () => {
    it('should update a post', async () => {
      const post = await context.postFactory.create({ user: testUser });
      const updatePostDto = { title: 'Updated Title' };

      const result = await context.postsController.update(
        post.id.toString(),
        updatePostDto,
      );

      expect(result).toBeDefined();
      expect(result.title).toBe(updatePostDto.title);
      expect(result.user.id).toBe(testUser.id);
    });

    it('should throw not found exception for non-existent post', async () => {
      await expect(
        context.postsController.update('999', { title: 'Updated Title' }),
      ).rejects.toThrow(new NotFoundException('Post with ID 999 not found'));
    });
  });

  describe('remove', () => {
    it('should delete a post', async () => {
      const post = await context.postFactory.create({ user: testUser });
      const result = await context.postsController.remove(post.id.toString());

      expect(result).toEqual({ message: 'Post deleted successfully' });
    });

    it('should throw not found exception for non-existent post', async () => {
      await expect(context.postsController.remove('999')).rejects.toThrow(
        new NotFoundException('Post with ID 999 not found'),
      );
    });
  });
});

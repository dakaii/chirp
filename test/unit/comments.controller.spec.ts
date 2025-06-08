import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { User } from '../../src/entities/user.entity';
import { Post } from '../../src/entities/post.entity';
import {
  TestContext,
  createTestingModule,
  cleanupTestingModule,
  cleanupDatabase,
} from '../utils/test-module';

describe('CommentsController', () => {
  let context: TestContext;
  let testUser: User;
  let testPost: Post;

  beforeEach(async () => {
    context = await createTestingModule();
    await cleanupDatabase(context);
    testUser = await context.userFactory.create();
    testPost = await context.postFactory.create({ user: testUser });
  });

  afterEach(async () => {
    await cleanupDatabase(context);
    await cleanupTestingModule(context);
  });

  it('should be defined', () => {
    expect(context.commentsController).toBeDefined();
  });

  describe('create', () => {
    it('should create a new comment', async () => {
      const createCommentDto = {
        content: 'Test Comment',
        postId: testPost.id,
        userId: testUser.id,
      };

      const result = await context.commentsController.create(createCommentDto);
      expect(result).toBeDefined();
      expect(result.content).toBe(createCommentDto.content);
      expect(result.post.id).toBe(testPost.id);
      expect(result.user.id).toBe(testUser.id);
    });

    it('should throw not found exception for non-existent user', async () => {
      const createCommentDto = {
        content: 'Test Comment',
        postId: testPost.id,
        userId: 999,
      };

      await expect(
        context.commentsController.create(createCommentDto),
      ).rejects.toThrow(new NotFoundException('User with ID 999 not found'));
    });

    it('should throw not found exception for non-existent post', async () => {
      const createCommentDto = {
        content: 'Test Comment',
        postId: 999,
        userId: testUser.id,
      };

      await expect(
        context.commentsController.create(createCommentDto),
      ).rejects.toThrow(new NotFoundException('Post with ID 999 not found'));
    });
  });

  describe('findByPost', () => {
    it('should return an array of comments for a post', async () => {
      const comments = await context.commentFactory.createMany(3, {
        user: testUser,
        post: testPost,
      });

      const result = await context.commentsController.findByPost(
        testPost.id.toString(),
      );

      expect(result).toHaveLength(comments.length);
      expect(result[0].user.id).toBe(testUser.id);
      expect(result[0].post.id).toBe(testPost.id);
    });

    it('should return empty array for non-existent post', async () => {
      const result = await context.commentsController.findByPost('999');
      expect(result).toHaveLength(0);
    });
  });

  describe('findByUser', () => {
    it('should return an array of comments for a user', async () => {
      const comments = await context.commentFactory.createMany(3, {
        user: testUser,
        post: testPost,
      });

      const result = await context.commentsController.findByUser(
        testUser.id.toString(),
      );

      expect(result).toHaveLength(comments.length);
      expect(result[0].user.id).toBe(testUser.id);
      expect(result[0].post.id).toBe(testPost.id);
    });

    it('should return empty array for non-existent user', async () => {
      const result = await context.commentsController.findByUser('999');
      expect(result).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it('should return a comment by id', async () => {
      const comment = await context.commentFactory.create({
        user: testUser,
        post: testPost,
      });
      const result = await context.commentsController.findOne(
        comment.id.toString(),
      );

      expect(result).toBeDefined();
      expect(result.id).toBe(comment.id);
      expect(result.user.id).toBe(testUser.id);
      expect(result.post.id).toBe(testPost.id);
    });

    it('should throw not found exception for non-existent comment', async () => {
      await expect(context.commentsController.findOne('999')).rejects.toThrow(
        new NotFoundException('Comment with ID 999 not found'),
      );
    });
  });

  describe('update', () => {
    it('should update a comment', async () => {
      const comment = await context.commentFactory.create({
        user: testUser,
        post: testPost,
      });
      const updateCommentDto = { content: 'Updated Content' };

      const result = await context.commentsController.update(
        comment.id.toString(),
        updateCommentDto,
      );

      expect(result).toBeDefined();
      expect(result.content).toBe(updateCommentDto.content);
      expect(result.user.id).toBe(testUser.id);
      expect(result.post.id).toBe(testPost.id);
    });

    it('should throw not found exception for non-existent comment', async () => {
      await expect(
        context.commentsController.update('999', {
          content: 'Updated Content',
        }),
      ).rejects.toThrow(new NotFoundException('Comment with ID 999 not found'));
    });
  });

  describe('remove', () => {
    it('should delete a comment', async () => {
      const comment = await context.commentFactory.create({
        user: testUser,
        post: testPost,
      });
      const result = await context.commentsController.remove(
        comment.id.toString(),
      );

      expect(result).toEqual({ message: 'Comment deleted successfully' });
    });

    it('should throw not found exception for non-existent comment', async () => {
      await expect(context.commentsController.remove('999')).rejects.toThrow(
        new NotFoundException('Comment with ID 999 not found'),
      );
    });
  });
});

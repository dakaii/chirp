import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { MikroORM } from '@mikro-orm/core';
import { Comment } from '../../src/entities/comment.entity';
import { Post } from '../../src/entities/post.entity';
import { User } from '../../src/entities/user.entity';
import { CommentFactory } from '../factories/comment.factory';
import { PostFactory } from '../factories/post.factory';
import { UserFactory } from '../factories/user.factory';

describe('CommentsController (e2e)', () => {
  let app: INestApplication;
  let orm: MikroORM;
  let commentFactory: CommentFactory;
  let postFactory: PostFactory;
  let userFactory: UserFactory;
  let testUser: User;
  let testPost: Post;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    orm = app.get<MikroORM>(MikroORM);
    const em = orm.em.fork();
    commentFactory = new CommentFactory(em);
    postFactory = new PostFactory(em);
    userFactory = new UserFactory(em);

    // Drop and recreate database schema
    const generator = orm.getSchemaGenerator();
    await generator.refreshDatabase();
  });

  beforeEach(async () => {
    // Clear all data before each test
    const em = orm.em.fork();
    await em.nativeDelete(Comment, {});
    await em.nativeDelete(Post, {});
    await em.nativeDelete(User, {});

    // Create test user and post for each test
    testUser = await userFactory.create();
    testPost = await postFactory.create({ user: testUser });
  });

  afterAll(async () => {
    await orm.close();
    await app.close();
  });

  describe('POST /comments', () => {
    it('should create a new comment', () => {
      return request(app.getHttpServer())
        .post('/comments')
        .send({
          content: 'Test Comment',
          postId: testPost.id,
          userId: testUser.id,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.content).toBe('Test Comment');
          expect(res.body.user.id).toBe(testUser.id);
          expect(res.body.post.id).toBe(testPost.id);
        });
    });

    it('should return 400 for invalid data', () => {
      return request(app.getHttpServer())
        .post('/comments')
        .send({
          postId: testPost.id,
          userId: testUser.id,
          // missing content
        })
        .expect(400);
    });

    it('should return 404 for non-existent user', () => {
      return request(app.getHttpServer())
        .post('/comments')
        .send({
          content: 'Test Comment',
          postId: testPost.id,
          userId: 999,
        })
        .expect(404);
    });

    it('should return 404 for non-existent post', () => {
      return request(app.getHttpServer())
        .post('/comments')
        .send({
          content: 'Test Comment',
          postId: 999,
          userId: testUser.id,
        })
        .expect(404);
    });
  });

  describe('GET /comments/post/:postId', () => {
    it('should return comments for a specific post', async () => {
      await commentFactory.createMany(testUser, testPost, 3);

      return request(app.getHttpServer())
        .get(`/comments/post/${testPost.id}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body).toHaveLength(3);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('content');
          expect(res.body[0].user.id).toBe(testUser.id);
        });
    });

    it('should return 404 for non-existent post', () => {
      return request(app.getHttpServer()).get('/comments/post/999').expect(404);
    });
  });

  describe('GET /comments/user/:userId', () => {
    it('should return comments for a specific user', async () => {
      await commentFactory.createMany(testUser, testPost, 3);

      return request(app.getHttpServer())
        .get(`/comments/user/${testUser.id}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body).toHaveLength(3);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('content');
          expect(res.body[0].post.id).toBe(testPost.id);
        });
    });

    it('should return 404 for non-existent user', () => {
      return request(app.getHttpServer()).get('/comments/user/999').expect(404);
    });
  });

  describe('GET /comments/:id', () => {
    it('should return a comment by id', async () => {
      const comment = await commentFactory.create(testUser, testPost);

      return request(app.getHttpServer())
        .get(`/comments/${comment.id}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(comment.id);
          expect(res.body.content).toBe(comment.content);
          expect(res.body.user.id).toBe(testUser.id);
          expect(res.body.post.id).toBe(testPost.id);
        });
    });

    it('should return 404 for non-existent comment', () => {
      return request(app.getHttpServer()).get('/comments/999').expect(404);
    });
  });

  describe('PATCH /comments/:id', () => {
    it('should update a comment', async () => {
      const comment = await commentFactory.create(testUser, testPost);

      return request(app.getHttpServer())
        .patch(`/comments/${comment.id}`)
        .send({
          content: 'Updated Comment',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(comment.id);
          expect(res.body.content).toBe('Updated Comment');
        });
    });

    it('should return 404 for non-existent comment', () => {
      return request(app.getHttpServer())
        .patch('/comments/999')
        .send({
          content: 'Updated Comment',
        })
        .expect(404);
    });
  });

  describe('DELETE /comments/:id', () => {
    it('should delete a comment', async () => {
      const comment = await commentFactory.create(testUser, testPost);

      return request(app.getHttpServer())
        .delete(`/comments/${comment.id}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBe('Comment deleted successfully');
        });
    });

    it('should return 404 for non-existent comment', () => {
      return request(app.getHttpServer()).delete('/comments/999').expect(404);
    });
  });
});

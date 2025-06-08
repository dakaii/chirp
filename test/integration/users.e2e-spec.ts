import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { MikroORM } from '@mikro-orm/core';
import { User } from '../../src/entities/user.entity';
import { UserFactory } from '../factories/user.factory';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let orm: MikroORM;
  let userFactory: UserFactory;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    orm = app.get<MikroORM>(MikroORM);
    const em = orm.em.fork();
    userFactory = new UserFactory(em);

    // Drop and recreate database schema
    const generator = orm.getSchemaGenerator();
    await generator.refreshDatabase(); // This will drop all tables and recreate them
  });

  beforeEach(async () => {
    // Clear all data before each test
    const em = orm.em.fork();
    await em.nativeDelete(User, {});
  });

  afterAll(async () => {
    await orm.close();
    await app.close();
  });

  describe('POST /users', () => {
    it('should create a new user', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.username).toBe('testuser');
          expect(res.body.email).toBe('test@example.com');
          expect(res.body).not.toHaveProperty('password');
        });
    });

    it('should return 400 for invalid data', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({
          username: 'te', // too short
          email: 'invalid-email',
          password: '123', // too short
        })
        .expect(400);
    });
  });

  describe('GET /users', () => {
    it('should return an array of users', async () => {
      await userFactory.createMany(3);

      return request(app.getHttpServer())
        .get('/users')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body).toHaveLength(3);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('username');
          expect(res.body[0]).toHaveProperty('email');
          expect(res.body[0]).not.toHaveProperty('password');
        });
    });
  });

  describe('GET /users/:id', () => {
    it('should return a user by id', async () => {
      const user = await userFactory.create();

      return request(app.getHttpServer())
        .get(`/users/${user.id}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(user.id);
          expect(res.body.username).toBe(user.username);
          expect(res.body.email).toBe(user.email);
          expect(res.body).not.toHaveProperty('password');
        });
    });

    it('should return 404 for non-existent user', () => {
      return request(app.getHttpServer()).get('/users/999').expect(404);
    });
  });

  describe('PATCH /users/:id', () => {
    it('should update a user', async () => {
      const user = await userFactory.create();

      return request(app.getHttpServer())
        .patch(`/users/${user.id}`)
        .send({
          username: 'updated',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(user.id);
          expect(res.body.username).toBe('updated');
          expect(res.body.email).toBe(user.email);
          expect(res.body).not.toHaveProperty('password');
        });
    });

    it('should return 404 for non-existent user', () => {
      return request(app.getHttpServer())
        .patch('/users/999')
        .send({
          username: 'updated',
        })
        .expect(404);
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete a user', async () => {
      const user = await userFactory.create();

      return request(app.getHttpServer())
        .delete(`/users/${user.id}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBe('User deleted successfully');
        });
    });

    it('should return 404 for non-existent user', () => {
      return request(app.getHttpServer()).delete('/users/999').expect(404);
    });
  });
});

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# Chirp API

A Twitter-like API built with NestJS and MikroORM.

## Features

- User management (create, read, update, delete)
- Post management (create, read, update, delete)
- Comment management (create, read, update, delete)
- Integration tests for all features
- Database migrations

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

3. Start the development database:

```bash
docker-compose up -d
```

4. Run database migrations:

```bash
npm run migration:up
```

## Database Migrations

Migrations are used to manage database schema changes. All migrations are stored in the `./migrations` directory.

### Creating a Migration

To create a new migration:

```bash
npm run migration:create
```

This will prompt you for a migration name. Use descriptive names like "add-user-table" or "add-post-status-column".

The migration will be created in the `./migrations` directory. Review and adjust the generated migration file if needed.

### Running Migrations

To apply all pending migrations:

```bash
npm run migration:up
```

To revert the last migration:

```bash
npm run migration:down
```

### Testing with Migrations

The test environment uses the same migration files as production. This ensures that your test database schema matches your production schema exactly.

When running tests:

1. The test database is created with a clean schema
2. All migrations are run before the tests start
3. Each test suite starts with a fresh database state

## Development

Start the development server:

```bash
npm run start:dev
```

Run tests:

```bash
# Unit tests
npm run test

# Integration tests
npm run test:e2e
```

## API Documentation

### Users

- `POST /users` - Create a new user
- `GET /users` - List all users
- `GET /users/:id` - Get a specific user
- `PATCH /users/:id` - Update a user
- `DELETE /users/:id` - Delete a user

### Posts

- `POST /posts` - Create a new post
- `GET /posts` - List all posts
- `GET /posts/:id` - Get a specific post
- `GET /posts/user/:userId` - Get all posts by a user
- `PATCH /posts/:id` - Update a post
- `DELETE /posts/:id` - Delete a post

### Comments

- `POST /comments` - Create a new comment
- `GET /comments/post/:postId` - Get all comments on a post
- `GET /comments/user/:userId` - Get all comments by a user
- `GET /comments/:id` - Get a specific comment
- `PATCH /comments/:id` - Update a comment
- `DELETE /comments/:id` - Delete a comment

## Project Structure

```
src/
├── controllers/        # Route controllers
│   ├── app.controller.ts
│   ├── users.controller.ts
│   └── posts.controller.ts
├── services/          # Business logic
│   ├── app.service.ts
│   ├── users.service.ts
│   └── posts.service.ts
├── entities/          # Database entities
│   ├── user.entity.ts
│   ├── post.entity.ts
│   └── comment.entity.ts
├── dto/               # Data transfer objects
│   ├── create-user.dto.ts
│   ├── update-user.dto.ts
│   ├── create-post.dto.ts
│   └── update-post.dto.ts
├── modules/           # Feature modules
│   ├── users.module.ts
│   └── posts.module.ts
└── app.module.ts      # Root module
```

## Features

- User management (CRUD operations)
- Post management (CRUD operations)
- Relationships between users and posts
- Input validation using class-validator
- PostgreSQL database with MikroORM
- Docker support for development and testing

## Prerequisites

- Node.js (v18 or later)
- Docker and Docker Compose
- PostgreSQL (if running without Docker)

## Installation

```bash
npm install
```

## Running the app

```bash
# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod
```

## Test

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```

## Docker

```bash
# Start development environment
docker-compose up -d

# Start test environment
docker-compose -f docker-compose.test.yml up -d

# Stop and remove containers
docker-compose down -v
```

## API Endpoints

### Users

- `POST /users` - Create a new user
- `GET /users` - Get all users
- `GET /users/:id` - Get a user by ID
- `PATCH /users/:id` - Update a user
- `DELETE /users/:id` - Delete a user

### Posts

- `POST /posts` - Create a new post
- `GET /posts` - Get all posts
- `GET /posts/:id` - Get a post by ID
- `GET /posts/user/:userId` - Get all posts by a user
- `PATCH /posts/:id` - Update a post
- `DELETE /posts/:id` - Delete a post

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

This project is [MIT licensed](LICENSE).

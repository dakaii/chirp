<a name="readme-top"></a>
[![GitHub][github-shield]][github-url]
[![LinkedIn][linkedin-shield]][linkedin-url]
[![Medium][medium-shield]][medium-url]

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

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTACT -->

## Contact

Daiki Nakashita - [@LinkedIn](https://www.linkedin.com/in/daikinakashita/)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

[linkedin-shield]: https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white
[linkedin-url]: https://www.linkedin.com/in/daikinakashita/
[github-shield]: https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white
[github-url]: https://github.com/dakaii/
[medium-shield]: https://img.shields.io/badge/Medium-12100E?style=for-the-badge&logo=medium&logoColor=white
[medium-url]: https://dakaii.medium.com/

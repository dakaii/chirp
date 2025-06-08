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

## Challenges and Caveats

This project encountered several significant technical challenges during development. Here's a comprehensive overview of the difficulties faced and how they were resolved:

### 1. MikroORM Jest Integration Issues

**Challenge**: The `Map.prototype.set` error in Jest with MikroORM

- **Symptoms**: Tests failing with `TypeError: Map.prototype.set called on incompatible receiver`
- **Root Cause**: Incompatibility between Jest's `globalSetup`/`globalTeardown` and MikroORM's internal Map usage
- **Solution**: Removed `globalSetup` from Jest configuration and moved database setup to `setupFilesAfterEnv` using standard `beforeAll()` hooks
- **Result**: Sequential tests improved from 0/64 to 64/64 passing

### 2. Parallel Testing Architecture

**Challenge**: Implementing reliable parallel test execution

- **Symptoms**: Foreign key constraint violations and entity relationship conflicts
- **Root Cause**: Each Jest worker gets an isolated database, but factories used hardcoded IDs that don't exist across different worker databases
- **Approach**: Built comprehensive parallel testing infrastructure with:
  - Worker-aware database configuration
  - Isolated factory providers per worker
  - Clean architectural separation in `test/parallel/` directory
- **Current Status**:
  - ✅ Sequential tests: 64/64 passing
  - 🔶 Parallel tests: Partially working but still encountering foreign key issues

### 3. Database Test Isolation

**Challenge**: Ensuring clean database state between tests

- **Initial Approach**: Transaction-based isolation with rollbacks
- **Problems**: Complex nested transaction management and potential deadlocks
- **Final Solution**: Database cleanup using dynamic table discovery
  - Query PostgreSQL metadata to get all user tables automatically
  - Disable foreign key constraints during cleanup
  - Re-enable constraints after cleanup
- **Benefits**: Maintainable, reliable, and automatically adapts to schema changes

### 4. Entity Factory Complexity

**Challenge**: Managing test data creation across different test environments

- **Evolution**:
  1. Started with hardcoded seeding
  2. Moved to complex factory hierarchies
  3. Implemented Factory Provider pattern for clean separation
- **Final Architecture**:
  - Simple factories focused only on entity creation
  - Centralized logic in `factory-provider.ts` for environment-aware behavior
  - Tests use clean `context.factories.createUser()` API without knowing about parallel/sequential modes

### 5. MikroORM Global Context Issues

**Challenge**: `RequestContext` and global context conflicts in tests

- **Solution**: Set `allowGlobalContext: true` for test environments
- **Configuration**: Environment-aware context handling in MikroORM config

### 6. Test Performance and Reliability

**Challenge**: Balancing test speed with reliability

- **Considerations**:
  - Sequential tests: Slower but 100% reliable
  - Parallel tests: Faster but complex database isolation requirements
- **Approach**: Dual configuration supporting both modes:

  ```bash
  # Sequential (reliable)
  npm run test

  # Parallel (experimental)
  npm run test:parallel
  ```

### 7. Database Migration Management

**Challenge**: Ensuring consistent schema across environments

- **Solution**: Comprehensive migration strategy with:
  - Transactional migrations
  - All-or-nothing approach
  - Separate test database initialization
  - Environment-aware entity path resolution

### Key Lessons Learned

1. **Jest + ORM Integration**: Always use `setupFilesAfterEnv` instead of `globalSetup` for database ORMs
2. **Test Isolation**: Database cleanup is more reliable than transaction rollbacks for integration tests
3. **Parallel Testing**: Requires careful architecture and may not always be worth the complexity
4. **Factory Patterns**: Clean separation between data creation and environment logic reduces complexity
5. **Progressive Enhancement**: Build sequential tests first, then add parallel testing as an optional feature

### Architecture Decisions

- **Clean Separation**: All parallel-specific code isolated in `test/parallel/`
- **Backward Compatibility**: Main test suite remains simple and reliable
- **Environment Detection**: Smart configuration based on `NODE_ENV` and `JEST_WORKER_ID`
- **Documentation First**: Comprehensive documentation for complex testing infrastructure

## Contact

Daiki Nakashita - [@LinkedIn](https://www.linkedin.com/in/daikinakashita/)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

[linkedin-shield]: https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white
[linkedin-url]: https://www.linkedin.com/in/daikinakashita/
[github-shield]: https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white
[github-url]: https://github.com/dakaii/
[medium-shield]: https://img.shields.io/badge/Medium-12100E?style=for-the-badge&logo=medium&logoColor=white
[medium-url]: https://dakaii.medium.com/

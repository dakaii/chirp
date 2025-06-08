# Parallel Testing Guide

This guide explains how to implement and use parallel testing in the Chirp application. The current codebase has been prepared with a foundation that facilitates parallel testing implementation.

## Current Foundation

### 1. Worker-Aware Configuration

- **Test Config Utilities** (`test/utils/test-config.ts`)
  - Worker ID detection and management
  - Dynamic database naming per worker
  - Port allocation per worker
  - Environment variable management

### 2. Database Isolation Infrastructure

- **Enhanced Database Utils** (`test/utils/database.ts`)
  - Worker-aware cleanup logging
  - Better error handling for concurrent operations
  - Database connectivity checks per worker

### 3. Jest Configuration

- **Parallel-Ready Setup** (`jest.config.js`)
  - Configurable worker limits
  - Global setup/teardown hooks
  - Enhanced isolation settings

## Current Status: Sequential Testing ✅

The current setup runs tests sequentially (1 worker) with the foundation for parallel testing:

```bash
# Current default (sequential)
npm test

# Debug mode with enhanced logging
DEBUG_TEST_CONFIG=true npm test
```

## Future: Enabling Parallel Testing 🚧

To enable parallel testing in the future, you'll need to implement these components:

### 1. Multiple Database Instances

Create a Docker Compose configuration that spins up multiple PostgreSQL instances:

```yaml
# docker-compose.parallel-test.yml (future)
version: '3.8'
services:
  test-db-1:
    image: postgres:16
    environment:
      POSTGRES_DB: chirp_test_worker_1
    ports: ['5433:5432']

  test-db-2:
    image: postgres:16
    environment:
      POSTGRES_DB: chirp_test_worker_2
    ports: ['5434:5432']

  # Add more as needed...
```

### 2. Database Creation Script

Implement database creation in `global-setup.ts`:

```typescript
// Future implementation example
async function createWorkerDatabase(workerId: string) {
  const config = getTestWorkerConfig();

  // Connect to default postgres database
  const adminClient = new Client({
    host: 'localhost',
    port: config.dbPort,
    user: 'postgres',
    password: 'postgres',
    database: 'postgres',
  });

  await adminClient.connect();

  // Create worker-specific database
  await adminClient.query(`
    CREATE DATABASE ${config.dbName}
    WITH OWNER = postgres
    ENCODING = 'UTF8'
  `);

  await adminClient.end();
}
```

### 3. Migration Management

Run migrations for each worker database:

```typescript
// Future implementation
async function runMigrationsForWorker(workerId: string) {
  const orm = await MikroORM.init(mikroOrmConfig);
  const migrator = orm.getMigrator();

  await migrator.up();
  await orm.close();
}
```

### 4. Enable Parallel Mode

Update the test scripts in `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:parallel": "TEST_PARALLEL=true jest --maxWorkers=50%",
    "test:debug": "DEBUG_TEST_CONFIG=true DEBUG_TESTS=true jest"
  }
}
```

## Architecture Benefits

### Current Foundation Provides:

1. **Worker Isolation**: Each worker gets unique database names and ports
2. **Logging Context**: All logs include worker ID in parallel mode
3. **Configuration Management**: Centralized worker-aware configuration
4. **Error Handling**: Enhanced error reporting with worker context
5. **Future-Proof**: Easy to extend when parallel testing is needed

### Example Worker Allocation:

| Worker | Database              | DB Port | App Port |
| ------ | --------------------- | ------- | -------- |
| 1      | `chirp_test_worker_1` | 5433    | 3001     |
| 2      | `chirp_test_worker_2` | 5434    | 3002     |
| 3      | `chirp_test_worker_3` | 5435    | 3003     |

## Debugging Parallel Tests

### Environment Variables:

```bash
# Enable debug logging
DEBUG_TEST_CONFIG=true npm test

# Enable parallel mode (future)
TEST_PARALLEL=true npm test

# Custom worker count (future)
TEST_PARALLEL=true npm test -- --maxWorkers=4
```

### Common Issues & Solutions:

1. **Database Connection Conflicts**

   - Each worker uses unique database names
   - Port allocation prevents conflicts

2. **Resource Cleanup**

   - Global teardown ensures proper cleanup
   - Worker-specific logging helps debug issues

3. **Test Isolation**
   - Database cleanup between tests
   - Separate entity manager instances

## Migration Path

When you're ready to implement parallel testing:

1. **Phase 1**: Infrastructure Setup

   - Create multi-database Docker setup
   - Implement database creation logic
   - Test with 2 workers

2. **Phase 2**: Migration & Schema Management

   - Implement per-worker migrations
   - Handle schema synchronization
   - Test with full worker count

3. **Phase 3**: Optimization
   - Tune worker count based on hardware
   - Optimize database connection pools
   - Add performance monitoring

## Current Test Execution

```bash
# All tests run sequentially with enhanced foundation
make test
# or
npm test

# With debug information
DEBUG_TEST_CONFIG=true make test
```

The foundation is in place - parallel testing implementation is now a straightforward infrastructure task rather than a complex refactoring effort! 🚀

import { Client } from 'pg';

// Global flag to ensure setup runs only once per worker
let setupComplete = false;

async function setupWorkerDatabase() {
  // Skip if already set up for this worker
  if (setupComplete) {
    return;
  }
  // Get the worker ID (Jest provides this, defaults to '1' for single worker)
  const workerId = process.env.JEST_WORKER_ID || '1';
  const workerDbName = `chirp_test_worker_${workerId}`;

  // Update the environment to use worker-specific database
  process.env.TEST_DB_NAME = workerDbName;

  // Create the database if it doesn't exist
  const client = new Client({
    host: process.env.TEST_DB_HOST || 'test-db',
    port: parseInt(process.env.TEST_DB_PORT || '5432'),
    user: process.env.TEST_DB_USER || 'postgres',
    password: process.env.TEST_DB_PASSWORD || 'postgres',
    database: 'postgres', // Connect to default database to create worker database
  });

  try {
    await client.connect();

    // Check if the worker database exists
    const checkDbQuery = `
      SELECT 1 FROM pg_database WHERE datname = $1
    `;
    const result = await client.query(checkDbQuery, [workerDbName]);

    if (result.rows.length === 0) {
      // Database doesn't exist, create it
      console.log(`Creating database: ${workerDbName}`);
      await client.query(`CREATE DATABASE "${workerDbName}"`);
    }

    await client.end();
  } catch (error) {
    console.error(`Failed to setup worker database ${workerDbName}:`, error);
    await client.end();
    throw error;
  }

  // Now run migrations on the worker database
  try {
    const { MikroORM } = await import('@mikro-orm/core');
    const config = await import('./mikro-orm.config');

    // Initialize MikroORM for the worker database
    const orm = await MikroORM.init(config.default);

    // Run migrations
    const migrator = orm.getMigrator();
    await migrator.up();

    console.log(`Migrations completed for worker database: ${workerDbName}`);
    await orm.close();
  } catch (error) {
    console.error(
      `Failed to run migrations for worker database ${workerDbName}:`,
      error,
    );
    // Don't throw here, as the database was created successfully
  }

  // Mark setup as complete for this worker
  setupComplete = true;
}

// Run the setup
setupWorkerDatabase().catch(console.error);

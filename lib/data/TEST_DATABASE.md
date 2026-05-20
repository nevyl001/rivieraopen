# Test Database Infrastructure

This document describes the test database setup for integration testing.

## Overview

The test database infrastructure provides an isolated PostgreSQL database for running integration tests against the SQL repository implementations. It uses Docker to ensure consistency across development environments.

## Architecture

```
┌─────────────────────────────────────────┐
│         Integration Tests               │
│  (SQLPlayerRepository,                  │
│   SQLTournamentRepository)              │
└──────────────┬──────────────────────────┘
               │
               │ DATABASE_URL
               │
┌──────────────▼──────────────────────────┐
│    PostgreSQL Test Database             │
│    (Docker Container)                   │
│                                          │
│    Port: 5433                           │
│    Database: riviera_open_test          │
│    User: testuser                       │
└──────────────────────────────────────────┘
```

## Quick Start

### 1. Start Test Database

```bash
npm run test:db:setup
```

This command will:

- Start a PostgreSQL 16 container
- Create the `riviera_open_test` database
- Run schema migrations (`001_initial_schema.sql`)
- Seed test data (`002_seed_data.ts`)

### 2. Run Integration Tests

```bash
npm run test:integration
```

### 3. Stop Test Database

```bash
npm run test:db:stop
```

## Commands

### `npm run test:db:setup`

Starts the test database container and initializes it with schema and seed data.

**What it does:**

1. Checks if Docker is running
2. Starts PostgreSQL container using `docker-compose.test.yml`
3. Waits for database to be ready (health check)
4. Runs schema migration
5. Seeds test data

**Output:**

```
🚀 Setting up test database...
📦 Starting PostgreSQL test container...
⏳ Waiting for database to be ready...
✅ Database is ready!
🌱 Seeding test data...
✅ Test data seeded!
✅ Test database setup complete!
```

### `npm run test:db:stop`

Stops and removes the test database container.

**What it does:**

1. Stops the PostgreSQL container
2. Removes the container (data volume persists)

**Note:** To remove data volumes as well:

```bash
docker-compose -f docker-compose.test.yml down -v
```

### `npm run test:db:reset`

Resets the test database to a clean state.

**What it does:**

1. Stops and removes container with volumes
2. Starts fresh container
3. Runs schema migration
4. Seeds test data

**Use when:**

- Tests have modified data and you need a clean slate
- Schema has changed and needs to be reapplied
- Debugging test failures

### `npm run test:integration`

Runs integration tests against the test database.

**Environment:**

- Sets `DATABASE_URL` to test database connection string
- Runs tests matching `integration` in the path

## Configuration

### Docker Compose (`docker-compose.test.yml`)

```yaml
services:
  postgres-test:
    image: postgres:16-alpine
    container_name: riviera-open-test-db
    environment:
      POSTGRES_USER: testuser
      POSTGRES_PASSWORD: testpassword
      POSTGRES_DB: riviera_open_test
    ports:
      - "5433:5432"
    volumes:
      - postgres-test-data:/var/lib/postgresql/data
      - ./lib/data/migrations/001_initial_schema.sql:/docker-entrypoint-initdb.d/001_initial_schema.sql
```

**Key Points:**

- Uses PostgreSQL 16 Alpine (lightweight)
- Runs on port **5433** (not 5432) to avoid conflicts
- Auto-runs schema migration on first start
- Data persists in named volume

### Connection Details

| Property          | Value                                                                 |
| ----------------- | --------------------------------------------------------------------- |
| Host              | `localhost`                                                           |
| Port              | `5433`                                                                |
| Database          | `riviera_open_test`                                                   |
| User              | `testuser`                                                            |
| Password          | `testpassword`                                                        |
| Connection String | `postgresql://testuser:testpassword@localhost:5433/riviera_open_test` |

## Writing Integration Tests

### Test File Naming

Integration tests should be named with `.integration.test.ts` suffix:

```
lib/data/implementations/sql/__tests__/
├── sql-player-repository.integration.test.ts
└── sql-tournament-repository.integration.test.ts
```

### Example Integration Test

```typescript
import { DatabaseClient } from "@/lib/data/database/database-client";
import { SQLPlayerRepository } from "@/lib/data/implementations/sql/sql-player-repository";

describe("SQLPlayerRepository Integration Tests", () => {
  let dbClient: DatabaseClient;
  let repository: SQLPlayerRepository;

  beforeAll(async () => {
    // Connect to test database
    dbClient = DatabaseClient.getInstance();
    await dbClient.connect();
    repository = new SQLPlayerRepository(dbClient);
  });

  afterAll(async () => {
    // Clean up
    await dbClient.close();
    DatabaseClient.reset();
  });

  beforeEach(async () => {
    // Clean data before each test
    await dbClient.query("TRUNCATE TABLE players CASCADE");
  });

  it("should create and retrieve a player", async () => {
    const player = {
      id: "test-1",
      firstName: "John",
      lastName: "Doe",
      // ... other fields
    };

    await repository.create(player);
    const retrieved = await repository.getById("test-1");

    expect(retrieved).toEqual(player);
  });
});
```

### Best Practices

1. **Use `beforeAll` for setup**: Connect to database once per test suite
2. **Use `afterAll` for cleanup**: Close connections and reset singletons
3. **Use `beforeEach` for data cleanup**: Truncate tables before each test
4. **Test real database operations**: Don't mock the database client
5. **Test transactions**: Verify rollback behavior on errors
6. **Test data hydration**: Ensure nested objects are properly loaded

## Troubleshooting

### Database Won't Start

**Problem:** Container fails to start or health check fails

**Solutions:**

1. Check if Docker is running: `docker info`
2. Check if port 5433 is available: `lsof -i :5433`
3. View container logs: `docker-compose -f docker-compose.test.yml logs`
4. Remove old containers: `docker-compose -f docker-compose.test.yml down -v`

### Connection Refused

**Problem:** Tests can't connect to database

**Solutions:**

1. Verify container is running: `docker ps | grep riviera-open-test-db`
2. Check health status: `docker inspect riviera-open-test-db | grep Health`
3. Verify port mapping: `docker port riviera-open-test-db`
4. Check DATABASE_URL environment variable

### Schema Out of Sync

**Problem:** Tests fail due to missing tables or columns

**Solutions:**

1. Reset database: `npm run test:db:reset`
2. Verify migration file: `lib/data/migrations/001_initial_schema.sql`
3. Manually run migration:
   ```bash
   docker exec -i riviera-open-test-db psql -U testuser -d riviera_open_test < lib/data/migrations/001_initial_schema.sql
   ```

### Tests Interfering with Each Other

**Problem:** Tests pass individually but fail when run together

**Solutions:**

1. Add `beforeEach` cleanup:
   ```typescript
   beforeEach(async () => {
     await dbClient.query("TRUNCATE TABLE players CASCADE");
   });
   ```
2. Use transactions in tests:

   ```typescript
   beforeEach(async () => {
     await dbClient.query("BEGIN");
   });

   afterEach(async () => {
     await dbClient.query("ROLLBACK");
   });
   ```

### Docker Permission Issues

**Problem:** Permission denied when running Docker commands

**Solutions:**

1. Add user to docker group: `sudo usermod -aG docker $USER`
2. Restart terminal/shell
3. Or run with sudo: `sudo npm run test:db:setup`

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Integration Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: testuser
          POSTGRES_PASSWORD: testpassword
          POSTGRES_DB: riviera_open_test
        ports:
          - 5433:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"

      - name: Install dependencies
        run: npm ci

      - name: Run migrations
        run: |
          PGPASSWORD=testpassword psql -h localhost -p 5433 -U testuser -d riviera_open_test -f lib/data/migrations/001_initial_schema.sql

      - name: Run integration tests
        env:
          DATABASE_URL: postgresql://testuser:testpassword@localhost:5433/riviera_open_test
        run: npm run test:integration
```

## Maintenance

### Updating Schema

When schema changes:

1. Update `lib/data/migrations/001_initial_schema.sql`
2. Reset test database: `npm run test:db:reset`
3. Run integration tests: `npm run test:integration`

### Updating Seed Data

When seed data changes:

1. Update `lib/data/migrations/002_seed_data.ts`
2. Reset test database: `npm run test:db:reset`
3. Verify data:
   ```bash
   docker exec -it riviera-open-test-db psql -U testuser -d riviera_open_test
   ```

### Cleaning Up

To completely remove test database and volumes:

```bash
# Stop and remove everything
docker-compose -f docker-compose.test.yml down -v

# Remove dangling volumes
docker volume prune

# Remove test database image (optional)
docker rmi postgres:16-alpine
```

## Performance Tips

1. **Use transactions for cleanup**: Faster than TRUNCATE
2. **Seed minimal data**: Only what's needed for tests
3. **Run tests in parallel**: Use Jest's `--maxWorkers` flag
4. **Keep container running**: Don't stop/start between test runs
5. **Use connection pooling**: Reuse database connections

## Security Notes

⚠️ **Important**: This is a TEST database only!

- Never use these credentials in production
- Never expose port 5433 publicly
- Never commit sensitive data to seed scripts
- Always use different credentials for production

## Additional Resources

- [PostgreSQL Docker Hub](https://hub.docker.com/_/postgres)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Jest Integration Testing](https://jestjs.io/docs/testing-frameworks)
- [pg (node-postgres) Documentation](https://node-postgres.com/)

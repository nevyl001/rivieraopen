# Database Migrations

This directory contains database migration scripts for the Riviera Open application.

## Prerequisites

- PostgreSQL 16 or higher
- Node.js and npm installed
- `ts-node` installed globally or in project dependencies

## Environment Variables

Set the following environment variable before running migrations:

```bash
export DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
```

For production:

```bash
export DATABASE_URL="your-production-database-url"
```

## Running Migrations

### 1. Create Database Schema

Run the initial schema migration to create all tables, indexes, and triggers:

```bash
psql $DATABASE_URL -f lib/data/migrations/001_initial_schema.sql
```

Or if you have the database credentials separately:

```bash
psql -h localhost -U username -d database_name -f lib/data/migrations/001_initial_schema.sql
```

### 2. Seed Database with Mock Data

After creating the schema, seed the database with initial data:

```bash
npx ts-node lib/data/migrations/002_seed_data.ts
```

Or if you have ts-node installed globally:

```bash
ts-node lib/data/migrations/002_seed_data.ts
```

## Migration Files

### 001_initial_schema.sql

Creates the complete database schema including:

- **Players tables**: `players`, `player_contacts`, `player_socials`
- **Tournaments tables**: `tournaments`, `tournament_winners`, `tournament_photos`, `tournament_results`
- **Indexes**: Performance indexes on frequently queried columns
- **Triggers**: Automatic `updated_at` timestamp updates
- **Constraints**: Foreign keys, check constraints for data integrity

### 002_seed_data.ts

Seeds the database with initial data from mock files:

- Imports data from `lib/data/mock/players.ts` and `lib/data/mock/tournaments.ts`
- Uses transactions to ensure data integrity
- Idempotent (safe to run multiple times with `ON CONFLICT` clauses)
- Provides detailed console output during seeding

## Idempotence

Both migration scripts are idempotent, meaning they can be run multiple times safely:

- **001_initial_schema.sql**: Uses `CREATE TABLE IF NOT EXISTS` and `DROP TRIGGER IF EXISTS`
- **002_seed_data.ts**: Uses `ON CONFLICT` clauses to update existing records

## Testing Migrations

### Local Test Database

For testing, you can use Docker to run a PostgreSQL instance:

```bash
# Start test database
docker run --name riviera-test-db \
  -e POSTGRES_DB=riviera_test \
  -e POSTGRES_USER=test_user \
  -e POSTGRES_PASSWORD=test_password \
  -p 5433:5432 \
  -d postgres:16

# Set test database URL
export DATABASE_URL="postgresql://test_user:test_password@localhost:5433/riviera_test"

# Run migrations
psql $DATABASE_URL -f lib/data/migrations/001_initial_schema.sql
npx ts-node lib/data/migrations/002_seed_data.ts

# Stop and remove test database
docker stop riviera-test-db
docker rm riviera-test-db
```

### Verify Migration

After running migrations, verify the database structure:

```bash
# Connect to database
psql $DATABASE_URL

# List all tables
\dt

# Describe a table
\d players

# Count records
SELECT COUNT(*) FROM players;
SELECT COUNT(*) FROM tournaments;

# Exit
\q
```

## Rollback

To rollback migrations (drop all tables):

```bash
psql $DATABASE_URL -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
```

**Warning**: This will delete all data. Use with caution!

## Production Deployment

For production deployment:

1. **Backup existing database** (if applicable)
2. Set production `DATABASE_URL` environment variable
3. Run schema migration: `psql $DATABASE_URL -f lib/data/migrations/001_initial_schema.sql`
4. Optionally seed with initial data: `npx ts-node lib/data/migrations/002_seed_data.ts`
5. Verify data integrity
6. Update application environment to use `NEXT_PUBLIC_ENV=prod`

## Troubleshooting

### Connection Refused

```
Error: Connection refused
```

**Solution**: Ensure PostgreSQL is running and the connection string is correct.

### Permission Denied

```
Error: permission denied to create extension "pgcrypto"
```

**Solution**: Connect as a superuser or ensure the extension is already installed:

```bash
psql $DATABASE_URL -c "CREATE EXTENSION IF NOT EXISTS pgcrypto;"
```

### Seeding Fails

```
Error: relation "players" does not exist
```

**Solution**: Run the schema migration (001_initial_schema.sql) before seeding.

### Duplicate Key Errors

```
Error: duplicate key value violates unique constraint
```

**Solution**: This is expected if running seed script multiple times. The script uses `ON CONFLICT` to handle duplicates gracefully.

## Next Steps

After running migrations:

1. Verify data in database
2. Update application environment variables
3. Test SQL repository implementations
4. Run integration tests
5. Deploy to production

## Support

For issues or questions about migrations, refer to:

- Design document: `.kiro/specs/environment-data-layer/design.md`
- Requirements document: `.kiro/specs/environment-data-layer/requirements.md`
- Task list: `.kiro/specs/environment-data-layer/tasks.md`

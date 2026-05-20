# Local Testing Guide - Dev vs Prod Environments

This guide explains how to test both development (mock data) and production (SQL database) setups locally.

## Overview

The application supports two environments:

- **Dev**: Uses mock repositories with in-memory data (fast, no database needed)
- **Prod**: Uses SQL repositories with PostgreSQL database (realistic, requires database)

---

## Testing Dev Environment (Mock Data)

### Setup

1. **Set environment to dev** in `.env.local`:

   ```env
   NEXT_PUBLIC_ENV=dev
   ```

2. **Start the development server**:

   ```bash
   npm run dev
   ```

3. **Open the application**:
   ```
   http://localhost:3000
   ```

### What to Test

✅ **Rankings Page** (`/rankings`)

- Should load instantly (no database delay)
- Should display mock player data
- Should switch between categories (Open, 1, 2, 3, 4, 5, 6)
- Should show player cards with rankings

✅ **Players Page** (`/players/[id]`)

- Should display individual player profiles
- Should show tournament results
- Should display contact and social information

✅ **Tournaments Page** (`/tournaments`)

- Should display tournament listings
- Should filter by status and category

### Verification

Check that mock data is being used:

```bash
# In browser console, you should see no database connection attempts
# The page should load very quickly (< 100ms)
```

**Expected Behavior:**

- ⚡ Fast page loads (no database latency)
- 📊 Mock data displayed
- 🔄 No database connection errors
- ✅ All features working

---

## Testing Prod Environment (SQL Database)

### Setup

#### Step 1: Start the Database

```bash
# Start PostgreSQL database
npm run test:db:setup
```

This will:

- Start PostgreSQL on port 5433
- Create schema
- Seed test data

**Verify database is running:**

```bash
docker ps | grep riviera-open-test-db
```

You should see:

```
CONTAINER ID   IMAGE                  STATUS         PORTS
xxxxx          postgres:16-alpine     Up 2 minutes   0.0.0.0:5433->5432/tcp
```

#### Step 2: Configure Environment

Update `.env.local` to use prod mode:

```env
NEXT_PUBLIC_ENV=prod
DATABASE_URL=postgresql://testuser:testpassword@localhost:5433/riviera_open_test
```

#### Step 3: Start the Application

```bash
# Stop dev server if running (Ctrl+C)

# Start fresh
npm run dev
```

#### Step 4: Verify Database Connection

Check the terminal output. You should see:

```
✓ Ready in 2.1s
```

**No errors about database connection!**

### What to Test

✅ **Rankings Page** (`/rankings`)

- Should load with slight database delay
- Should display data from PostgreSQL
- Should switch between categories
- Data should match what's in the database

✅ **Data Persistence**

- Changes should persist across page reloads
- Data should be consistent

✅ **Database Operations**

- Create, read, update operations should work
- Transactions should work correctly
- Error handling should work

### Verification

**Check database connection:**

```bash
# Connect to database
docker exec -it riviera-open-test-db psql -U testuser -d riviera_open_test

# Query players
SELECT id, first_name, last_name, category, points, rank FROM players LIMIT 5;

# Exit
\q
```

**Expected Behavior:**

- 🗄️ Data loaded from PostgreSQL
- 💾 Data persists across reloads
- 🔄 Transactions work correctly
- ⚡ Slight latency (database queries)

---

## Side-by-Side Comparison

### Quick Switch Test

Test switching between environments:

#### 1. Test Dev Mode

```bash
# Set dev mode
echo "NEXT_PUBLIC_ENV=dev" > .env.local

# Restart server
npm run dev
```

Visit `http://localhost:3000/rankings` - should load instantly with mock data.

#### 2. Test Prod Mode

```bash
# Ensure database is running
npm run test:db:setup

# Set prod mode
cat > .env.local << EOF
NEXT_PUBLIC_ENV=prod
DATABASE_URL=postgresql://testuser:testpassword@localhost:5433/riviera_open_test
EOF

# Restart server
npm run dev
```

Visit `http://localhost:3000/rankings` - should load with database data.

### Performance Comparison

| Metric           | Dev (Mock) | Prod (SQL)            |
| ---------------- | ---------- | --------------------- |
| Initial Load     | ~50ms      | ~150-300ms            |
| Data Source      | In-memory  | PostgreSQL            |
| Startup Time     | Instant    | +2-3s (DB connection) |
| Data Persistence | No         | Yes                   |

---

## Testing Scenarios

### Scenario 1: Fresh Development

**Goal**: Fast iteration without database overhead

```bash
# Use dev mode
echo "NEXT_PUBLIC_ENV=dev" > .env.local
npm run dev
```

**Benefits:**

- No database setup needed
- Instant page loads
- Quick feedback loop
- Easy to modify mock data

### Scenario 2: Integration Testing

**Goal**: Test against real database

```bash
# Start database
npm run test:db:setup

# Use prod mode
cat > .env.local << EOF
NEXT_PUBLIC_ENV=prod
DATABASE_URL=postgresql://testuser:testpassword@localhost:5433/riviera_open_test
EOF

# Run integration tests
npm run test:integration

# Or test manually
npm run dev
```

**Benefits:**

- Tests real SQL queries
- Validates transactions
- Tests data hydration
- Catches SQL-specific bugs

### Scenario 3: Pre-Production Validation

**Goal**: Validate production setup before deployment

```bash
# Start database
npm run test:db:setup

# Use prod mode
cat > .env.local << EOF
NEXT_PUBLIC_ENV=prod
DATABASE_URL=postgresql://testuser:testpassword@localhost:5433/riviera_open_test
EOF

# Build production bundle
npm run build

# Start production server
npm start
```

**Benefits:**

- Tests production build
- Validates optimizations
- Tests SSR with database
- Catches build-time issues

---

## Troubleshooting

### Issue: "NEXT_PUBLIC_ENV must be set"

**Cause**: Missing or invalid environment variable

**Solution:**

```bash
# Check .env.local exists
cat .env.local

# Should contain:
NEXT_PUBLIC_ENV=dev
# or
NEXT_PUBLIC_ENV=prod
```

### Issue: "Cannot connect to database"

**Cause**: Database not running or wrong connection string

**Solution:**

```bash
# Check if database is running
docker ps | grep riviera-open-test-db

# If not running, start it
npm run test:db:setup

# Verify connection string in .env.local
cat .env.local | grep DATABASE_URL
```

### Issue: "Module not found: Can't resolve 'dns'"

**Cause**: Trying to import database code in client component

**Solution:**

- Use Server Components for data fetching
- Don't import `RepositoryFactory` in client components
- See `app/rankings/page.tsx` for correct pattern

### Issue: Mock data vs Database data mismatch

**Cause**: Different data in mock files vs database

**Solution:**

```bash
# Reset database to match mock data
npm run test:db:reset

# Or update mock data to match database
# Edit: lib/data/mock/players.ts
```

### Issue: Port 5433 already in use

**Cause**: Another process using port 5433

**Solution:**

```bash
# Find process using port
lsof -i :5433

# Kill the process or stop the container
docker stop riviera-open-test-db

# Start fresh
npm run test:db:setup
```

---

## Best Practices

### 1. Use Dev Mode for UI Development

```bash
# Fast feedback loop
NEXT_PUBLIC_ENV=dev npm run dev
```

**When:**

- Building UI components
- Styling and layout
- Client-side interactions
- Rapid prototyping

### 2. Use Prod Mode for Data Layer Testing

```bash
# Test real database operations
npm run test:db:setup
NEXT_PUBLIC_ENV=prod npm run dev
```

**When:**

- Testing SQL queries
- Validating transactions
- Testing data hydration
- Performance testing

### 3. Run Both Modes in CI/CD

```yaml
# GitHub Actions example
- name: Test Dev Mode
  run: |
    echo "NEXT_PUBLIC_ENV=dev" > .env.local
    npm run build
    npm test

- name: Test Prod Mode
  run: |
    npm run test:db:setup
    echo "NEXT_PUBLIC_ENV=prod" > .env.local
    echo "DATABASE_URL=postgresql://testuser:testpassword@localhost:5433/riviera_open_test" >> .env.local
    npm run build
    npm run test:integration
```

### 4. Keep Mock Data in Sync

When updating database schema:

1. Update `001_initial_schema.sql`
2. Update `002_seed_data.ts`
3. Update mock data files in `lib/data/mock/`
4. Reset test database: `npm run test:db:reset`

---

## Quick Reference

### Dev Mode Commands

```bash
# Setup
echo "NEXT_PUBLIC_ENV=dev" > .env.local

# Run
npm run dev

# Test
npm test

# Build
npm run build
```

### Prod Mode Commands

```bash
# Setup database
npm run test:db:setup

# Configure environment
cat > .env.local << EOF
NEXT_PUBLIC_ENV=prod
DATABASE_URL=postgresql://testuser:testpassword@localhost:5433/riviera_open_test
EOF

# Run
npm run dev

# Test
npm run test:integration

# Build
npm run build

# Cleanup
npm run test:db:stop
```

### Database Commands

```bash
# Start database
npm run test:db:setup

# Stop database
npm run test:db:stop

# Reset database
npm run test:db:reset

# Connect to database
docker exec -it riviera-open-test-db psql -U testuser -d riviera_open_test

# View logs
docker logs riviera-open-test-db

# Check status
docker ps | grep riviera-open-test-db
```

---

## Testing Checklist

### Before Committing Code

- [ ] Test in dev mode: `NEXT_PUBLIC_ENV=dev npm run dev`
- [ ] All unit tests pass: `npm test`
- [ ] Build succeeds: `npm run build`
- [ ] Test in prod mode: `npm run test:db:setup && NEXT_PUBLIC_ENV=prod npm run dev`
- [ ] Integration tests pass: `npm run test:integration`
- [ ] No console errors in browser
- [ ] Database cleanup: `npm run test:db:stop`

### Before Deploying

- [ ] Production build succeeds: `npm run build`
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] Seed data prepared (if needed)
- [ ] Connection pooling configured
- [ ] Error handling tested
- [ ] Performance acceptable

---

## Additional Resources

- [Migration Guide](lib/data/MIGRATION_GUIDE.md) - How to migrate components
- [Test Database Guide](lib/data/TEST_DATABASE.md) - Detailed database setup
- [Validation Results](.kiro/specs/environment-data-layer/VALIDATION_RESULTS.md) - Test results

## Need Help?

Common questions:

**Q: Which mode should I use for development?**
A: Use dev mode for UI work, prod mode when testing data layer.

**Q: Do I need Docker for dev mode?**
A: No, dev mode uses mock data and doesn't need a database.

**Q: Can I use a different database for prod mode?**
A: Yes, just update the `DATABASE_URL` in `.env.local`.

**Q: How do I know which mode I'm in?**
A: Check `.env.local` for `NEXT_PUBLIC_ENV` value.

**Q: Can I switch modes without restarting?**
A: No, you must restart the dev server after changing `.env.local`.

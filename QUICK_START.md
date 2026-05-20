# Quick Start - Testing Dev & Prod Locally

## TL;DR

```bash
# Test DEV mode (mock data, fast)
npm run env:switch dev
npm run dev
# Visit: http://localhost:3000/rankings
# Look for: 📊 Blue badge (bottom-right)

# Test PROD mode (SQL database, realistic)
npm run env:switch prod
npm run dev
# Visit: http://localhost:3000/rankings
# Look for: 🗄️ Green badge (bottom-right)

# Interactive demo
npm run env:demo
```

## 🎯 Visual Indicator

**Look at the bottom-right corner of any page:**

- **📊 Mock Data (dev)** - Blue badge = Using in-memory mock data
- **🗄️ Database (prod)** - Green badge = Using PostgreSQL database

This makes it instantly clear which data source you're using!

---

## 🚀 Quick Commands

### Switch Environments

| Command                   | What It Does                       |
| ------------------------- | ---------------------------------- |
| `npm run env:switch dev`  | Switch to dev mode (mock data)     |
| `npm run env:switch prod` | Switch to prod mode (SQL database) |
| `npm run env:demo`        | Interactive demo of both modes     |

### Database Management

| Command                 | What It Does                   |
| ----------------------- | ------------------------------ |
| `npm run test:db:setup` | Start PostgreSQL test database |
| `npm run test:db:stop`  | Stop test database             |
| `npm run test:db:reset` | Reset database to clean state  |

### Development

| Command                    | What It Does             |
| -------------------------- | ------------------------ |
| `npm run dev`              | Start development server |
| `npm run build`            | Build for production     |
| `npm test`                 | Run all tests            |
| `npm run test:integration` | Run integration tests    |

---

## 📊 Dev vs Prod Comparison

| Feature               | Dev Mode       | Prod Mode             |
| --------------------- | -------------- | --------------------- |
| **Data Source**       | In-memory mock | PostgreSQL            |
| **Startup Time**      | Instant        | +2-3s (DB connection) |
| **Page Load**         | ~50ms          | ~150-300ms            |
| **Database Required** | ❌ No          | ✅ Yes                |
| **Data Persists**     | ❌ No          | ✅ Yes                |
| **Best For**          | UI development | Integration testing   |

---

## 🎯 Common Workflows

### Workflow 1: UI Development (Fast Iteration)

```bash
# 1. Switch to dev mode
npm run env:switch dev

# 2. Start dev server
npm run dev

# 3. Make changes and see instant updates
# No database needed!
```

**Use when:**

- Building UI components
- Styling and layout
- Client-side interactions
- Rapid prototyping

---

### Workflow 2: Database Testing

```bash
# 1. Switch to prod mode (starts database automatically)
npm run env:switch prod

# 2. Start dev server
npm run dev

# 3. Test against real PostgreSQL database
# Data persists across reloads!
```

**Use when:**

- Testing SQL queries
- Validating transactions
- Testing data persistence
- Integration testing

---

### Workflow 3: Pre-Production Validation

```bash
# 1. Switch to prod mode
npm run env:switch prod

# 2. Build production bundle
npm run build

# 3. Start production server
npm start

# 4. Test production build with database
```

**Use when:**

- Validating production setup
- Testing optimizations
- Pre-deployment checks

---

## 🔍 How to Verify Which Mode You're In

### Check Environment File

```bash
cat .env.local
```

**Dev mode:**

```env
NEXT_PUBLIC_ENV=dev
```

**Prod mode:**

```env
NEXT_PUBLIC_ENV=prod
DATABASE_URL=postgresql://testuser:testpassword@localhost:5433/riviera_open_test
```

### Check Database Status

```bash
docker ps | grep riviera-open-test-db
```

If you see output, database is running (prod mode).
If no output, database is not running (dev mode or database stopped).

---

## 🎬 Interactive Demo

Want to see both modes in action?

```bash
npm run env:demo
```

This will:

1. Show you dev mode configuration
2. Show you prod mode configuration
3. Compare both modes side-by-side
4. Let you choose which mode to keep

---

## 🐛 Troubleshooting

### "NEXT_PUBLIC_ENV must be set"

```bash
# Fix: Run the environment switcher
npm run env:switch dev
```

### "Cannot connect to database"

```bash
# Fix: Start the database
npm run test:db:setup
```

### "Port 3000 already in use"

```bash
# Fix: Stop the running server (Ctrl+C) and restart
npm run dev
```

### "Port 5433 already in use"

```bash
# Fix: Stop the database
npm run test:db:stop

# Then start fresh
npm run test:db:setup
```

---

## 📚 More Information

- **Detailed Testing Guide**: [LOCAL_TESTING_GUIDE.md](LOCAL_TESTING_GUIDE.md)
- **Test Database Setup**: [lib/data/TEST_DATABASE.md](lib/data/TEST_DATABASE.md)
- **Migration Guide**: [lib/data/MIGRATION_GUIDE.md](lib/data/MIGRATION_GUIDE.md)
- **Main README**: [README.md](README.md)

---

## 💡 Pro Tips

1. **Use dev mode by default** - It's faster for most development work
2. **Switch to prod mode** when testing data layer or before committing
3. **Keep database running** if you frequently switch to prod mode
4. **Reset database** if tests modify data: `npm run test:db:reset`
5. **Use the demo** to understand the differences: `npm run env:demo`

---

## ✅ Quick Checklist

Before committing code:

- [ ] Test in dev mode: `npm run env:switch dev && npm run dev`
- [ ] All tests pass: `npm test`
- [ ] Build succeeds: `npm run build`
- [ ] Test in prod mode: `npm run env:switch prod && npm run dev`
- [ ] Integration tests pass: `npm run test:integration`
- [ ] No console errors

---

**Need help?** See [LOCAL_TESTING_GUIDE.md](LOCAL_TESTING_GUIDE.md) for detailed instructions.

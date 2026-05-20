# How to Verify Which Data Source You're Seeing

This guide shows you multiple ways to verify whether you're seeing mock data or database data.

---

## 🎯 Quick Visual Check

### Method 1: Data Source Badge (Easiest!)

Look at the **bottom-right corner** of any page:

- **📊 Mock Data (dev)** = Blue badge = Using in-memory mock data
- **🗄️ Database (prod)** = Green badge = Using PostgreSQL database

This badge appears on all pages automatically!

---

## 🔍 Detailed Verification Methods

### Method 2: Check Environment File

```bash
cat .env.local
```

**Dev Mode (Mock Data):**

```env
NEXT_PUBLIC_ENV=dev
```

**Prod Mode (Database):**

```env
NEXT_PUBLIC_ENV=prod
DATABASE_URL=postgresql://testuser:testpassword@localhost:5433/riviera_open_test
```

---

### Method 3: Check Browser Console

Open browser DevTools (F12) and check the console:

**Dev Mode:**

- No database connection messages
- Fast page loads (~50ms)

**Prod Mode:**

- May see database-related logs
- Slightly slower page loads (~150-300ms)

---

### Method 4: Check Player IDs

**In Dev Mode (Mock Data):**

- Player IDs are simple: "1", "2", "3", etc.
- Check browser DevTools → Network tab → Response data

**In Prod Mode (Database):**

- Player IDs are UUIDs: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
- Check browser DevTools → Network tab → Response data

---

### Method 5: Check Database Directly

**Only works in Prod Mode:**

```bash
# Connect to database
docker exec -it riviera-open-test-db psql -U testuser -d riviera_open_test

# Query players
SELECT id, first_name, last_name, category FROM players LIMIT 5;

# Exit
\q
```

If you see data, you're in prod mode. If connection fails, you're in dev mode.

---

### Method 6: Check Server Logs

When starting the dev server:

**Dev Mode:**

```
✓ Ready in 1.2s
```

Fast startup, no database connection

**Prod Mode:**

```
✓ Ready in 3.5s
```

Slower startup due to database connection

---

### Method 7: Modify Data Test

**In Dev Mode:**

1. Refresh page and note player data
2. Restart server: `npm run dev`
3. Refresh page again
4. Data is **identical** (mock data doesn't change)

**In Prod Mode:**

1. Refresh page and note player data
2. Modify database:
   ```bash
   docker exec -it riviera-open-test-db psql -U testuser -d riviera_open_test -c "UPDATE players SET points = 9999 WHERE first_name = 'Marco';"
   ```
3. Refresh page
4. Data **changed** (database was updated)

---

## 🎨 Visual Differences

### Page Load Speed

| Mode            | Initial Load | Subsequent Loads |
| --------------- | ------------ | ---------------- |
| Dev (Mock)      | ~50ms        | ~30ms            |
| Prod (Database) | ~150-300ms   | ~100-200ms       |

### Data Characteristics

| Aspect           | Dev Mode      | Prod Mode |
| ---------------- | ------------- | --------- |
| Player IDs       | "1", "2", "3" | UUIDs     |
| Data Persistence | No            | Yes       |
| Startup Time     | Instant       | +2-3s     |
| Badge Color      | 🔵 Blue       | 🟢 Green  |

---

## 🧪 Quick Test Scenarios

### Scenario 1: Verify Dev Mode

```bash
# 1. Switch to dev
npm run env:switch dev

# 2. Start server
npm run dev

# 3. Open http://localhost:3000/rankings

# 4. Check bottom-right corner
# Should see: 📊 Mock Data (dev) in BLUE
```

### Scenario 2: Verify Prod Mode

```bash
# 1. Switch to prod
npm run env:switch prod

# 2. Start server
npm run dev

# 3. Open http://localhost:3000/rankings

# 4. Check bottom-right corner
# Should see: 🗄️ Database (prod) in GREEN
```

### Scenario 3: Compare Both

```bash
# 1. Test dev mode
npm run env:switch dev
npm run dev
# Visit http://localhost:3000/rankings
# Note: Blue badge, fast load

# 2. Stop server (Ctrl+C)

# 3. Test prod mode
npm run env:switch prod
npm run dev
# Visit http://localhost:3000/rankings
# Note: Green badge, slightly slower load
```

---

## 🐛 Troubleshooting

### Badge Not Showing?

**Check 1:** Verify environment variable is set

```bash
cat .env.local
```

**Check 2:** Hard refresh the page (Cmd+Shift+R or Ctrl+Shift+R)

**Check 3:** Check browser console for errors

### Wrong Badge Color?

**Issue:** Badge shows blue but you expect green (or vice versa)

**Solution:**

1. Check `.env.local` file
2. Restart dev server
3. Hard refresh browser

### Badge Shows But Data Seems Wrong?

**Check the actual data source:**

```bash
# Method 1: Check environment
cat .env.local

# Method 2: Check if database is running
docker ps | grep riviera-open-test-db

# Method 3: Query database
docker exec -it riviera-open-test-db psql -U testuser -d riviera_open_test -c "SELECT COUNT(*) FROM players;"
```

---

## 📊 Data Source Comparison Table

| Check Method          | Dev Mode          | Prod Mode         |
| --------------------- | ----------------- | ----------------- |
| **Badge**             | 📊 Blue           | 🗄️ Green          |
| **Badge Text**        | "Mock Data (dev)" | "Database (prod)" |
| **Player IDs**        | "1", "2", "3"     | UUIDs             |
| **Startup Time**      | ~1s               | ~3s               |
| **Page Load**         | ~50ms             | ~150-300ms        |
| **Data Persists**     | ❌ No             | ✅ Yes            |
| **Database Required** | ❌ No             | ✅ Yes            |
| **Docker Container**  | Not needed        | Must be running   |

---

## 💡 Pro Tips

1. **Always check the badge first** - It's the quickest way to verify

2. **Use browser DevTools** - Network tab shows actual API responses with IDs

3. **Test data persistence** - Restart server and check if changes persist

4. **Check startup time** - Prod mode takes 2-3s longer due to DB connection

5. **Look at the URL bar** - Both modes use same URLs, so badge is essential

6. **Use the demo** - Run `npm run env:demo` to see both modes side-by-side

---

## 🎯 Quick Reference

```bash
# Check current mode
cat .env.local

# Switch to dev mode
npm run env:switch dev

# Switch to prod mode
npm run env:switch prod

# Check database status
docker ps | grep riviera-open-test-db

# Query database
docker exec -it riviera-open-test-db psql -U testuser -d riviera_open_test -c "SELECT COUNT(*) FROM players;"
```

---

## ✅ Verification Checklist

Before reporting issues, verify:

- [ ] Badge is visible in bottom-right corner
- [ ] Badge color matches expected mode (blue=dev, green=prod)
- [ ] `.env.local` file has correct `NEXT_PUBLIC_ENV` value
- [ ] Dev server was restarted after changing environment
- [ ] Browser was hard-refreshed (Cmd+Shift+R)
- [ ] For prod mode: Database container is running
- [ ] For prod mode: Database has data (check with psql)

---

**Need more help?** See [LOCAL_TESTING_GUIDE.md](LOCAL_TESTING_GUIDE.md) for detailed testing instructions.

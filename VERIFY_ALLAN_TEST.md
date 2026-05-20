# Verify Data Source with Allan Castellanos Test

Allan Castellanos is a **database-only player** - he exists ONLY in the PostgreSQL database, NOT in the mock data. This makes him perfect for verifying which data source you're seeing!

---

## 🎯 The Test

### Expected Results:

| Mode     | Allan Visible? | Badge Color | Player Count                |
| -------- | -------------- | ----------- | --------------------------- |
| **Dev**  | ❌ NO          | 📊 Blue     | 15 players                  |
| **Prod** | ✅ YES         | 🗄️ Green    | 31 players (16 in database) |

---

## 🧪 Step-by-Step Verification

### Test 1: Dev Mode (Should NOT see Allan)

```bash
# 1. Switch to dev mode
npm run env:switch dev

# 2. Start server
npm run dev

# 3. Open http://localhost:3000/rankings

# 4. Check for Allan Castellanos
# ❌ Should NOT appear in the list
# 📊 Badge should be BLUE (Mock Data)
# Should see ~15 players total
```

**Expected:** Allan is NOT in the list

---

### Test 2: Prod Mode (Should SEE Allan)

```bash
# 1. Switch to prod mode
npm run env:switch prod

# 2. Start server
npm run dev

# 3. Open http://localhost:3000/rankings

# 4. Check for Allan Castellanos
# ✅ Should appear near the TOP (3000 points)
# 🗄️ Badge should be GREEN (Database)
# Should see ~31 players total
```

**Expected:** Allan IS in the list with 3000 points!

---

## 📊 Allan's Details

When you see him in prod mode, he should have:

- **Name:** Allan Castellanos
- **Category:** Open
- **Gender:** Male
- **Points:** 3000 (high score, near top of rankings)
- **Rank:** Will be calculated based on other players
- **Email:** allan.castellanos@email.com
- **Phone:** +1 (555) 999-0001
- **Instagram:** @allancastellanos

---

## 🔍 Quick Verification Commands

### Check if Allan is in the database:

```bash
docker exec -it riviera-open-test-db psql -U testuser -d riviera_open_test -c "SELECT first_name, last_name, points, category FROM players WHERE first_name = 'Allan';"
```

**Expected output:**

```
 first_name |  last_name  | points | category
------------+-------------+--------+----------
 Allan      | Castellanos |   3000 | Open
(1 row)
```

### Count total players in database:

```bash
docker exec -it riviera-open-test-db psql -U testuser -d riviera_open_test -c "SELECT COUNT(*) FROM players;"
```

**Expected:** 31 players (16 from seed + Allan)

---

## 🎨 Visual Comparison

### Dev Mode (Mock Data)

```
Rankings Page:
┌─────────────────────────────────────┐
│ 📊 Mock Data (dev)          [BLUE] │ ← Badge
├─────────────────────────────────────┤
│ Open Category                       │
│                                     │
│ 1. Marco Delgado - 2850 pts        │
│ 2. Sofia Rodriguez - 2650 pts      │
│ 3. Diego Martinez - 2400 pts       │
│ ...                                 │
│ (15 players total)                  │
│                                     │
│ ❌ NO Allan Castellanos             │
└─────────────────────────────────────┘
```

### Prod Mode (Database)

```
Rankings Page:
┌─────────────────────────────────────┐
│ 🗄️ Database (prod)         [GREEN] │ ← Badge
├─────────────────────────────────────┤
│ Open Category                       │
│                                     │
│ 1. Allan Castellanos - 3000 pts ⭐ │ ← NEW!
│ 2. Marco Delgado - 2850 pts        │
│ 3. Sofia Rodriguez - 2650 pts      │
│ 4. Diego Martinez - 2400 pts       │
│ ...                                 │
│ (31 players total)                  │
│                                     │
│ ✅ Allan is HERE!                   │
└─────────────────────────────────────┘
```

---

## 🎯 Why This Works

1. **Mock data** (`lib/data/mock/players.ts`) has 15 players
2. **Database** was seeded with 15 players + Allan = 16 players
3. Allan was added ONLY to the database
4. When you see Allan → You're definitely using the database!
5. When you DON'T see Allan → You're using mock data

---

## 🛠️ Managing Allan

### Add Allan (if not already added):

```bash
npm run db:add-allan
```

### Remove Allan:

```bash
docker exec -it riviera-open-test-db psql -U testuser -d riviera_open_test -c "DELETE FROM players WHERE first_name = 'Allan' AND last_name = 'Castellanos';"
```

### Reset database (removes Allan):

```bash
npm run test:db:reset
# Then add him back:
npm run db:add-allan
```

---

## 🐛 Troubleshooting

### "Allan appears in dev mode!"

**Problem:** This shouldn't happen!

**Check:**

1. Verify `.env.local` has `NEXT_PUBLIC_ENV=dev`
2. Restart dev server
3. Hard refresh browser (Cmd+Shift+R)
4. Check badge color (should be blue)

### "Allan doesn't appear in prod mode!"

**Problem:** Database might not have Allan

**Solution:**

```bash
# Check if Allan is in database
docker exec -it riviera-open-test-db psql -U testuser -d riviera_open_test -c "SELECT * FROM players WHERE first_name = 'Allan';"

# If not found, add him
npm run db:add-allan
```

### "I see Allan but badge is wrong color"

**Problem:** Environment mismatch

**Solution:**

1. Check `.env.local` file
2. Restart dev server
3. Hard refresh browser

---

## ✅ Verification Checklist

Use this checklist to verify both modes:

### Dev Mode Test:

- [ ] Switched to dev: `npm run env:switch dev`
- [ ] Started server: `npm run dev`
- [ ] Opened rankings page
- [ ] Badge is BLUE (📊 Mock Data)
- [ ] Allan Castellanos is NOT in the list
- [ ] ~15 players total

### Prod Mode Test:

- [ ] Switched to prod: `npm run env:switch prod`
- [ ] Started server: `npm run dev`
- [ ] Opened rankings page
- [ ] Badge is GREEN (🗄️ Database)
- [ ] Allan Castellanos IS in the list
- [ ] Allan has 3000 points
- [ ] ~31 players total

---

## 🎉 Success Criteria

You've successfully verified both modes when:

✅ Dev mode shows 15 players WITHOUT Allan
✅ Prod mode shows 31 players WITH Allan
✅ Badge colors match (blue=dev, green=prod)
✅ Allan appears near top in prod (3000 points)

---

## 💡 Pro Tip

**Bookmark this test!** Whenever you're unsure which mode you're in:

1. Look at badge color (quickest)
2. Look for Allan Castellanos (definitive proof)
3. Check player count (15 vs 31)

All three should align!

---

**Quick Commands:**

```bash
# Add Allan to database
npm run db:add-allan

# Switch to dev (no Allan)
npm run env:switch dev && npm run dev

# Switch to prod (with Allan)
npm run env:switch prod && npm run dev
```

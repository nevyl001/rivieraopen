# Homepage Fix - Empty Database Handling

## Issue

The homepage was crashing with "Cannot read properties of undefined (reading 'id')" when the database was empty.

## Root Cause

The `FeaturedPlayersClient` and `UpcomingTournamentsClient` components were not handling empty arrays properly:

1. **FeaturedPlayersClient**:
   - `getVisiblePlayers()` tried to access array indices that don't exist when array is empty
   - Carousel auto-rotation used modulo with length 0 (division by zero)
   - Dots indicator tried to map over empty array and access `.id` on undefined

2. **UpcomingTournamentsClient**:
   - Would render empty grid when no tournaments available

## Fix Applied

### FeaturedPlayersClient

- Added check for empty array before carousel operations
- Added early return with empty state message when no players
- Fixed `getVisiblePlayers()` to handle empty arrays
- Fixed carousel navigation to check for empty array

### UpcomingTournamentsClient

- Added early return with empty state message when no tournaments
- Shows friendly message instead of empty grid

## Changes Made

**Files Updated**:

- `components/home/FeaturedPlayersClient.tsx`
- `components/home/UpcomingTournamentsClient.tsx`

## Testing

✅ Build successful
✅ Components now handle empty data gracefully
✅ Shows friendly empty state messages

## Deploy

```bash
git add .
git commit -m "fix: handle empty database on homepage"
git push
```

## Next Step

**Populate your Neon database** to see actual data:

```bash
DATABASE_URL="your_neon_connection_string" npx tsx lib/data/migrations/002_seed_data.ts
```

This will add:

- 20+ players across all categories
- Multiple tournaments with photos and results
- All relationships and rankings

After running the seed script, your homepage will display:

- Upcoming tournaments section with 4 tournaments
- Featured players carousel with top players
- All data from your Neon database

## What You'll See

**Before seeding** (empty database):

- "No upcoming tournaments at the moment. Check back soon!"
- "No featured players available yet. Check back soon!"

**After seeding** (populated database):

- 4 upcoming tournaments with details
- Carousel of top-ranked players
- All data dynamically loaded from Neon

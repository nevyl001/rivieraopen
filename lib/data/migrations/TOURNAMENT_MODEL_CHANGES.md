# Tournament Model Changes - Multi-Category Support

## Overview

The tournament model has been redesigned to support multiple categories (levels) within a single tournament event. This better reflects the real-world structure where one tournament can host multiple divisions simultaneously.

## What Changed

### Before (Single Category Model)

- One tournament = one level/category
- "February Tournament Open" and "February Tournament Level 1" were separate records
- Players could only participate in one tournament at a time

### After (Multi-Category Model)

- One tournament event can have multiple categories
- "February Tournament at MyPadel" is ONE event with multiple categories (Open, Level 1, Level 2)
- Players can participate in multiple categories within the same tournament
- Each category has its own winners

## Database Schema Changes

### New Tables

1. **`tournament_categories`** - NEW

   - Links tournaments to their categories/levels
   - One tournament can have many categories
   - Unique constraint on (tournament_id, level)

2. **`tournament_category_winners`** - RENAMED from `tournament_winners`
   - Now references `category_id` instead of `tournament_id`
   - Winners are per category, not per tournament

### Modified Tables

1. **`tournaments`** - MODIFIED

   - **Removed**: `level` column (moved to categories)
   - **Kept**: All other fields (name, date, club, location, status, etc.)

2. **`tournament_results`** - MODIFIED

   - **Changed**: Now references `category_id` instead of `tournament_id`
   - Players' results are linked to specific categories

3. **`tournament_photos`** - UNCHANGED
   - Photos remain at tournament level (shared across all categories)

## TypeScript Type Changes

### New Types

```typescript
export interface TournamentCategory {
  id: string;
  tournamentId: string;
  level: Level;
  results?: TournamentCategoryResults;
}
```

### Modified Types

```typescript
export interface Tournament {
  id: string;
  name: string;
  date: string;
  club: string;
  location: string;
  status: TournamentStatus;
  registrationOpen: boolean;
  photos: string[];
  description?: string;
  categories: TournamentCategory[]; // NEW - array of categories
  // REMOVED: level field
  // REMOVED: results field (moved to categories)
}
```

## Repository Interface Changes

### New Methods

```typescript
// Add a category to a tournament
addCategory(tournamentId: string, level: Level): Promise<Tournament>;

// Remove a category from a tournament
removeCategory(tournamentId: string, categoryId: string): Promise<Tournament>;

// Update results for a specific category
updateCategoryResults(
  categoryId: string,
  results: { first: {...}, second: {...} }
): Promise<Tournament>;
```

### Modified Methods

```typescript
// getByLevel now returns tournaments that HAVE this level as a category
getByLevel(level: Level): Promise<Tournament[]>;

// update no longer allows modifying categories directly
update(id: string, tournament: Partial<Omit<Tournament, "categories">>): Promise<Tournament>;
```

### Removed Methods

```typescript
// REMOVED - use updateCategoryResults instead
updateResults(id: string, results: Tournament["results"]): Promise<Tournament>;
```

## Mock Data Changes

Tournaments now include a `categories` array:

```typescript
{
  id: "5",
  name: "Riviera Open Winter Championship",
  date: "2024-12-15",
  club: "Reserve Padel",
  location: "Miami, FL",
  status: "upcoming",
  registrationOpen: true,
  photos: [...],
  description: "...",
  categories: [
    {
      id: "5-open",
      tournamentId: "5",
      level: "Open",
    },
    {
      id: "5-level1",
      tournamentId: "5",
      level: "1",
    },
  ],
}
```

## Migration Path

### For Existing Code

1. **Reading tournaments**: Access `tournament.categories` instead of `tournament.level`
2. **Filtering by level**: Use `getByLevel()` - it now returns tournaments with that category
3. **Displaying results**: Loop through `tournament.categories` and check each category's `results`
4. **Creating tournaments**: Include `categories` array in the tournament object

### Example Code Updates

**Before:**

```typescript
const tournament = await repo.getById("1");
console.log(tournament.level); // "Open"
if (tournament.results) {
  console.log(tournament.results.first.playerName);
}
```

**After:**

```typescript
const tournament = await repo.getById("1");
console.log(tournament.categories.map((c) => c.level)); // ["Open", "1"]
tournament.categories.forEach((category) => {
  if (category.results) {
    console.log(`${category.level}: ${category.results.first.playerName}`);
  }
});
```

## Benefits

1. **Accurate Representation**: Matches real-world tournament structure
2. **Reduced Duplication**: Shared data (date, club, photos) stored once
3. **Flexible Participation**: Players can compete in multiple categories
4. **Better Queries**: Easy to find all categories for a tournament
5. **Cleaner Data**: No need for naming conventions to group related tournaments

## Breaking Changes

⚠️ **Important**: This is a breaking change for existing code that uses tournaments.

### What Breaks

1. Direct access to `tournament.level` (now in `tournament.categories[].level`)
2. Direct access to `tournament.results` (now in `tournament.categories[].results`)
3. `updateResults()` method (replaced with `updateCategoryResults()`)

### Migration Checklist

- [ ] Update all tournament displays to show categories
- [ ] Update tournament creation forms to support multiple categories
- [ ] Update result recording to specify category
- [ ] Update player profile to show category-specific results
- [ ] Update tournament filtering logic
- [ ] Run database migration script
- [ ] Update mock data (already done)
- [ ] Update repository implementations (MockTournamentRepository needs updates)
- [ ] Update all tests
- [ ] Update UI components

## Next Steps

1. **Update MockTournamentRepository** to implement new interface
2. **Update all tests** to work with new structure
3. **Update UI components** to display categories
4. **Run migration** on database
5. **Update SQLTournamentRepository** when implementing SQL layer

## Questions?

Refer to:

- Updated schema: `lib/data/migrations/001_initial_schema.sql`
- Updated types: `lib/types/tournament.ts`
- Updated mock data: `lib/data/mock/tournaments.ts`
- Repository interface: `lib/data/repositories/interfaces.ts`

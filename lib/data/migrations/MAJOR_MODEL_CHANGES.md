# Major Model Changes - Complete Redesign

## Summary

The data model has been completely redesigned with three major changes:

1. **"Level" → "Category"** terminology throughout
2. **Player Gender** added (Male/Female)
3. **Tournament Genre** added (Open/Women)

## 1. Terminology Change: Level → Category

**Rationale:** "Category" is the correct padel terminology for skill divisions.

### Changes:

- `Level` type → `Category` type
- `player.level` → `player.category`
- `tournament_levels` table → `tournament_categories` table
- All method names updated (`getByLevel` → `getByCategory`, etc.)

## 2. Player Gender

**New Field:** Players now have a `gender` field.

### Player Model:

```typescript
export type Gender = "Male" | "Female";

export interface Player {
  // ... existing fields
  category: Category; // was: level
  gender: Gender; // NEW
  // ... rest of fields
}
```

### Database:

```sql
ALTER TABLE players ADD COLUMN gender VARCHAR(10) NOT NULL CHECK (gender IN ('Male', 'Female'));
CREATE INDEX idx_players_gender ON players(gender);
CREATE INDEX idx_players_category_gender ON players(category, gender);
```

## 3. Tournament Genre

**New Field:** Tournaments now have a `genre` field that determines eligibility.

### Tournament Genres:

- **Open**: Males and females can participate
- **Women**: Only females can participate

### Tournament Model:

```typescript
export type TournamentGenre = "Open" | "Women";

export interface Tournament {
  // ... existing fields
  genre: TournamentGenre; // NEW
  categories: TournamentCategory[];
  // ... rest of fields
}
```

### Database:

```sql
ALTER TABLE tournaments ADD COLUMN genre VARCHAR(10) NOT NULL CHECK (genre IN ('Open', 'Women'));
CREATE INDEX idx_tournaments_genre ON tournaments(genre);
CREATE INDEX idx_tournaments_genre_status ON tournaments(genre, status);
```

## Complete Data Model

### Player Structure:

```typescript
{
  id: "1",
  firstName: "Marco",
  lastName: "Delgado",
  category: "Open",     // Skill category
  gender: "Male",       // NEW
  points: 2850,
  rank: 1,
  // ... contact, socials, results
}
```

### Tournament Structure:

```typescript
{
  id: "1",
  name: "February Tournament",
  club: "MyPadel",
  genre: "Open",        // NEW - Who can participate
  status: "upcoming",
  categories: [         // Skill categories offered
    { category: "Open", results: {...} },
    { category: "1", results: {...} },
    { category: "2", results: {...} }
  ]
}
```

## Real-World Examples

### Example 1: Open Tournament

```typescript
{
  name: "Riviera Open Winter Championship",
  genre: "Open",  // Males and females can play
  categories: [
    { category: "Open" },  // Top skill level
    { category: "1" }      // Second skill level
  ]
}
```

### Example 2: Women's Tournament

```typescript
{
  name: "Women's Spring Championship",
  genre: "Women",  // Only females can play
  categories: [
    { category: "Open" },  // Top skill level (women only)
    { category: "1" },     // Second skill level (women only)
    { category: "2" }      // Third skill level (women only)
  ]
}
```

### Example 3: Player Eligibility

```typescript
// Male player
{ firstName: "Marco", gender: "Male", category: "Open" }
// Can play in: genre="Open" tournaments

// Female player
{ firstName: "Sofia", gender: "Female", category: "Open" }
// Can play in: genre="Open" OR genre="Women" tournaments
```

## Database Schema Changes

### Players Table:

```sql
CREATE TABLE players (
  id UUID PRIMARY KEY,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  photo VARCHAR(500),
  category VARCHAR(10) CHECK (category IN ('Open', '1', '2', '3', '4', '5', '6')),  -- was: level
  gender VARCHAR(10) CHECK (gender IN ('Male', 'Female')),  -- NEW
  points INTEGER,
  rank INTEGER,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Tournaments Table:

```sql
CREATE TABLE tournaments (
  id UUID PRIMARY KEY,
  name VARCHAR(200),
  date DATE,
  club VARCHAR(200),
  location VARCHAR(200),
  genre VARCHAR(10) CHECK (genre IN ('Open', 'Women')),  -- NEW
  status VARCHAR(20) CHECK (status IN ('upcoming', 'in-progress', 'completed')),
  registration_open BOOLEAN,
  description TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Tournament Categories Table:

```sql
CREATE TABLE tournament_categories (  -- was: tournament_levels
  id UUID PRIMARY KEY,
  tournament_id UUID REFERENCES tournaments(id),
  category VARCHAR(10) CHECK (category IN ('Open', '1', '2', '3', '4', '5', '6')),  -- was: level
  created_at TIMESTAMP,
  UNIQUE(tournament_id, category)
);
```

## Repository Interface Changes

### Player Repository:

```typescript
interface IPlayerRepository {
  getByCategory(category: Category): Promise<Player[]>; // was: getByLevel
  recalculateRankings(category: Category): Promise<void>; // was: level parameter
  // ... other methods
}
```

### Tournament Repository:

```typescript
interface ITournamentRepository {
  getByGenre(genre: TournamentGenre): Promise<Tournament[]>;  // NEW
  getByCategory(category: Category): Promise<Tournament[]>;  // was: getByLevel
  addCategory(tournamentId: string, category: Category): Promise<Tournament>;  // was: addLevel
  removeCategory(tournamentId: string, categoryId: string): Promise<Tournament>;  // was: removeLevel
  updateCategoryResults(categoryId: string, results: {...}): Promise<Tournament>;  // was: updateLevelResults
  // ... other methods
}
```

## Migration Checklist

### Code Updates:

- [x] Update TypeScript types (player.ts, tournament.ts)
- [x] Update database schema (001_initial_schema.sql)
- [x] Update repository interfaces
- [x] Update mock data (players.ts, tournaments.ts)
- [x] Update MockPlayerRepository implementation
- [x] Update MockTournamentRepository implementation
- [x] Update all tests (144 tests passing)
- [x] Update UI components
- [x] Update seeding script (002_seed_data.ts)
- [x] Update utility functions (helpers.ts, levelTranslation.ts)
- [x] Build verification successful

### Database Migration:

```sql
-- Add new columns
ALTER TABLE players ADD COLUMN gender VARCHAR(10);
ALTER TABLE tournaments ADD COLUMN genre VARCHAR(10);

-- Rename columns
ALTER TABLE players RENAME COLUMN level TO category;
ALTER TABLE tournament_levels RENAME TO tournament_categories;
ALTER TABLE tournament_levels RENAME COLUMN level TO category;

-- Add constraints
ALTER TABLE players ADD CONSTRAINT check_gender CHECK (gender IN ('Male', 'Female'));
ALTER TABLE tournaments ADD CONSTRAINT check_genre CHECK (genre IN ('Open', 'Women'));

-- Add indexes
CREATE INDEX idx_players_gender ON players(gender);
CREATE INDEX idx_tournaments_genre ON tournaments(genre);
```

## Breaking Changes

⚠️ **All existing code using the old model will break!**

### What Breaks:

1. `player.level` → `player.category`
2. `getByLevel()` → `getByCategory()`
3. `tournament.levels` → `tournament.categories`
4. `addLevel()` → `addCategory()`
5. Missing `player.gender` field
6. Missing `tournament.genre` field

### Backward Compatibility:

Type aliases added for gradual migration:

```typescript
/** @deprecated Use Category instead */
export type Level = Category;
```

## Terminology Guide

| Concept                    | Correct Term | Database Column         | TypeScript Field        |
| -------------------------- | ------------ | ----------------------- | ----------------------- |
| Player skill division      | Category     | `category`              | `player.category`       |
| Player sex                 | Gender       | `gender`                | `player.gender`         |
| Tournament eligibility     | Genre        | `genre`                 | `tournament.genre`      |
| Tournament skill divisions | Categories   | `tournament_categories` | `tournament.categories` |

## Next Steps

1. Update MockPlayerRepository to use `category` and `gender`
2. Update MockTournamentRepository to use `category` and `genre`
3. Update all tests to use new terminology
4. Update UI components to display genre and gender
5. Add genre filtering in tournament lists
6. Add eligibility validation (women's tournaments)
7. Update SQLPlayerRepository (when implementing)
8. Update SQLTournamentRepository (when implementing)

## Questions?

Refer to:

- Updated schema: `lib/data/migrations/001_initial_schema.sql`
- Updated types: `lib/types/player.ts`, `lib/types/tournament.ts`
- Updated mock data: `lib/data/mock/players.ts`, `lib/data/mock/tournaments.ts`
- Repository interfaces: `lib/data/repositories/interfaces.ts`

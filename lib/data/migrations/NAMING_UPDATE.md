# Naming Update: Categories → Levels

## Summary

For consistency with player terminology, "tournament categories" have been renamed to "tournament levels" throughout the codebase.

## Rationale

- Players have **levels** (Open, 1, 2, 3, 4, 5, 6)
- Tournaments should use the same terminology: **levels** (not categories)
- This creates a consistent vocabulary across the entire application

## Changes Made

### Database Tables

- `tournament_categories` → `tournament_levels`
- `tournament_category_winners` → `tournament_level_winners`
- `category_id` → `level_id` (in tournament_results and tournament_level_winners)

### TypeScript Types

- `TournamentCategory` → `TournamentLevel`
- `TournamentCategoryResults` → `TournamentLevelResults`
- `tournament.categories` → `tournament.levels`

### Repository Methods

- `addCategory()` → `addLevel()`
- `removeCategory()` → `removeLevel()`
- `updateCategoryResults()` → `updateLevelResults()`
- `categoryId` parameter → `levelId` parameter

### Backward Compatibility

Type aliases added for backward compatibility:

```typescript
/** @deprecated Use TournamentLevel instead */
export type TournamentCategory = TournamentLevel;

/** @deprecated Use TournamentLevelResults instead */
export type TournamentCategoryResults = TournamentLevelResults;
```

## Terminology Guide

| Concept                   | Correct Term        | ❌ Avoid                |
| ------------------------- | ------------------- | ----------------------- |
| Player skill division     | Level               | Category, Division      |
| Tournament skill division | Level               | Category, Division      |
| Player's level            | `player.level`      | `player.category`       |
| Tournament's levels       | `tournament.levels` | `tournament.categories` |
| Database table            | `tournament_levels` | `tournament_categories` |

## Migration Notes

If you have existing code using the old terminology:

1. **TypeScript**: Update `categories` → `levels` in Tournament interface usage
2. **Database**: Run the updated migration script (001_initial_schema.sql)
3. **Repository calls**: Update method names (`addCategory` → `addLevel`, etc.)
4. **Comments/docs**: Update any references to "category" → "level"

The deprecated type aliases will help catch most issues at compile time.

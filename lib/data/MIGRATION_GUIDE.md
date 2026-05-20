# Component Migration Guide: Repository Pattern

This guide explains how to migrate existing components from direct mock data imports to the repository pattern, enabling environment-based data switching between mock and SQL implementations.

## Table of Contents

1. [Overview](#overview)
2. [Environment Setup](#environment-setup)
3. [Migration Patterns](#migration-patterns)
4. [Common Scenarios](#common-scenarios)
5. [Troubleshooting](#troubleshooting)

---

## Overview

The repository pattern provides a unified interface for data access, allowing components to work with different data sources (mock or SQL) based on the environment configuration.

**Benefits:**

- Environment-based data switching (dev uses mock, prod uses SQL)
- Consistent data access interface across the application
- Easier testing and development
- Separation of concerns between UI and data layers

**Key Concepts:**

- **Server Components**: Fetch data using repositories (runs on server)
- **Client Components**: Receive data as props (runs in browser)
- **Repository Factory**: Provides repository instances based on environment

---

## Environment Setup

### 1. Environment Variables

Create a `.env.local` file in the project root:

```bash
# Development environment (uses mock data)
NEXT_PUBLIC_ENV=dev
```

For production:

```bash
# Production environment (uses SQL database)
NEXT_PUBLIC_ENV=prod
DATABASE_URL=postgresql://user:password@host:5432/database
```

### 2. Verify Configuration

The environment configuration is validated at runtime. If `NEXT_PUBLIC_ENV` is not set or invalid, the application will throw a `ConfigurationError`.

**Valid values:**

- `dev` - Uses mock repositories (in-memory data)
- `prod` - Uses SQL repositories (PostgreSQL database)

---

## Migration Patterns

### Pattern 1: Server Component with Client Component (Recommended)

This is the recommended pattern for Next.js App Router. Data fetching happens in the Server Component, and the Client Component handles interactivity.

**Before Migration:**

```typescript
// app/rankings/page.tsx
"use client";

import { useState } from "react";
import { mockPlayers } from "@/lib/data/mock/players";

export default function RankingsPage() {
  const [selectedLevel, setSelectedLevel] = useState("Open");
  const players = mockPlayers.filter((p) => p.category === selectedLevel);

  return <div>{/* UI code */}</div>;
}
```

**After Migration:**

```typescript
// app/rankings/page.tsx (Server Component)
import { RankingsPageClient } from "./RankingsPageClient";
import RepositoryFactory from "@/lib/data/repositories/repository-factory";
import { Category, Player } from "@/lib/types";

export default async function RankingsPage() {
  // Fetch data on the server
  const playerRepository = await RepositoryFactory.getPlayerRepository();

  const categories: Category[] = ["Open", "1", "2", "3", "4", "5", "6"];
  const playersByCategory: Record<Category, Player[]> = {
    Open: [],
    "1": [],
    "2": [],
    "3": [],
    "4": [],
    "5": [],
    "6": [],
  };

  for (const category of categories) {
    playersByCategory[category] = await playerRepository.getByCategory(
      category
    );
  }

  return <RankingsPageClient initialPlayersByCategory={playersByCategory} />;
}
```

```typescript
// app/rankings/RankingsPageClient.tsx (Client Component)
"use client";

import { useState } from "react";
import { Category, Player } from "@/lib/types";

interface RankingsPageClientProps {
  initialPlayersByCategory: Record<Category, Player[]>;
}

export function RankingsPageClient({
  initialPlayersByCategory,
}: RankingsPageClientProps) {
  const [selectedLevel, setSelectedLevel] = useState<Category>("Open");
  const levelPlayers = initialPlayersByCategory[selectedLevel] || [];

  return <div>{/* UI code using levelPlayers */}</div>;
}
```

**Key Points:**

- Server Component (`page.tsx`) is async and fetches data
- Client Component receives data as props
- No `"use client"` directive in Server Component
- Repository imports only in Server Component (prevents browser bundling issues)

---

### Pattern 2: API Route (For Client-Side Data Fetching)

Use this pattern when you need to fetch data from the client side (e.g., dynamic updates, infinite scroll).

**Create API Route:**

```typescript
// app/api/players/route.ts
import { NextRequest, NextResponse } from "next/server";
import RepositoryFactory from "@/lib/data/repositories/repository-factory";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");

    const playerRepository = await RepositoryFactory.getPlayerRepository();

    if (category) {
      const players = await playerRepository.getByCategory(category as any);
      return NextResponse.json(players);
    }

    const players = await playerRepository.getAll();
    return NextResponse.json(players);
  } catch (error) {
    console.error("Failed to fetch players:", error);
    return NextResponse.json(
      { error: "Failed to fetch players" },
      { status: 500 }
    );
  }
}
```

**Client Component:**

```typescript
"use client";

import { useState, useEffect } from "react";
import { Player } from "@/lib/types";

export function PlayerList() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlayers() {
      try {
        const response = await fetch("/api/players?category=Open");
        const data = await response.json();
        setPlayers(data);
      } catch (error) {
        console.error("Failed to fetch players:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPlayers();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {players.map((player) => (
        <div key={player.id}>
          {player.firstName} {player.lastName}
        </div>
      ))}
    </div>
  );
}
```

---

## Common Scenarios

### Scenario 1: Fetching All Players

```typescript
const playerRepository = await RepositoryFactory.getPlayerRepository();
const allPlayers = await playerRepository.getAll();
```

### Scenario 2: Fetching Players by Category

```typescript
const playerRepository = await RepositoryFactory.getPlayerRepository();
const openPlayers = await playerRepository.getByCategory("Open");
```

### Scenario 3: Fetching a Single Player

```typescript
const playerRepository = await RepositoryFactory.getPlayerRepository();
const player = await playerRepository.getById("player-123");
```

### Scenario 4: Fetching All Tournaments

```typescript
const tournamentRepository = await RepositoryFactory.getTournamentRepository();
const allTournaments = await tournamentRepository.getAll();
```

### Scenario 5: Fetching Tournaments by Status

```typescript
const tournamentRepository = await RepositoryFactory.getTournamentRepository();
const upcomingTournaments = await tournamentRepository.getByStatus("upcoming");
```

### Scenario 6: Fetching Tournaments by Category

```typescript
const tournamentRepository = await RepositoryFactory.getTournamentRepository();
const openTournaments = await tournamentRepository.getByCategory("Open");
```

### Scenario 7: Fetching Multiple Data Types

```typescript
// Fetch both players and tournaments
const playerRepository = await RepositoryFactory.getPlayerRepository();
const tournamentRepository = await RepositoryFactory.getTournamentRepository();

const [players, tournaments] = await Promise.all([
  playerRepository.getAll(),
  tournamentRepository.getAll(),
]);
```

---

## Troubleshooting

### Issue 1: "Module not found: Can't resolve 'dns'" or similar Node.js module errors

**Cause:** You're importing `RepositoryFactory` in a Client Component, which causes Next.js to try bundling Node.js-only code (like the `pg` library) for the browser.

**Solution:** Move data fetching to a Server Component or API route.

```typescript
// ❌ Wrong - Client Component importing repository
"use client";
import RepositoryFactory from "@/lib/data/repositories/repository-factory";

// ✅ Correct - Server Component importing repository
import RepositoryFactory from "@/lib/data/repositories/repository-factory";
export default async function Page() { ... }

// ✅ Also correct - API route
// app/api/data/route.ts
import RepositoryFactory from "@/lib/data/repositories/repository-factory";
```

---

### Issue 2: "ConfigurationError: NEXT_PUBLIC_ENV must be set to 'dev' or 'prod'"

**Cause:** The `NEXT_PUBLIC_ENV` environment variable is not set or has an invalid value.

**Solution:** Create or update `.env.local`:

```bash
NEXT_PUBLIC_ENV=dev
```

Then restart your development server:

```bash
npm run dev
```

---

### Issue 3: Data not updating after changes

**Cause:** Repository instances are cached as singletons.

**Solution:** For testing, use the `reset()` method:

```typescript
import RepositoryFactory from "@/lib/data/repositories/repository-factory";

// In tests
afterEach(() => {
  RepositoryFactory.reset();
});
```

For development, restart the dev server to clear the cache.

---

### Issue 4: TypeScript errors with Category type

**Cause:** Using old `Level` type or incorrect category values.

**Solution:** Use the `Category` type and correct values:

```typescript
import { Category } from "@/lib/types";

// ✅ Correct
const category: Category = "Open"; // or "1", "2", "3", "4", "5", "6"

// ❌ Wrong
const category = "1st"; // Should be "1"
const category = "Open Level"; // Should be "Open"
```

---

### Issue 5: "Cannot read properties of undefined" when accessing data

**Cause:** Data might not be loaded yet, or the repository method returned undefined.

**Solution:** Add proper error handling and loading states:

```typescript
// Server Component
export default async function Page() {
  try {
    const repository = await RepositoryFactory.getPlayerRepository();
    const players = await repository.getAll();

    return <ClientComponent players={players} />;
  } catch (error) {
    console.error("Failed to fetch data:", error);
    return <ErrorComponent />;
  }
}

// Client Component with API
const [data, setData] = useState<Player[]>([]);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  fetch("/api/players")
    .then((res) => res.json())
    .then(setData)
    .catch((err) => setError(err.message));
}, []);

if (error) return <div>Error: {error}</div>;
if (!data.length) return <div>Loading...</div>;
```

---

### Issue 6: Production database connection errors

**Cause:** Missing or incorrect `DATABASE_URL` environment variable.

**Solution:** Ensure `DATABASE_URL` is set in production environment:

```bash
DATABASE_URL=postgresql://user:password@host:5432/database
```

The connection string format:

```
postgresql://[user]:[password]@[host]:[port]/[database]
```

---

## Migration Checklist

Use this checklist when migrating a component:

- [ ] Identify if component needs to be Server or Client Component
- [ ] If Client Component is needed, create separate Server Component for data fetching
- [ ] Replace direct mock data imports with repository calls
- [ ] Update imports to use `@/lib/types` for type definitions
- [ ] Add proper error handling
- [ ] Test in dev environment (mock data)
- [ ] Verify build passes (`npm run build`)
- [ ] Run test suite (`npm test`)
- [ ] Update component tests if needed

---

## Best Practices

1. **Prefer Server Components** for data fetching when possible
2. **Use API routes** only when client-side fetching is necessary
3. **Handle errors gracefully** with try-catch blocks
4. **Add loading states** for better UX
5. **Type your data** using TypeScript interfaces from `@/lib/types`
6. **Test thoroughly** in both dev and prod environments
7. **Keep data fetching logic** separate from UI logic
8. **Use Promise.all** when fetching multiple data sources in parallel

---

## Additional Resources

- **Repository Interfaces**: `lib/data/repositories/interfaces.ts`
- **Repository Factory**: `lib/data/repositories/repository-factory.ts`
- **Mock Implementations**: `lib/data/implementations/mock/`
- **SQL Implementations**: `lib/data/implementations/sql/`
- **Type Definitions**: `lib/types/`
- **Environment Config**: `lib/config/environment.ts`

---

## Need Help?

If you encounter issues not covered in this guide:

1. Check the console for error messages
2. Verify environment variables are set correctly
3. Ensure you're following the correct pattern (Server vs Client Component)
4. Review the example migration in `app/rankings/`
5. Check that all dependencies are installed (`npm install`)

For database-specific issues in production, refer to the database setup documentation in `lib/data/migrations/README.md`.

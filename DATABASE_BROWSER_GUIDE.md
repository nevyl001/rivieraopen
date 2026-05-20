# Database Browser Guide - Environment-Aware Data Loading

## What Changed

All public pages now respect the `NEXT_PUBLIC_ENV` environment variable and use the repository factory to load data:

### Updated Pages

- ✅ `/` (Home page) - Uses `UpcomingTournamentsServer` and `FeaturedPlayersServer`
- ✅ `/tournaments` - Fetches from repository
- ✅ `/tournaments/[id]` - Fetches from repository
- ✅ `/gallery` - Fetches from repository
- ✅ `/players/[id]` - Fetches from repository
- ✅ `/rankings` - Already using repository (no changes needed)

### How It Works

**Development Mode (`NEXT_PUBLIC_ENV=dev`)**:

- All pages use mock data from `lib/data/mock/`
- No database connection required
- Fast development experience

**Production Mode (`NEXT_PUBLIC_ENV=prod`)**:

- All pages use data from your database (Neon or local PostgreSQL)
- Repository factory connects to `DATABASE_URL`
- Changes in admin interface immediately reflect on public site

## Testing Locally

### Test with Mock Data

```bash
# .env.local
NEXT_PUBLIC_ENV=dev
```

Run the app:

```bash
npm run dev
```

All pages will show mock data.

### Test with Local Database

```bash
# .env.local
NEXT_PUBLIC_ENV=prod
DATABASE_URL=postgresql://testuser:testpassword@localhost:5433/riviera_open_test
```

Run the app:

```bash
npm run dev
```

All pages will show data from your local PostgreSQL database.

### Test with Neon Database

```bash
# .env.local
NEXT_PUBLIC_ENV=prod
DATABASE_URL=your_neon_connection_string
```

Run the app:

```bash
npm run dev
```

All pages will show data from your Neon database.

## Deploying to Vercel

Your Vercel environment variables should be:

```
NEXT_PUBLIC_ENV=prod
DATABASE_URL=your_neon_connection_string
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_admin_password
```

## Populating Your Database

If your database is empty, you have two options:

### Option 1: Run the Seed Script

```bash
DATABASE_URL="your_connection_string" npx tsx lib/data/migrations/002_seed_data.ts
```

This will populate your database with all the mock data (players, tournaments, results).

### Option 2: Use the Admin Interface

1. Go to `/admin/login`
2. Log in with your admin credentials
3. Manually add players and tournaments through the UI

## Verifying Data Source

To verify which data source a page is using:

1. **Check the environment variable**:
   - `NEXT_PUBLIC_ENV=dev` → Mock data
   - `NEXT_PUBLIC_ENV=prod` → Database data

2. **Test the admin interface**:
   - Add a new player in the admin interface
   - Check if it appears on the public site
   - If it appears → Using database
   - If it doesn't appear → Using mock data (check environment variable)

3. **Check the rankings page**:
   - The rankings page always uses the repository
   - If rankings are empty → Database is empty
   - If rankings show data → Database has data

## Architecture

### Server Components (Fetch Data)

- `app/page.tsx` - Home page
- `app/tournaments/page.tsx` - Tournaments list
- `app/tournaments/[id]/page.tsx` - Tournament detail
- `app/gallery/page.tsx` - Gallery
- `app/players/[id]/page.tsx` - Player detail
- `components/home/UpcomingTournamentsServer.tsx` - Home tournaments section
- `components/home/FeaturedPlayersServer.tsx` - Home players section

### Client Components (UI/Interactivity)

- `app/tournaments/TournamentsPageClient.tsx` - Tournaments filtering
- `app/tournaments/[id]/TournamentDetailClient.tsx` - Tournament photo modal
- `app/gallery/GalleryPageClient.tsx` - Gallery filtering and modal
- `components/home/UpcomingTournamentsClient.tsx` - Tournaments carousel
- `components/home/FeaturedPlayersClient.tsx` - Players carousel

### Repository Factory

- `lib/data/repositories/repository-factory.ts`
- Checks `NEXT_PUBLIC_ENV` to determine which repository to use
- Returns `MockPlayerRepository` or `SQLPlayerRepository`
- Returns `MockTournamentRepository` or `SQLTournamentRepository`

## Dynamic Rendering

All pages that use the database are marked with `export const dynamic = "force-dynamic"` to ensure they're rendered on-demand rather than at build time. This is necessary because:

1. Database connection isn't available during build
2. Data can change after deployment (via admin interface)
3. We want fresh data on every request

## Benefits

1. **Consistent Behavior**: Local and production environments work the same way
2. **Easy Testing**: Switch between mock and real data with one environment variable
3. **Admin Integration**: Changes in admin immediately reflect on public site
4. **No Hardcoded Data**: All data comes from a single source of truth

## Next Steps

1. **Populate your Neon database** using the seed script
2. **Deploy to Vercel** with the correct environment variables
3. **Test the admin interface** to verify changes reflect on the public site
4. **Add your own data** through the admin interface

## Troubleshooting

### Public site shows no data

- Check `NEXT_PUBLIC_ENV` is set to `prod`
- Check `DATABASE_URL` is correct
- Check database has data (use admin interface or run seed script)

### Public site shows mock data in production

- Check `NEXT_PUBLIC_ENV` is set to `prod` in Vercel
- Redeploy after changing environment variables

### Database connection errors

- Check `DATABASE_URL` format is correct
- Check database is accessible from your location
- Check Neon database is running (not paused)

### Changes in admin don't appear on public site

- Check both admin and public pages are using `NEXT_PUBLIC_ENV=prod`
- Clear browser cache
- Check database was actually updated (use Neon SQL editor)

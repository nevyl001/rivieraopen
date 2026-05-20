# Neon Database Setup Guide for Production

This guide will help you set up a Neon PostgreSQL database for your Riviera Open admin interface in production.

## Step 1: Create Neon Database

1. **Go to Neon**: https://neon.tech
2. **Sign up or Login** (free tier available - perfect for getting started)
3. **Create a new project**:
   - Click **"New Project"**
   - **Name**: `riviera-open-prod`
   - **Region**: Choose closest to your users (e.g., US East, EU West)
   - **PostgreSQL version**: 16 (latest)
   - Click **"Create Project"**

4. **Copy your connection string**:
   - After creation, you'll see a connection string like:
   ```
   postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```

   - **Save this!** You'll need it for Vercel

## Step 2: Run Database Schema

You need to create the tables in your Neon database. You have two options:

### Option A: Using Neon SQL Editor (Easiest)

1. In your Neon dashboard, click **"SQL Editor"**
2. Copy the entire contents of `lib/data/migrations/001_initial_schema.sql`
3. Paste into the SQL Editor
4. Click **"Run"**
5. You should see: "Query executed successfully"

### Option B: Using psql Command Line

If you have `psql` installed:

```bash
# Replace with your actual Neon connection string
psql "postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require" \
  -f lib/data/migrations/001_initial_schema.sql
```

## Step 3: Verify Database Setup

In Neon SQL Editor, run:

```sql
-- Check tables were created
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';
```

You should see these tables:

- `players`
- `player_contacts`
- `player_socials`
- `tournaments`
- `tournament_categories`
- `tournament_category_winners`
- `tournament_photos`
- `tournament_results`

## Step 4: (Optional) Add Sample Data

If you want to test with some data, you can add a sample player:

```sql
-- Insert a test player
INSERT INTO players (first_name, last_name, photo, category, gender, points, rank)
VALUES ('Test', 'Player', 'https://via.placeholder.com/150', 'Open', 'Male', 1000, 1)
RETURNING id;

-- Note the returned ID, then add contact info (replace YOUR_PLAYER_ID)
INSERT INTO player_contacts (player_id, email, phone)
VALUES ('YOUR_PLAYER_ID', 'test@example.com', '+1234567890');

-- Add social media (optional)
INSERT INTO player_socials (player_id, instagram, facebook, twitter)
VALUES ('YOUR_PLAYER_ID', 'https://instagram.com/test', '', '');
```

## Step 5: Configure Vercel Environment Variables

1. Go to your **Vercel Dashboard**
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

### Required Variables:

```env
# Database
DATABASE_URL=postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require

# Environment
NEXT_PUBLIC_ENV=prod

# Admin Credentials (CHANGE THESE!)
ADMIN_USERNAME=your_secure_username
ADMIN_PASSWORD=your_very_secure_password
```

### Important Security Notes:

⚠️ **Change the admin credentials!** Don't use the default `admin/admin123`

✅ **Use a strong password**:

- At least 12 characters
- Mix of uppercase, lowercase, numbers, symbols
- Example: `MySecure#Admin2024!Pass`

## Step 6: Deploy to Vercel

### If using GitHub:

1. **Commit and push your code**:

   ```bash
   git add .
   git commit -m "Add admin interface with Neon database"
   git push
   ```

2. **Vercel will auto-deploy**
   - Check the deployment logs
   - Wait for build to complete

### If deploying manually:

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Deploy
vercel --prod
```

## Step 7: Test Your Admin Interface

1. **Access your admin**:

   ```
   https://your-app.vercel.app/admin
   ```

2. **Login** with your credentials

3. **Test basic operations**:
   - ✅ View players list
   - ✅ Create a new player
   - ✅ Edit a player
   - ✅ Create a tournament
   - ✅ View audit log

## Neon Database Features

### Free Tier Includes:

- ✅ 0.5 GB storage
- ✅ Unlimited queries
- ✅ Automatic backups
- ✅ Branching (database copies for testing)
- ✅ Connection pooling
- ✅ SSL/TLS encryption

### Neon Advantages:

- **Serverless**: Scales to zero when not in use
- **Fast**: Optimized for Vercel/serverless
- **Branching**: Create database copies for testing
- **Backups**: Automatic point-in-time recovery
- **No cold starts**: Unlike some serverless databases

## Troubleshooting

### Connection Issues

**Error**: "Connection refused" or "timeout"

**Solution**:

1. Check your connection string is correct
2. Ensure `?sslmode=require` is at the end
3. Verify your IP isn't blocked (Neon allows all by default)

### Schema Not Created

**Error**: "Table does not exist"

**Solution**:

1. Go to Neon SQL Editor
2. Run the schema file again
3. Check for any SQL errors in the output

### Admin Login Fails

**Error**: "Invalid credentials"

**Solution**:

1. Check Vercel environment variables are set
2. Verify `ADMIN_USERNAME` and `ADMIN_PASSWORD` match what you're entering
3. Redeploy after changing environment variables

### Data Not Persisting

**Error**: Changes disappear after refresh

**Solution**:

1. Verify `NEXT_PUBLIC_ENV=prod` is set in Vercel
2. Check `DATABASE_URL` is correct
3. Look at Vercel function logs for errors

## Database Management

### Viewing Data

Use Neon SQL Editor to query your data:

```sql
-- View all players
SELECT * FROM players ORDER BY rank;

-- View all tournaments
SELECT * FROM tournaments ORDER BY date DESC;

-- View audit log (if you add this table)
SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 50;
```

### Backing Up Data

Neon provides automatic backups, but you can also export:

1. In Neon dashboard, go to **"Backups"**
2. Click **"Create backup"**
3. Or use the admin interface **"Export"** feature

### Database Branching (Testing)

Neon's killer feature - create a copy of your database:

1. In Neon dashboard, click **"Branches"**
2. Click **"Create branch"**
3. Name it `testing` or `staging`
4. Get a new connection string for this branch
5. Use it in a separate Vercel preview deployment

## Next Steps

### Recommended Enhancements:

1. **Add Vercel KV for Sessions** (for multi-region):
   - Stores CSRF tokens and rate limits
   - Better than in-memory for serverless

2. **Add Cloudinary for Images**:
   - File uploads won't work with Vercel's read-only filesystem
   - Cloudinary has a generous free tier

3. **Set up Monitoring**:
   - Neon provides query analytics
   - Vercel provides function logs
   - Consider Sentry for error tracking

4. **Enable Neon Autoscaling** (paid plans):
   - Automatically scales compute based on load
   - Useful as your app grows

## Cost Estimates

### Free Tier (Perfect for Starting):

- **Neon**: Free (0.5 GB storage, unlimited queries)
- **Vercel**: Free (100 GB bandwidth, 100 GB-hours compute)
- **Total**: $0/month

### As You Grow:

- **Neon Pro**: $19/month (3 GB storage, more compute)
- **Vercel Pro**: $20/month (1 TB bandwidth, 1000 GB-hours)
- **Total**: ~$39/month (handles significant traffic)

## Support

- **Neon Docs**: https://neon.tech/docs
- **Neon Discord**: https://discord.gg/neon
- **Vercel Docs**: https://vercel.com/docs

## Summary Checklist

- [ ] Created Neon project
- [ ] Copied connection string
- [ ] Ran schema SQL in Neon SQL Editor
- [ ] Verified tables were created
- [ ] Set Vercel environment variables:
  - [ ] `DATABASE_URL`
  - [ ] `NEXT_PUBLIC_ENV=prod`
  - [ ] `ADMIN_USERNAME` (changed from default!)
  - [ ] `ADMIN_PASSWORD` (strong password!)
- [ ] Deployed to Vercel
- [ ] Tested admin login
- [ ] Created a test player
- [ ] Verified data persists

---

**You're ready to go!** 🚀

Your admin interface is now running on Vercel with a Neon PostgreSQL database.

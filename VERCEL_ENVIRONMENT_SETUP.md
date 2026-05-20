# Vercel Environment Setup Guide

## Debug Your Current Setup

Once the deployment finishes, visit:

- **Dev domain**: https://riviera-open-web.vercel.app/debug-env
- **Prod domain**: https://rivieraopen.com/debug-env

This will show you exactly what environment variables are being used.

## Correct Vercel Environment Variable Setup

### Step 1: Go to Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Select your `riviera-open-web` project
3. Go to **Settings** → **Environment Variables**

### Step 2: Configure NEXT_PUBLIC_ENV

Click **Add New** → **Environment Variable**

**Variable Name**: `NEXT_PUBLIC_ENV`

**Values**:

- **Production**: `prod` ✓ (check this box)
- **Preview**: `dev` ✓ (check this box)
- **Development**: `dev` ✓ (check this box)

Click **Save**

### Step 3: Configure DATABASE_URL

If you already have `DATABASE_URL`, click **Edit** on it.

**Variable Name**: `DATABASE_URL`

**Values**:

- **Production**: `your_neon_connection_string` ✓ (check this box ONLY)
- **Preview**: ✗ (UNCHECK this box)
- **Development**: ✗ (UNCHECK this box)

Click **Save**

### Step 4: Verify Branch Configuration

Go to **Settings** → **Git**

Make sure:

- **Production Branch**: `main`

Go to **Settings** → **Domains**

For each domain, verify:

- `rivieraopen.com` → Git Branch: `main`
- `www.rivieraopen.com` → Git Branch: `main`
- `riviera-open-web.vercel.app` → Git Branch: `development` (or leave as default for preview)

### Step 5: Redeploy

After changing environment variables, you need to redeploy:

**Option A: Push a new commit**

```bash
git commit --allow-empty -m "trigger redeploy"
git push
```

**Option B: Redeploy from Vercel Dashboard**

1. Go to **Deployments**
2. Click the three dots (...) on the latest deployment
3. Click **Redeploy**

## Expected Results

After redeployment, check the debug page:

### Production (rivieraopen.com/debug-env)

```
NEXT_PUBLIC_ENV: prod
DATABASE_URL: SET ✅
VERCEL_ENV: production
Git Branch: main
```

### Preview (riviera-open-web.vercel.app/debug-env)

```
NEXT_PUBLIC_ENV: dev
DATABASE_URL: NOT SET ❌
VERCEL_ENV: preview
Git Branch: development
```

## Common Issues

### Issue 1: Preview still shows "prod"

**Cause**: Environment variables not configured for Preview deployments

**Fix**:

1. Go to Environment Variables
2. Edit `NEXT_PUBLIC_ENV`
3. Make sure **Preview** checkbox is checked with value `dev`
4. Redeploy

### Issue 2: Preview still connects to database

**Cause**: `DATABASE_URL` is set for Preview deployments

**Fix**:

1. Go to Environment Variables
2. Edit `DATABASE_URL`
3. **UNCHECK** the Preview checkbox
4. Only Production should be checked
5. Redeploy

### Issue 3: Changes not taking effect

**Cause**: Need to redeploy after changing environment variables

**Fix**:

```bash
git commit --allow-empty -m "trigger redeploy"
git push
```

### Issue 4: Wrong branch deploying to domain

**Cause**: Domain not assigned to correct branch

**Fix**:

1. Go to Settings → Domains
2. Click Edit on the domain
3. Set correct Git Branch
4. Save

## Workflow After Setup

### Development Workflow

```bash
# Work on development branch
git checkout development

# Make changes
git add .
git commit -m "feat: new feature"
git push

# Automatically deploys to riviera-open-web.vercel.app
# Uses mock data (NEXT_PUBLIC_ENV=dev)
```

### Production Workflow

```bash
# Merge to main when ready
git checkout main
git merge development
git push

# Automatically deploys to rivieraopen.com
# Uses real database (NEXT_PUBLIC_ENV=prod)
```

## Verification Checklist

- [ ] Visit https://riviera-open-web.vercel.app/debug-env
- [ ] Verify `NEXT_PUBLIC_ENV` shows "dev"
- [ ] Verify `DATABASE_URL` shows "NOT SET"
- [ ] Visit https://rivieraopen.com/debug-env
- [ ] Verify `NEXT_PUBLIC_ENV` shows "prod"
- [ ] Verify `DATABASE_URL` shows "SET"
- [ ] Test homepage on both domains
- [ ] Dev domain should show mock data or empty states
- [ ] Prod domain should show database data

## Screenshot of Correct Setup

Your Environment Variables page should look like this:

```
NEXT_PUBLIC_ENV
  Production: prod ✓
  Preview: dev ✓
  Development: dev ✓

DATABASE_URL
  Production: postgresql://... ✓
  Preview: (unchecked) ✗
  Development: (unchecked) ✗

ADMIN_USERNAME
  Production: admin ✓
  Preview: admin ✓
  Development: admin ✓

ADMIN_PASSWORD
  Production: ******** ✓
  Preview: ******** ✓
  Development: ******** ✓
```

## Need Help?

If you're still seeing production data on the preview domain after following these steps:

1. Check the debug page: `/debug-env`
2. Take a screenshot of your Environment Variables page in Vercel
3. Verify you've redeployed after making changes
4. Check that you're on the correct branch (`development` for preview)

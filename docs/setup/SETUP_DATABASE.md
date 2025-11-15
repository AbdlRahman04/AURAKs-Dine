# ⚠️ IMPORTANT: Database Setup Required

## Current Issue

Your `DATABASE_URL` in the `.env` file contains placeholder values. You need to set up a real PostgreSQL database before registration will work.

## Quick Fix (5 minutes)

### Option 1: Use Neon (Recommended - Free)

1. **Sign up at https://neon.tech** (free, no credit card needed)
2. **Create a new project**
3. **Copy your connection string** from the Neon dashboard
4. **Update `.env` file** - replace the DATABASE_URL line with your Neon connection string
5. **Run**: `npm run db:init`
6. **Restart server**: Stop (Ctrl+C) and run `npm run dev` again
7. **Try registration** - it should work now!

### Option 2: Use Local PostgreSQL

If you have PostgreSQL installed locally:

1. Create a database: `createdb quickdineflow`
2. Update `.env`:
   ```
   DATABASE_URL=postgresql://your-username:your-password@localhost:5432/quickdineflow
   ```
3. Run: `npm run db:init`
4. Restart server

## What Your DATABASE_URL Should Look Like

**❌ Wrong (placeholder):**
```
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
```

**✅ Correct (Neon example):**
```
DATABASE_URL=postgresql://username:actualpassword@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

**✅ Correct (Local example):**
```
DATABASE_URL=postgresql://postgres:mypassword@localhost:5432/quickdineflow
```

## After Setting Up Database

1. Run `npm run db:init` to create tables
2. Restart your server
3. Try registering - it should work!

See `DATABASE_SETUP.md` for detailed instructions.


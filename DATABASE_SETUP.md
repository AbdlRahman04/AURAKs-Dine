# Database Setup Guide

## The Problem

Your `.env` file currently has placeholder values in the `DATABASE_URL`. You need to set up a real PostgreSQL database.

## Quick Solution: Use Neon (Free PostgreSQL Database)

Neon offers a free PostgreSQL database that works perfectly with this project.

### Step 1: Create a Neon Account

1. Go to https://neon.tech
2. Sign up for a free account (no credit card required)
3. Create a new project

### Step 2: Get Your Database Connection String

1. In your Neon dashboard, click on your project
2. Go to the "Connection Details" or "Connection String" section
3. Copy the connection string - it will look like:
   ```
   postgresql://username:password@ep-xxxx-xxxx.us-east-2.aws.neon.tech/dbname?sslmode=require
   ```

### Step 3: Update Your .env File

1. Open the `.env` file in your project root
2. Find the line that says:
   ```
   DATABASE_URL=postgresql://user:password@host/database?sslmode=require
   ```
3. Replace it with your actual Neon connection string:
   ```
   DATABASE_URL=postgresql://your-actual-neon-connection-string
   ```
4. Save the file

### Step 4: Initialize the Database Tables

After updating your DATABASE_URL, run:

```bash
npm run db:init
```

This will create all the necessary tables in your database.

### Step 5: Restart Your Server

1. Stop the current server (Ctrl+C in the terminal)
2. Start it again:
   ```bash
   npm run dev
   ```

### Step 6: Try Registration Again

Now try to register a new account - it should work!

## Alternative: Use Your Own PostgreSQL Database

If you already have a PostgreSQL database:

1. Make sure it's running and accessible
2. Update your `.env` file with the connection string:
   ```
   DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
   ```
3. Run `npm run db:init` to create the tables

## Verification

To verify your DATABASE_URL is correct:

1. It should NOT contain words like: `user`, `password`, `host`, `database` (unless those are your actual values)
2. It should start with `postgresql://`
3. It should contain your actual database hostname (like `ep-xxxx.neon.tech` for Neon)

## Need Help?

- **Neon Documentation**: https://neon.tech/docs
- **Connection Issues**: Make sure your database allows connections from your IP
- **SSL Required**: Most cloud databases require SSL, so keep `?sslmode=require` in your connection string


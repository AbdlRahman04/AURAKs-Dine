# Step-by-Step: Getting Your Neon Connection String

## Step 1: Click "Connect" Button

In your Neon dashboard, find the **"Connect to your database"** card and click the **"Connect"** button.

## Step 2: Copy the Connection String

You'll see a connection string that looks like:
```
postgresql://username:password@ep-xxxx-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

**Copy this entire string** - you'll need it in the next step.

## Step 3: Update Your .env File

1. Open your `.env` file in the project
2. Find the line: `DATABASE_URL=postgresql://user:password@host/database?sslmode=require`
3. Replace it with your actual Neon connection string:
   ```
   DATABASE_URL=postgresql://your-actual-neon-connection-string-here
   ```
4. Save the file

## Step 4: Initialize Database Tables

Run this command to create all the tables:
```bash
npm run db:init
```

## Step 5: Restart Your Server

1. Stop your current server (Ctrl+C if it's running)
2. Start it again:
   ```bash
   npm run dev
   ```

## Step 6: Test Registration

Try registering a new account - it should work now!

---

**Note:** Make sure you're copying the connection string for the "production" branch (or whichever branch you want to use).


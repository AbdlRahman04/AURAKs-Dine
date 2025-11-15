# Setting Up a Replit Project Locally

Since you downloaded this project from Replit, there are a few things you need to know:

## What's Different from Replit

### ✅ What Works the Same
- All the code works exactly the same
- Same commands (`npm run dev`, etc.)
- Same project structure

### ⚠️ What You Need to Set Up

1. **Database** - Replit had a built-in database, but you need your own now
2. **Environment Variables** - Replit used "Secrets", you need a `.env` file
3. **Port Configuration** - Replit handled ports automatically, you'll use `localhost:5000`

## Step-by-Step Setup

### 1. Install Dependencies (if not already done)

```bash
npm install
```

### 2. Set Up Your Database

**Replit used a built-in PostgreSQL database. You need to set up your own:**

#### Option A: Use Neon (Recommended - Free)

1. Go to https://neon.tech
2. Sign up (free, no credit card)
3. Create a new project
4. Copy the connection string from the dashboard
5. It looks like: `postgresql://user:pass@ep-xxxx.neon.tech/dbname?sslmode=require`

#### Option B: Use Local PostgreSQL

If you have PostgreSQL installed:
```bash
createdb quickdineflow
```
Then use: `postgresql://your-username:password@localhost:5432/quickdineflow`

### 3. Update Your .env File

Open `.env` and update these values:

```env
# Database - Replace with your actual connection string
DATABASE_URL=postgresql://your-actual-connection-string-here

# Session Secret - Generate a random string
SESSION_SECRET=your-random-secret-here

# Stripe Keys - Get from https://dashboard.stripe.com/test/apikeys
STRIPE_SECRET_KEY=sk_test_your_key_here
VITE_STRIPE_PUBLIC_KEY=pk_test_your_key_here

# Port
PORT=5000
```

**Important:** 
- In Replit, these were stored as "Secrets"
- Now they need to be in your `.env` file
- Make sure `.env` is in `.gitignore` (don't commit it!)

### 4. Initialize Database Tables

Replit might have already created the tables, but you need to create them in your new database:

```bash
npm run db:init
```

### 5. Start the Server

```bash
npm run dev
```

Then open: **http://localhost:5000**

## Replit-Specific Features (Not Needed Locally)

These Replit features won't work locally, but the app will still function:

- ❌ Replit Auth (the app uses local email/password auth instead)
- ❌ Replit's built-in database
- ❌ Replit's port forwarding

**But these work fine:**
- ✅ Email/password registration and login
- ✅ All features of the app
- ✅ Local development

## Troubleshooting

### "Database table doesn't exist"
Run: `npm run db:init`

### "DATABASE_URL must be set"
Check your `.env` file has a real database connection string (not placeholder values)

### "Port already in use"
Change `PORT=5000` to a different number in `.env`

## Quick Checklist

- [ ] Installed dependencies (`npm install`)
- [ ] Created a database (Neon or local)
- [ ] Updated `.env` with real DATABASE_URL
- [ ] Updated `.env` with SESSION_SECRET
- [ ] Updated `.env` with Stripe keys
- [ ] Ran `npm run db:init` to create tables
- [ ] Started server with `npm run dev`
- [ ] Opened http://localhost:5000 in browser

## Need Help?

- See `SETUP_DATABASE.md` for detailed database setup
- See `README.md` for general setup instructions
- See `TROUBLESHOOTING.md` for common issues


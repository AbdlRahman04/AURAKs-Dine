# 🚀 Quick Fix: Use Local PostgreSQL for Development

## ✅ What I Fixed

I've updated `server/db.ts` to **automatically detect** whether you're using:
- **Neon** (cloud database) - Uses WebSocket driver
- **Local PostgreSQL** - Uses regular TCP driver

**You no longer need to change code!** Just change your `DATABASE_URL` in `.env`.

---

## 📋 Quick Setup (5 minutes)

### Step 1: Install PostgreSQL Locally (if not already installed)

**Windows:**
```powershell
# Using Chocolatey
choco install postgresql

# Or download from: https://www.postgresql.org/download/windows/
```

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Linux:**
```bash
sudo apt-get install postgresql
sudo service postgresql start
```

### Step 2: Create Local Database

```bash
# Create database
createdb quickdineflow

# Or using psql:
psql -U postgres
CREATE DATABASE quickdineflow;
\q
```

### Step 3: Update Your `.env` File

**For Local Development** (use this when testing locally):

```env
# Local PostgreSQL
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/quickdineflow
SESSION_SECRET=your-secret-key-here
STRIPE_SECRET_KEY=sk_test_your_key
VITE_STRIPE_PUBLIC_KEY=pk_test_your_key
PORT=5000
```

**Replace:**
- `postgres` with your PostgreSQL username (usually `postgres`)
- `yourpassword` with your PostgreSQL password (or remove `:yourpassword` if no password)

**For Production/Sharing** (keep Neon connection):

```env
# Neon Database
DATABASE_URL=postgresql://username:password@ep-xxxx.neon.tech/dbname?sslmode=require
SESSION_SECRET=your-secret-key-here
STRIPE_SECRET_KEY=sk_test_your_key
VITE_STRIPE_PUBLIC_KEY=pk_test_your_key
PORT=5000
```

### Step 4: Initialize Local Database

```bash
npm run db:init
```

This creates all the tables in your local database.

### Step 5: Start Development Server

```bash
npm run dev:separate
```

You should see:
```
[Database] Using local PostgreSQL driver
```

---

## 🔄 Switching Between Databases

### To Use Local PostgreSQL (Development)

1. Update `.env` with local connection string:
   ```env
   DATABASE_URL=postgresql://postgres:password@localhost:5432/quickdineflow
   ```

2. Restart server:
   ```bash
   npm run dev:separate
   ```

### To Use Neon (Production/Sharing)

1. Update `.env` with Neon connection string:
   ```env
   DATABASE_URL=postgresql://user:pass@ep-xxxx.neon.tech/dbname?sslmode=require
   ```

2. Restart server:
   ```bash
   npm run dev:separate
   ```

---

## 🎯 Why This Works

The updated `server/db.ts` automatically detects:
- **If `DATABASE_URL` contains `neon.tech`** → Uses Neon serverless driver
- **Otherwise** → Uses regular PostgreSQL driver (`pg`)

**No code changes needed!** Just change the connection string.

---

## 🐛 Troubleshooting

### "Connection timeout" Error

1. **Check PostgreSQL is running:**
   ```bash
   # Windows
   Get-Service postgresql*
   
   # macOS/Linux
   sudo service postgresql status
   ```

2. **Test connection:**
   ```bash
   psql postgresql://postgres:password@localhost:5432/quickdineflow
   ```

3. **Check port 5432 is not blocked** by firewall

### "Database does not exist"

```bash
createdb quickdineflow
npm run db:init
```

### "Password authentication failed"

1. Check your PostgreSQL password
2. Try without password (if configured):
   ```env
   DATABASE_URL=postgresql://postgres@localhost:5432/quickdineflow
   ```

### Still Getting Timeout?

1. **Verify PostgreSQL is listening:**
   ```bash
   # Windows
   netstat -an | findstr 5432
   
   # macOS/Linux
   netstat -an | grep 5432
   ```

2. **Check PostgreSQL config** (`postgresql.conf`):
   ```
   listen_addresses = 'localhost'
   port = 5432
   ```

---

## ✅ Benefits

- ✅ **Fast local development** - No network latency
- ✅ **Keep Neon for sharing** - Just change `.env` when deploying
- ✅ **No code changes** - Automatic detection
- ✅ **Data isolation** - Local dev data separate from production

---

## 📝 Pro Tip: Use `.env.local`

Create `.env.local` for local development:

```env
# .env.local (for local development only)
DATABASE_URL=postgresql://postgres:password@localhost:5432/quickdineflow
```

Then manually copy it to `.env` when developing locally, or use a tool like `dotenv-cli`:

```bash
npm install -g dotenv-cli
dotenv -e .env.local -- npm run dev:separate
```

Make sure `.env.local` is in `.gitignore`!

---

## 🎉 You're All Set!

Now you can:
- ✅ Develop locally with fast local PostgreSQL
- ✅ Deploy to Render with Neon (just update `.env`)
- ✅ Share with others using Neon
- ✅ Switch between them easily

**The connection timeout issue should be fixed!** 🚀


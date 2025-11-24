# 📚 How to Use Both Neon and Local PostgreSQL

## ✅ Current Setup (Already Done!)

Your `server/db.ts` is now **automatically configured** to use:
- **Neon** when `DATABASE_URL` contains `neon.tech`
- **Local PostgreSQL** when `DATABASE_URL` points to `localhost`

**You don't need to change any code!** Just switch your `.env` file.

---

## 🎯 Two Scenarios

### Scenario 1: Using Neon (For Sharing/Production)
### Scenario 2: Using Local PostgreSQL (For Development)

---

## 📋 Scenario 1: Using Neon (Sharing/Production)

### When to Use:
- ✅ Sharing with others
- ✅ Deploying to Render
- ✅ Production environment
- ✅ When you want cloud-hosted database

### Step-by-Step:

#### Step 1: Get Your Neon Connection String

1. Go to https://neon.tech
2. Log into your account
3. Select your project
4. Click **"Connect"** button
5. Select **"Pooled connection"** tab (important!)
6. Copy the connection string

It should look like:
```
postgresql://username:password@ep-xxxx-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

#### Step 2: Update `.env` File

Open your `.env` file and set:

```env
# Neon Database (for sharing/production)
DATABASE_URL=postgresql://username:password@ep-xxxx-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
SESSION_SECRET=your-secret-key-here
STRIPE_SECRET_KEY=sk_test_your_key
VITE_STRIPE_PUBLIC_KEY=pk_test_your_key
PORT=5000
```

**Replace the `DATABASE_URL` with your actual Neon connection string.**

#### Step 3: Start Your App

```bash
npm run dev:separate
```

You should see:
```
[Database] Using Neon serverless driver
```

#### Step 4: Verify It Works

1. Open http://localhost:5173
2. Try to login or register
3. It should work with your Neon database

---

## 📋 Scenario 2: Using Local PostgreSQL (Development)

### When to Use:
- ✅ Local development and testing
- ✅ Faster development (no network latency)
- ✅ Testing without affecting shared data
- ✅ Working offline

### Step-by-Step:

#### Step 1: Install PostgreSQL (If Not Already Installed)

**Windows:**
```powershell
# Option 1: Using Chocolatey
choco install postgresql

# Option 2: Download installer
# Go to: https://www.postgresql.org/download/windows/
```

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo service postgresql start
```

#### Step 2: Create Local Database

```bash
# Create database
createdb quickdineflow
```

**Or using psql:**
```bash
psql -U postgres
CREATE DATABASE quickdineflow;
\q
```

#### Step 3: Update `.env` File

Open your `.env` file and change `DATABASE_URL` to:

```env
# Local PostgreSQL (for development)
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/quickdineflow
SESSION_SECRET=your-secret-key-here
STRIPE_SECRET_KEY=sk_test_your_key
VITE_STRIPE_PUBLIC_KEY=pk_test_your_key
PORT=5000
```

**Important:** Replace:
- `postgres` with your PostgreSQL username (usually `postgres`)
- `yourpassword` with your PostgreSQL password
- If you don't have a password, use: `postgresql://postgres@localhost:5432/quickdineflow`

#### Step 4: Initialize Local Database

```bash
npm run db:init
```

This creates all the tables in your local database.

#### Step 5: Start Your App

```bash
npm run dev:separate
```

You should see:
```
[Database] Using local PostgreSQL driver
```

#### Step 6: Verify It Works

1. Open http://localhost:5173
2. Register a new account (this will be in your local database)
3. Login should work instantly (no network delay)

---

## 🔄 How to Switch Between Them

### Switch to Neon:

1. **Open `.env` file**
2. **Change `DATABASE_URL` to your Neon connection string:**
   ```env
   DATABASE_URL=postgresql://username:password@ep-xxxx.neon.tech/dbname?sslmode=require
   ```
3. **Save the file**
4. **Restart your server** (Ctrl+C, then `npm run dev:separate`)
5. **Check console** - Should say: `[Database] Using Neon serverless driver`

### Switch to Local PostgreSQL:

1. **Open `.env` file**
2. **Change `DATABASE_URL` to local connection:**
   ```env
   DATABASE_URL=postgresql://postgres:password@localhost:5432/quickdineflow
   ```
3. **Save the file**
4. **Restart your server** (Ctrl+C, then `npm run dev:separate`)
5. **Check console** - Should say: `[Database] Using local PostgreSQL driver`

---

## 💡 Pro Tips

### Tip 1: Use `.env.local` for Local Development

Create a `.env.local` file for local development:

```env
# .env.local (for local development only)
DATABASE_URL=postgresql://postgres:password@localhost:5432/quickdineflow
SESSION_SECRET=local-secret
STRIPE_SECRET_KEY=sk_test_your_key
VITE_STRIPE_PUBLIC_KEY=pk_test_your_key
PORT=5000
```

Then manually copy it to `.env` when developing locally, or use:

```bash
# Copy local config
cp .env.local .env
npm run dev:separate
```

### Tip 2: Keep Both Connection Strings Handy

Create a file `DATABASE_URLS.txt` (add to `.gitignore`):

```
# Neon (for sharing/production)
DATABASE_URL=postgresql://user:pass@ep-xxxx.neon.tech/dbname?sslmode=require

# Local (for development)
DATABASE_URL=postgresql://postgres:password@localhost:5432/quickdineflow
```

Then copy-paste the one you need into `.env`.

### Tip 3: Quick Check Which Database You're Using

Look at the console output when starting the server:
- `[Database] Using Neon serverless driver` → Using Neon
- `[Database] Using local PostgreSQL driver` → Using Local

---

## 🐛 Troubleshooting

### "Connection timeout" When Using Local

1. **Check PostgreSQL is running:**
   ```bash
   # Windows
   Get-Service postgresql*
   
   # macOS/Linux
   sudo service postgresql status
   ```

2. **Start PostgreSQL if not running:**
   ```bash
   # Windows (PowerShell as Admin)
   net start postgresql-x64-XX
   
   # macOS
   brew services start postgresql
   
   # Linux
   sudo service postgresql start
   ```

3. **Test connection:**
   ```bash
   psql postgresql://postgres:password@localhost:5432/quickdineflow
   ```

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

### Still Getting Timeout with Neon?

1. **Check your connection string** - Make sure it's the "Pooled connection" string
2. **Check internet connection**
3. **Verify Neon project is active** - Go to Neon dashboard

---

## 📊 Quick Reference Table

| What You Want | DATABASE_URL Should Be | Console Message |
|--------------|------------------------|-----------------|
| **Use Neon** | `postgresql://...@ep-xxxx.neon.tech/...` | `Using Neon serverless driver` |
| **Use Local** | `postgresql://...@localhost:5432/...` | `Using local PostgreSQL driver` |

---

## ✅ Summary

1. **For Neon (Sharing/Production):**
   - Use Neon connection string in `.env`
   - Restart server
   - See: `[Database] Using Neon serverless driver`

2. **For Local (Development):**
   - Use local connection string in `.env`
   - Run `npm run db:init` (first time only)
   - Restart server
   - See: `[Database] Using local PostgreSQL driver`

3. **To Switch:**
   - Just change `DATABASE_URL` in `.env`
   - Restart server
   - Done!

**No code changes needed!** The system automatically detects which database to use. 🚀


# Dual Database Setup: Neon (Production) + Local PostgreSQL (Development)

This guide shows you how to use **Neon for production/sharing** while using **local PostgreSQL for development**.

## 🎯 The Problem

- **Neon** uses WebSocket connections (serverless driver)
- **Local PostgreSQL** uses regular TCP connections
- Your `server/db.ts` is currently hardcoded to use Neon's serverless driver
- This causes connection timeouts when trying to use local PostgreSQL

## ✅ The Solution

We'll modify `server/db.ts` to automatically detect which database type to use based on the `DATABASE_URL`.

---

## 📋 Step-by-Step Setup

### Step 1: Install Regular PostgreSQL Driver (for Local)

```bash
npm install pg
npm install --save-dev @types/pg
```

### Step 2: Create `.env.local` for Local Development

Create a new file `.env.local` in your project root:

```env
# Local PostgreSQL Database
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/quickdineflow
SESSION_SECRET=your-local-secret-key
STRIPE_SECRET_KEY=sk_test_your_key
VITE_STRIPE_PUBLIC_KEY=pk_test_your_key
PORT=5000
```

**Note:** Replace `yourpassword` with your actual PostgreSQL password, or remove it if you don't have a password set.

### Step 3: Keep `.env` for Neon (Production/Sharing)

Your existing `.env` file should have:

```env
# Neon Database (for production/sharing)
DATABASE_URL=postgresql://username:password@ep-xxxx.neon.tech/dbname?sslmode=require
SESSION_SECRET=your-production-secret
STRIPE_SECRET_KEY=sk_test_your_key
VITE_STRIPE_PUBLIC_KEY=pk_test_your_key
PORT=5000
```

### Step 4: Update `server/db.ts` to Support Both

The updated file will automatically detect:
- **Neon**: If `DATABASE_URL` contains `neon.tech` or `neon.tech`
- **Local PostgreSQL**: Otherwise, use regular `pg` driver

### Step 5: Setup Local PostgreSQL Database

1. **Install PostgreSQL** (if not already installed):
   ```bash
   # Windows (Chocolatey)
   choco install postgresql
   
   # macOS (Homebrew)
   brew install postgresql
   
   # Linux (Ubuntu/Debian)
   sudo apt-get install postgresql
   ```

2. **Start PostgreSQL service**:
   ```bash
   # Windows (Services app or PowerShell)
   net start postgresql-x64-XX
   
   # macOS/Linux
   sudo service postgresql start
   # or
   brew services start postgresql
   ```

3. **Create database**:
   ```bash
   createdb quickdineflow
   ```

4. **Initialize tables**:
   ```bash
   npm run db:init
   ```

---

## 🚀 Usage

### For Local Development (Local PostgreSQL)

1. **Use `.env.local`**:
   ```bash
   # Copy .env.local to .env (or use a tool like dotenv-cli)
   cp .env.local .env
   ```

   Or use a package like `dotenv-cli`:
   ```bash
   npm install -g dotenv-cli
   dotenv -e .env.local -- npm run dev
   ```

2. **Start development**:
   ```bash
   npm run dev:separate
   ```

### For Production/Sharing (Neon)

1. **Use `.env` with Neon connection string**
2. **Deploy to Render** (or your hosting platform)
3. **Set environment variables** in Render dashboard

---

## 🔧 Alternative: Environment-Based Switching

You can also use an environment variable to explicitly choose:

```env
# In .env.local
USE_LOCAL_DB=true
DATABASE_URL=postgresql://postgres:password@localhost:5432/quickdineflow

# In .env (Neon)
USE_LOCAL_DB=false
DATABASE_URL=postgresql://user:pass@ep-xxxx.neon.tech/dbname?sslmode=require
```

---

## 📝 Quick Reference

| Environment | Database | File | Connection Type |
|------------|----------|------|----------------|
| **Local Dev** | Local PostgreSQL | `.env.local` | Regular TCP (`pg`) |
| **Production** | Neon | `.env` | WebSocket (`@neondatabase/serverless`) |
| **Render** | Neon | Environment Variables | WebSocket (`@neondatabase/serverless`) |

---

## 🐛 Troubleshooting

### "Connection timeout" on Local

1. **Check PostgreSQL is running**:
   ```bash
   # Windows
   Get-Service postgresql*
   
   # macOS/Linux
   sudo service postgresql status
   ```

2. **Verify connection string**:
   ```bash
   psql postgresql://postgres:password@localhost:5432/quickdineflow
   ```

3. **Check firewall** - PostgreSQL port 5432 should be open

### "Cannot find module 'pg'"

Run:
```bash
npm install pg @types/pg
```

### "Database does not exist"

Create it:
```bash
createdb quickdineflow
```

### Switching Between Databases

**To use local PostgreSQL:**
```bash
cp .env.local .env
npm run dev
```

**To use Neon:**
```bash
# Restore your Neon .env file
# Or set DATABASE_URL in environment
```

---

## 💡 Pro Tips

1. **Use `.gitignore`** to keep `.env.local` out of git:
   ```
   .env.local
   .env
   ```

2. **Create a script** to switch easily:
   ```json
   // package.json
   "scripts": {
     "dev:local": "dotenv -e .env.local -- npm run dev:separate",
     "dev:neon": "npm run dev:separate"
   }
   ```

3. **Document your setup** - Keep notes on which database you're using

---

## ✅ Benefits

- ✅ **Local development** is fast (no network latency)
- ✅ **Neon** for production/sharing (cloud-hosted, accessible)
- ✅ **No conflicts** - Each environment uses its own database
- ✅ **Easy switching** - Just change which `.env` file you use
- ✅ **Data isolation** - Local dev data doesn't affect production


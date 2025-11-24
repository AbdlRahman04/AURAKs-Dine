# 🔄 Database Switching - Quick Reference Card

## ✅ Current Status

Your system **automatically detects** which database to use based on your `DATABASE_URL`:
- Contains `neon.tech` → Uses Neon
- Points to `localhost` → Uses Local PostgreSQL

---

## 📝 Quick Procedures

### 🟦 Using Neon (For Sharing/Production)

```
1. Open .env file
2. Set DATABASE_URL to your Neon connection string:
   DATABASE_URL=postgresql://user:pass@ep-xxxx.neon.tech/dbname?sslmode=require
3. Save .env
4. Run: npm run dev:separate
5. Check console: Should say "Using Neon serverless driver"
```

### 🟩 Using Local PostgreSQL (For Development)

```
1. Make sure PostgreSQL is installed and running
2. Create database: createdb quickdineflow
3. Open .env file
4. Set DATABASE_URL to local connection:
   DATABASE_URL=postgresql://postgres:password@localhost:5432/quickdineflow
5. Save .env
6. Run: npm run db:init (first time only)
7. Run: npm run dev:separate
8. Check console: Should say "Using local PostgreSQL driver"
```

---

## 🔍 How to Know Which Database You're Using

**Check the console output when starting the server:**

```
[Database] Using Neon serverless driver     ← Using Neon
[Database] Using local PostgreSQL driver    ← Using Local
```

---

## ⚡ Quick Switch

**To switch from Neon to Local:**
1. Change `DATABASE_URL` in `.env` to local connection
2. Restart server (Ctrl+C, then `npm run dev:separate`)

**To switch from Local to Neon:**
1. Change `DATABASE_URL` in `.env` to Neon connection
2. Restart server (Ctrl+C, then `npm run dev:separate`)

---

## 📋 Connection String Templates

### Neon Template:
```env
DATABASE_URL=postgresql://username:password@ep-xxxx-xxxx.region.aws.neon.tech/dbname?sslmode=require
```

### Local Template:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/quickdineflow
```

---

## 🎯 When to Use Which?

| Use Neon When: | Use Local When: |
|----------------|-----------------|
| ✅ Sharing with others | ✅ Local development |
| ✅ Deploying to Render | ✅ Testing features |
| ✅ Production | ✅ Working offline |
| ✅ Need cloud access | ✅ Want faster speed |

---

## 🚨 Common Issues

**Connection Timeout:**
- Check PostgreSQL is running (for local)
- Verify connection string is correct
- Check internet connection (for Neon)

**"Database does not exist":**
```bash
createdb quickdineflow
npm run db:init
```

**Wrong driver message:**
- Check your `DATABASE_URL` contains `neon.tech` for Neon
- Check your `DATABASE_URL` contains `localhost` for local

---

## 💾 Save Your Connection Strings

Create a file `my-connection-strings.txt` (add to `.gitignore`):

```
=== NEON (Production/Sharing) ===
DATABASE_URL=postgresql://your-neon-connection-string-here

=== LOCAL (Development) ===
DATABASE_URL=postgresql://postgres:password@localhost:5432/quickdineflow
```

Then copy-paste into `.env` when needed!

---

**That's it! Just change `.env` and restart. No code changes needed!** 🚀


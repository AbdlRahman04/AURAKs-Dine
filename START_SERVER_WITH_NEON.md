# 🚀 Start Server with Neon Database - Step by Step

## ✅ What I Fixed

I've updated `server/db.ts` to properly work with both Neon and local PostgreSQL. The code now automatically detects which database you're using.

---

## 📋 Step-by-Step Instructions

### Step 1: Verify Your `.env` File

Open your `.env` file and make sure it has your **Neon connection string**:

```env
DATABASE_URL=postgresql://username:password@ep-xxxx-xxxx.region.aws.neon.tech/dbname?sslmode=require
SESSION_SECRET=your-secret-key-here
STRIPE_SECRET_KEY=sk_test_your_key
VITE_STRIPE_PUBLIC_KEY=pk_test_your_key
PORT=5000
```

**Important:** 
- Make sure `DATABASE_URL` contains `neon.tech` (this tells the system to use Neon)
- Use the **"Pooled connection"** string from Neon dashboard (not "Direct connection")

### Step 2: Get Your Neon Connection String (If Needed)

If you don't have your Neon connection string:

1. Go to https://neon.tech
2. Log into your account
3. Select your project
4. Click **"Connect"** button
5. Select **"Pooled connection"** tab (important!)
6. Copy the connection string
7. Paste it into your `.env` file as `DATABASE_URL`

### Step 3: Install Dependencies (If Needed)

```bash
npm install
```

### Step 4: Start the Server

Open your terminal in the project directory and run:

```bash
npm run dev:separate
```

This will start:
- **Backend** on `http://localhost:5000`
- **Frontend** on `http://localhost:5173`

### Step 5: Check Console Output

You should see:

```
[Database] Using Neon serverless driver
[Stripe] Using key starting with: sk_test ...
serving on port 5000
VITE v5.x.x  ready in xxx ms
  ➜  Local:   http://localhost:5173/
```

**If you see `[Database] Using local PostgreSQL driver` instead**, it means your `DATABASE_URL` doesn't contain `neon.tech`. Check your `.env` file.

### Step 6: Test Login

1. Open your browser: http://localhost:5173
2. Try to login with your existing account
3. It should work with your Neon database (all your saved data)

---

## 🐛 Troubleshooting

### "Connection timeout" Error

**Possible causes:**
1. **Wrong connection string** - Make sure you're using the "Pooled connection" string from Neon
2. **Internet connection** - Check your internet
3. **Neon project paused** - Go to Neon dashboard and make sure project is active

**Fix:**
- Go to Neon dashboard
- Get a fresh "Pooled connection" string
- Update `.env` file
- Restart server

### "DATABASE_URL must be set" Error

**Fix:**
- Make sure `.env` file exists in project root
- Make sure `DATABASE_URL` is in the file
- Restart server

### "Using local PostgreSQL driver" (But you want Neon)

**Fix:**
- Check your `DATABASE_URL` in `.env`
- Make sure it contains `neon.tech`
- Should look like: `postgresql://...@ep-xxxx.neon.tech/...`
- Restart server

### Server Won't Start

**Check:**
1. Port 5000 is not in use (backend)
2. Port 5173 is not in use (frontend)
3. All dependencies installed (`npm install`)

**Fix:**
```bash
# Kill processes on ports (if needed)
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill
```

---

## ✅ Verification Checklist

- [ ] `.env` file exists in project root
- [ ] `DATABASE_URL` contains `neon.tech`
- [ ] `SESSION_SECRET` is set
- [ ] Dependencies installed (`npm install`)
- [ ] Server starts without errors
- [ ] Console shows: `[Database] Using Neon serverless driver`
- [ ] Can access http://localhost:5173
- [ ] Login works with existing account

---

## 🎯 Quick Commands Reference

```bash
# Start server (frontend + backend)
npm run dev:separate

# Start backend only
npm run dev:backend

# Start frontend only
npm run dev:frontend

# Initialize database (if needed)
npm run db:init

# Make user admin
npm run make-admin -- user@example.com
```

---

## 📝 What Happens When You Start

1. **Backend starts** on port 5000
   - Connects to Neon database
   - Sets up API routes
   - Handles authentication

2. **Frontend starts** on port 5173
   - React app loads
   - Proxies `/api` requests to backend
   - You can login/register

3. **Database connection**
   - Automatically detects Neon (because `DATABASE_URL` contains `neon.tech`)
   - Uses Neon serverless driver
   - All your saved data is accessible

---

## 🎉 You're All Set!

Once you see `[Database] Using Neon serverless driver` in the console, everything is working! Your login and all saved data will be from your Neon database.

**If you still have issues, check the console output and let me know what error you see!**


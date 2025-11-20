# 🚀 Local Development Guide - Run App Locally (No GitHub/Render)

This guide shows you how to run QuickDineFlow completely on your local machine for frontend and backend development, including login functionality.

## ✅ Quick Start (Recommended)

This is the easiest way to run everything locally:

### Step 1: Make sure you have a `.env` file

Create a `.env` file in the root directory with your database connection:

```bash
# Copy from .env.example if it exists, or create new
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
SESSION_SECRET=your-random-secret-key-here
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key
PORT=5000
```

### Step 2: Run the app in separate mode

Open a terminal in the project directory and run:

```bash
npm run dev:separate
```

This command will:
- ✅ Start the **backend server** on `http://localhost:5000` (handles login, API)
- ✅ Start the **frontend** on `http://localhost:5173` (React app)

### Step 3: Access the application

- **Frontend**: Open your browser and go to `http://localhost:5173`
- **Backend API**: The frontend automatically proxies API requests to `http://localhost:5000`

You can now:
- Browse the menu
- Register/Login (authentication works!)
- Place orders
- Access admin features

---

## 📋 Alternative Methods

### Option 1: Run Frontend and Backend Separately (Two Terminals)

If you prefer more control or want to see separate logs:

**Terminal 1 - Backend:**
```bash
npm run dev:backend
```
This starts only the backend on port 5000.

**Terminal 2 - Frontend:**
```bash
npm run dev:frontend
```
This starts only the frontend on port 5173.

### Option 2: Integrated Mode (Single Port)

Run everything on one port (backend serves the frontend):

```bash
npm run dev
```

Then access: `http://localhost:5000`

---

## 🔧 Configuration Details

### How It Works

1. **Frontend (Port 5173)**:
   - React app built with Vite
   - Proxies all `/api/*` requests to `http://localhost:5000`
   - Serves the UI to your browser

2. **Backend (Port 5000)**:
   - Express.js server
   - Handles all API routes (`/api/auth/login`, `/api/orders`, etc.)
   - Connects to your PostgreSQL database
   - Manages authentication sessions

### Environment Variables Required

Make sure your `.env` file includes:

- `DATABASE_URL` - Your PostgreSQL connection string
- `SESSION_SECRET` - A random string for session encryption
- `PORT` - Backend port (default: 5000)
- `STRIPE_SECRET_KEY` - For payment processing (test keys work)
- `VITE_STRIPE_PUBLIC_KEY` - Stripe public key

---

## 🎯 Testing Login Functionality

### 1. Create a Test User

If you don't have a user account yet:

1. Go to `http://localhost:5173`
2. Click "Register" 
3. Fill in the registration form
4. Submit to create your account

### 2. Login

1. Go to `http://localhost:5173/login`
2. Enter your email and password
3. You should be redirected to the menu page

### 3. Check Admin Access

To make a user an admin, run:
```bash
npm run make-admin <email>
```

Then login with that email to access admin features.

---

## 🐛 Troubleshooting

### "Port 5000 already in use"
- Another application is using port 5000
- Change `PORT=5000` to `PORT=3001` (or any other port) in your `.env`
- **Important**: Also update the Vite proxy in `vite.config.ts`:
  ```typescript
  '/api': {
    target: 'http://localhost:3001',  // Change to match your PORT
    changeOrigin: true,
  }
  ```

### "Port 5173 already in use"
- Another Vite dev server is running
- Kill the process using port 5173, or change it in `vite.config.ts`

### "Cannot connect to database"
- Check your `DATABASE_URL` in `.env`
- Make sure your database is accessible
- Verify SSL settings if required

### "Login not working"
- Make sure both frontend and backend are running
- Check browser console for errors
- Verify backend is receiving requests (check terminal logs)
- Ensure `SESSION_SECRET` is set in `.env`

---

## 📝 Development Tips

1. **Keep both terminals open**: The `dev:separate` command runs both, but you can also run them separately for clearer logs

2. **Hot Reload**: Both frontend and backend support hot reloading - changes will auto-refresh

3. **Database Changes**: After changing the schema, run:
   ```bash
   npm run db:push
   ```

4. **Clear Sessions**: If you have login issues, clear your browser cookies for `localhost`

---

## 🎉 That's It!

You now have a fully functional local development environment without needing:
- ❌ GitHub pushes
- ❌ Render deployments
- ❌ External services (except database)

Everything runs on your local machine! 🚀


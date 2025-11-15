# Quick Installation Guide - New Laptop Setup

## ⚡ Quick Setup (5-10 minutes)

### 1. Install Node.js
- Download from: https://nodejs.org/ (LTS version)
- Verify: `node --version` and `npm --version`

### 2. Copy Project Files
- Copy entire `QuickDineFlow` folder to new laptop
- Or clone from GitHub if you have a repository

### 3. Install Dependencies
```bash
cd QuickDineFlow
npm install
```

### 4. Set Up Neon Database
- Go to https://neon.tech
- Sign up (free)
- Create new project
- Copy connection string from "Connect" button

### 5. Create `.env` File
Create `.env` in project root with:
```env
DATABASE_URL=postgresql://your-neon-connection-string-here
SESSION_SECRET=your-random-secret-32-chars-minimum
STRIPE_SECRET_KEY=sk_test_your_key_here
VITE_STRIPE_PUBLIC_KEY=pk_test_your_key_here
PORT=5000
```

**Get Stripe keys from:** https://dashboard.stripe.com/test/apikeys

### 6. Initialize Database
```bash
npm run db:init
npm run db:seed
```

### 7. Start Server
```bash
npm run dev
```

### 8. Open Browser
Go to: **http://localhost:5000**

## ✅ Done!

See `INSTALLATION_GUIDE.md` for detailed instructions.


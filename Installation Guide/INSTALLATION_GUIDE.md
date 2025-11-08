# Complete Installation Guide - QuickDineFlow

This guide will help you set up the QuickDineFlow website on a new laptop from scratch.

## 📋 Prerequisites

Before you begin, make sure you have:

1. **Node.js** (version 18 or higher)
   - Download from: https://nodejs.org/
   - Choose the LTS (Long Term Support) version
   - This includes npm automatically

2. **A code editor** (optional but recommended)
   - Visual Studio Code: https://code.visualstudio.com/
   - Or any text editor you prefer

3. **Git** (if you're cloning from GitHub)
   - Download from: https://git-scm.com/

## 📁 Files Needed

You need the entire project folder. Here's what should be included:

### Essential Files and Folders:
```
QuickDineFlow/
├── client/              # Frontend React application
├── server/              # Backend Express server
├── shared/              # Shared TypeScript schemas
├── package.json         # Project dependencies and scripts
├── package-lock.json    # Locked dependency versions
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Vite build configuration
├── tailwind.config.ts   # Tailwind CSS configuration
├── drizzle.config.ts    # Database ORM configuration
└── .env                 # Environment variables (you'll create this)
```

### Important Note:
- **DO NOT** share or commit the `.env` file (it contains secrets)
- The `.env.example` file is a template you can use

## 🚀 Step-by-Step Installation

### Step 1: Transfer Project Files

**Option A: From GitHub**
```bash
git clone <your-repository-url>
cd QuickDineFlow
```

**Option B: Copy Project Folder**
- Copy the entire `QuickDineFlow` folder to your new laptop
- Place it in a location like: `C:\Users\YourName\Documents\QuickDineFlow`

### Step 2: Install Node.js

1. Go to https://nodejs.org/
2. Download the LTS version (recommended)
3. Run the installer
4. Verify installation:
   ```bash
   node --version
   npm --version
   ```
   You should see version numbers (e.g., node v22.17.1, npm v10.9.2)

### Step 3: Install Project Dependencies

1. Open terminal/command prompt in the project folder
2. Navigate to the project directory:
   ```bash
   cd path\to\QuickDineFlow
   ```
3. Install all dependencies:
   ```bash
   npm install
   ```
   This will take a few minutes. It downloads all required packages.

### Step 4: Set Up Neon Database

**Yes, you need to use Neon website!** The database is hosted on Neon, not locally.

1. **Create a Neon Account** (if you don't have one):
   - Go to https://neon.tech
   - Sign up for a free account
   - No credit card required

2. **Create a New Project**:
   - Click "Create Project"
   - Choose a project name (e.g., "QuickDineFlow")
   - Select a region closest to you
   - Click "Create Project"

3. **Get Your Connection String**:
   - In your Neon dashboard, click "Connect" button
   - Select "Connection string" or "URI"
   - Copy the connection string
   - It looks like: `postgresql://user:password@ep-xxx.neon.tech/dbname?sslmode=require`

4. **Important**: Save this connection string - you'll need it in the next step!

### Step 5: Set Up Environment Variables

1. **Create `.env` file** in the project root:
   - If `.env.example` exists, copy it:
     ```bash
     # Windows PowerShell
     Copy-Item .env.example .env
     
     # Mac/Linux
     cp .env.example .env
     ```
   - Or create a new file named `.env`

2. **Open `.env` file** in a text editor and fill in:

   ```env
   # Database Connection (from Neon)
   DATABASE_URL=postgresql://your-actual-neon-connection-string-here
   
   # Session Secret (generate a random string)
   SESSION_SECRET=your-random-secret-string-here-minimum-32-characters
   
   # Stripe Keys (get from https://dashboard.stripe.com/test/apikeys)
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
   VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key_here
   
   # Server Port (optional, defaults to 5000)
   PORT=5000
   ```

3. **How to get each value**:

   **DATABASE_URL**: 
   - From Neon dashboard (Step 4)
   - Paste the entire connection string

   **SESSION_SECRET**: 
   - Generate a random string (at least 32 characters)
   - You can use: https://randomkeygen.com/
   - Or run: `openssl rand -base64 32` (if you have OpenSSL)
   - Or just use a long random string like: `my-super-secret-key-12345-abcdef-xyz`

   **STRIPE_SECRET_KEY & VITE_STRIPE_PUBLIC_KEY**:
   - Go to https://stripe.com and sign up (free)
   - Go to Dashboard → Developers → API keys
   - Copy the "Publishable key" (starts with `pk_test_`)
   - Copy the "Secret key" (starts with `sk_test_`)
   - Use test keys for development

   **PORT**: 
   - Leave as `5000` (or change if port 5000 is in use)

### Step 6: Initialize Database Tables

Run this command to create all necessary database tables:

```bash
npm run db:init
```

You should see:
```
Initializing database...
✓ Database tables created successfully!
Database initialization complete!
```

### Step 7: Populate Menu Items (Optional but Recommended)

Add sample menu items to your database:

```bash
npm run db:seed
```

You should see:
```
Seeding database...
Database seeded successfully with AED prices and UAE/Middle Eastern menu items!
```

### Step 8: Start the Development Server

Run the development server:

```bash
npm run dev
```

You should see output like:
```
[Stripe] Using key starting with: sk_test ...
serving on port 5000
```

### Step 9: Access the Website

1. Open your web browser
2. Go to: **http://localhost:5000**
3. You should see the QuickDineFlow website!

## ✅ Verification Checklist

After installation, verify everything works:

- [ ] Node.js and npm are installed (`node --version`, `npm --version`)
- [ ] Dependencies are installed (`node_modules` folder exists)
- [ ] `.env` file exists with all required variables
- [ ] Database tables are created (`npm run db:init` succeeded)
- [ ] Menu items are populated (`npm run db:seed` succeeded)
- [ ] Server starts without errors (`npm run dev`)
- [ ] Website loads in browser (http://localhost:5000)
- [ ] Can register a new account
- [ ] Can see menu items

## 🔄 Quick Start Commands Summary

Here are all the commands you need, in order:

```bash
# 1. Navigate to project folder
cd path\to\QuickDineFlow

# 2. Install dependencies
npm install

# 3. Create .env file (copy from .env.example or create manually)
# Then edit .env and add your values

# 4. Initialize database tables
npm run db:init

# 5. Populate menu items (optional)
npm run db:seed

# 6. Start the server
npm run dev

# 7. Open browser to http://localhost:5000
```

## 📝 Important Notes

### About Neon Database

- **Yes, you MUST use Neon website** - the database is cloud-hosted
- Your data is stored on Neon's servers, not locally
- The connection string connects your app to the cloud database
- Free tier is sufficient for development and testing
- Multiple laptops can use the same Neon database (share the connection string)

### About Environment Variables

- **Never commit `.env` to Git** - it contains secrets
- Each developer/laptop needs its own `.env` file
- You can share `.env.example` (it has no secrets)
- If you lose your `.env`, you'll need to recreate it

### About Stripe Keys

- Use **test keys** (start with `sk_test_` and `pk_test_`) for development
- Test keys don't charge real money
- Get them from: https://dashboard.stripe.com/test/apikeys
- For production, you'll need live keys (requires Stripe account verification)

## 🐛 Troubleshooting

### "npm: command not found"
- Node.js is not installed or not in PATH
- Reinstall Node.js from https://nodejs.org/

### "DATABASE_URL must be set"
- Check your `.env` file exists
- Verify DATABASE_URL has a real Neon connection string
- Make sure there are no spaces around the `=` sign

### "Port 5000 already in use"
- Another application is using port 5000
- Change `PORT=5000` to `PORT=3000` in `.env` file
- Or stop the other application

### "Cannot find module"
- Dependencies not installed
- Run `npm install` again
- Delete `node_modules` folder and `package-lock.json`, then run `npm install`

### "Database table doesn't exist"
- Run `npm run db:init` to create tables

### "Menu is empty"
- Run `npm run db:seed` to add sample menu items

## 📚 Additional Resources

- **Neon Documentation**: https://neon.tech/docs
- **Stripe Test Cards**: https://stripe.com/docs/testing
- **Node.js Documentation**: https://nodejs.org/docs

## 🎯 Summary

**What you need:**
1. Node.js installed
2. Project files (entire folder)
3. Neon database account (free)
4. Stripe account (free, for test keys)
5. `.env` file with all variables set

**Commands to run:**
```bash
npm install          # Install dependencies
npm run db:init      # Create database tables
npm run db:seed      # Add menu items (optional)
npm run dev          # Start server
```

**Access:** http://localhost:5000

That's it! Your website should be running! 🎉


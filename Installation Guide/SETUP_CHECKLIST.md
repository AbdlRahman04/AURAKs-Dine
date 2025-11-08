# Setup Checklist - New Laptop Installation

Use this checklist to ensure you have everything set up correctly.

## Pre-Installation

- [ ] Node.js installed (version 18+)
  - Check: `node --version`
  - Download: https://nodejs.org/

- [ ] Project files copied to new laptop
  - Entire `QuickDineFlow` folder
  - Or cloned from GitHub

## Installation Steps

- [ ] Opened terminal/command prompt in project folder
- [ ] Ran `npm install` (completed successfully)
- [ ] `node_modules` folder exists

## Database Setup (Neon)

- [ ] Created Neon account at https://neon.tech
- [ ] Created new project in Neon
- [ ] Copied connection string from Neon dashboard
- [ ] Connection string starts with `postgresql://`

## Environment Variables (.env file)

- [ ] Created `.env` file in project root
- [ ] Added `DATABASE_URL` with Neon connection string
- [ ] Added `SESSION_SECRET` (random string, 32+ characters)
- [ ] Added `STRIPE_SECRET_KEY` (from Stripe dashboard)
- [ ] Added `VITE_STRIPE_PUBLIC_KEY` (from Stripe dashboard)
- [ ] Added `PORT=5000` (or different port if needed)

## Database Initialization

- [ ] Ran `npm run db:init` successfully
- [ ] Saw "Database tables created successfully!" message
- [ ] Ran `npm run db:seed` successfully (optional but recommended)
- [ ] Saw "Database seeded successfully!" message

## Stripe Setup

- [ ] Created Stripe account at https://stripe.com
- [ ] Got test API keys from dashboard
- [ ] Added keys to `.env` file

## Starting the Server

- [ ] Ran `npm run dev`
- [ ] Server started without errors
- [ ] Saw "serving on port 5000" message
- [ ] No port conflicts

## Testing the Website

- [ ] Opened browser to http://localhost:5000
- [ ] Website loads successfully
- [ ] Can see the landing/login page
- [ ] Can register a new account
- [ ] Can log in
- [ ] Can see menu items
- [ ] Can add items to cart
- [ ] Can proceed to checkout

## Troubleshooting (if needed)

- [ ] Checked Node.js version
- [ ] Verified `.env` file exists and has all variables
- [ ] Verified DATABASE_URL is correct (not placeholder)
- [ ] Checked port 5000 is not in use
- [ ] Verified database tables exist (ran `npm run db:init`)
- [ ] Verified menu items exist (ran `npm run db:seed`)

## ✅ All Done!

If all items are checked, your website is ready to use!

---

**Need help?** See `INSTALLATION_GUIDE.md` for detailed instructions.


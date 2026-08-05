# QuickDineFlow - Smart Ordering System

A web-based cafeteria ordering system that enables students to pre-order meals online, skip queues, and pick up orders at their convenience. The system features dual interfaces: a student-facing menu browsing and ordering system, and an admin panel for kitchen staff to manage menu items and track orders.

## 🚀 How to Run Locally

Follow these steps to get QuickDineFlow running on your machine. The same codebase works with **local PostgreSQL** (dev) and **Render Postgres** (deploy)—you only change `DATABASE_URL`.

### Prerequisites

Make sure you have the following ready before you begin:

| Requirement | Details |
|---|---|
| **Node.js** (v18+) | Download from [nodejs.org](https://nodejs.org/) — this includes npm automatically |
| **PostgreSQL Database** | Install [PostgreSQL](https://www.postgresql.org/download/) locally for dev; use **Render Postgres** (or Neon) for cloud deploy |
| **Stripe Account** | Sign up free at [stripe.com](https://stripe.com) and grab your test API keys from the [dashboard](https://dashboard.stripe.com/test/apikeys) |

---

### Step 1 — Navigate to the Project Directory

Open a terminal (PowerShell on Windows, Terminal on Mac/Linux) and `cd` into the project folder:

```bash
# Example — adjust the path to wherever you cloned/downloaded the project
cd path/to/QuickDineFlow
```

---

### Step 2 — Install Dependencies

Install all required packages via npm:

```bash
npm install
```

> This may take a few minutes the first time. Packages live in `node_modules/` (Node.js does not use a Python `venv`).

---

### Step 3 — Configure Environment Variables

1. **Copy the example `.env` file:**

   ```bash
   # Windows (PowerShell)
   Copy-Item .env.example .env

   # Mac / Linux
   cp .env.example .env
   ```

2. **Open `.env` in a text editor** and fill in your non-database values:

   | Variable | What to put | Where to get it |
   |---|---|---|
   | `SESSION_SECRET` | Any long random string | Run `openssl rand -base64 32` or make one up |
   | `STRIPE_SECRET_KEY` | Starts with `sk_test_...` | [Stripe API Keys](https://dashboard.stripe.com/test/apikeys) |
   | `VITE_STRIPE_PUBLIC_KEY` | Starts with `pk_test_...` | Same Stripe page |
   | `PORT` | Server port (default `5000`) | Leave as-is unless it conflicts |

3. **Choose a database** (Option A or Option B below) and set `DATABASE_URL`.

> **Tip:** Put a local URL in `.env.local` so it overrides `.env`. That way you can keep a Neon URL in `.env` for deployment without swapping files.

---

### Step 4 — Database Setup

#### Option A: Local PostgreSQL (development)

1. Install PostgreSQL and make sure the service is running (Windows: check Services for `postgresql`).
2. Create the app database and apply schema + seed data:

   ```bash
   # Creates the "quickdineflow" database if it does not exist
   npm run db:setup-local
   ```

3. Create `.env.local` with your local connection string (adjust user/password if needed):

   ```env
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/quickdineflow
   ```

4. Push schema and seed (admin user + menu items):

   ```bash
   npm run db:setup
   ```

   Or run the full local flow in one go (after `.env.local` exists):

   ```bash
   npm run db:setup-local-full
   ```

#### Option B: Render Postgres (cloud deploy)

1. Push to GitHub and create a Render Blueprint from [`render.yaml`](render.yaml).
2. Set Stripe keys on the Render service (see [`docs/RENDER_DEPLOY.md`](docs/RENDER_DEPLOY.md)).
3. After deploy, run `npm run db:setup` in the Render shell.
4. Optionally promote local menu content with `npm run pack:import`.

#### Option C: Neon (optional)

1. Create a project at [neon.tech](https://neon.tech).
2. Copy the **pooled** connection string.
3. Set it in `.env`, then `npm run db:setup`.

The app auto-detects Neon vs standard Postgres from the URL. Prefer **local Postgres** for day-to-day testing and **Render Postgres** for deployment.

---

### Step 5 — Run the Website

Start the development server:

```bash
npm run dev
```

Then open your browser and go to **http://localhost:5000** — you should see QuickDineFlow! 🎉

#### Alternative: Separate Frontend & Backend

If you prefer to run them on separate ports (useful for frontend development):

```bash
npm run dev:separate
```

The frontend will be at **http://localhost:5173** and the backend at **http://localhost:5000**.

## 📱 Install QuickDineFlow like a Native App

QuickDineFlow now ships as a Progressive Web App (PWA). After running the app locally or in production:

1. Open the site in Chrome, Edge, Safari, or any modern mobile browser.
2. Look for the **"Install"** / **"Add to Home Screen"** prompt in the address bar menu.
3. Confirm the prompt, and the app will appear on your desktop or mobile home screen with offline support.

### Offline Support & Caching

- Core shell assets (HTML, manifest, favicon, and icons) are pre-cached, so the installer always loads instantly.
- Dynamic requests fall back to cached responses if the network drops, and navigation requests fall back to the cached shell.
- To clear cached data, remove the app from your device or clear the browser storage for the site.

## 📖 What You Can Do

### As a Student:
- Browse the menu
- Add items to your cart
- Place orders
- View your order history
- Save favorite items

### As an Admin:
- Manage menu items
- View and update orders
- Track kitchen display
- View analytics

> **Test Admin Credentials:**  
> Email: `admin@quickdine.com`  
> Password: `admin`

## 🛠️ Troubleshooting

### "Cannot find module" error
- Make sure you ran `npm install` first
- Delete the `node_modules` folder and `package-lock.json`, then run `npm install` again

### "DATABASE_URL must be set" error
- Make sure you created a `.env` file (and/or `.env.local`) in the root directory
- Check that `DATABASE_URL` is set correctly for local Postgres or Neon

### "Port already in use" error
- Another program might be using port 5000 or 5173
- Change the `PORT` value in your `.env` file to a different number (like 3000 or 8000)

### Website won't load
- Make sure the server is running (you should see messages in the terminal)
- Check that you're using the correct URL (http://localhost:5000 or http://localhost:5173)
- Make sure your browser isn't blocking localhost

### Database connection errors
- Verify your `DATABASE_URL` is correct
- For local Postgres: ensure the service is running and credentials match
- For Neon: use the **pooled** connection string with `sslmode=require`
- Make sure your database is accessible (not blocked by firewall)

## 📚 Additional Resources

- **Development Guide**: See [`docs/DEVELOPMENT_GUIDE.md`](docs/DEVELOPMENT_GUIDE.md) for local workflow and feature modules
- **Render Deploy**: See [`docs/RENDER_DEPLOY.md`](docs/RENDER_DEPLOY.md) for GitHub → Render + Postgres
- **AI Feature Prompt**: See [`docs/FEATURE_DEVELOPMENT_PROMPT.md`](docs/FEATURE_DEVELOPMENT_PROMPT.md) for plug-and-play feature work

## 🎯 Available Commands

- `npm run dev` - Start the development server (integrated mode)
- `npm run dev:separate` - Start frontend and backend separately
- `npm run build` - Build the project for production
- `npm run start` - Start the production server
- `npm run check` - Check TypeScript types
- `npm run db:push` - Push schema from feature schemas via Drizzle
- `npm run db:seed` - Seed admin user and menu items (safe to re-run)
- `npm run db:setup` - Run `db:push` then `db:seed` (works for local or Render Postgres)
- `npm run db:setup-local` - Create the local `quickdineflow` database
- `npm run db:setup-local-full` - Create local DB, then push + seed
- `npm run smoke` - Smoke-test health, menu, and admin login
- `npm run pack:export -- menu` - Export menu pack for staging
- `npm run pack:import -- menu --file exports/menu-v1.0.0.json` - Import menu pack
- `npm run make-admin` - Promote an existing user to admin by email

## 💡 Tips for Beginners

1. **Keep the terminal open**: The server needs to keep running. Don't close the terminal window while using the website.

2. **Check the terminal for errors**: If something doesn't work, look at the terminal output - it usually shows helpful error messages.

3. **Use test Stripe keys**: When developing, use Stripe's test keys (they start with `sk_test_` and `pk_test_`). These won't charge real money.

4. **Database setup**: Use local PostgreSQL for day-to-day development. Deploy to Render with Postgres via `render.yaml` (see docs).

5. **Feature modules**: Backend features live under `features/` with pack export/import for menu content. See [`docs/DEVELOPMENT_GUIDE.md`](docs/DEVELOPMENT_GUIDE.md).

6. **Hot reload**: When you make changes to the code, the website will automatically refresh in your browser.

## 📝 Notes

- The website runs on your local computer only (localhost) - it's not accessible from the internet
- To deploy online, push to GitHub and use Render (see [`docs/RENDER_DEPLOY.md`](docs/RENDER_DEPLOY.md))
- This is a development version - for production use, you'll need additional security configurations

## 📷 Local Menu Photos

- Place all food/drink photos in `client/public/menu-images/`
- Reference them from the admin form using a leading slash, e.g. `/menu-images/iced-latte.jpg`
- Avoid spaces in filenames (use `arabic-coffee.jpg`) or URL-encode them (`Arabic%20Coffee.jpg`)
- Files inside `public/` are copied to the final build, so these paths work in dev and production
- Follow the design guideline recommendation of ~400×300 px (4:3) and keep file sizes optimized
- You can still paste full URLs if you want to mix hosted and local images

## 🤝 Getting Help

If you encounter issues:
1. Check the error messages in your terminal
2. Review the troubleshooting section above
3. Check that all environment variables are set correctly
4. Make sure all dependencies are installed

---

**Happy coding! 🎉**

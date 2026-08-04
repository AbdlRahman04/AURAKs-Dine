# QuickDineFlow - Smart Ordering System

A web-based cafeteria ordering system that enables students to pre-order meals online, skip queues, and pick up orders at their convenience. The system features dual interfaces: a student-facing menu browsing and ordering system, and an admin panel for kitchen staff to manage menu items and track orders.

## 🚀 How to Run Locally

Follow these steps to get QuickDineFlow running on your machine.

### Prerequisites

Make sure you have the following ready before you begin:

| Requirement | Details |
|---|---|
| **Node.js** (v18+) | Download from [nodejs.org](https://nodejs.org/) — this includes npm automatically |
| **PostgreSQL Database** | Use a free cloud DB from [Neon](https://neon.tech) or any PostgreSQL provider. You'll need the connection string |
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

> This may take a few minutes the first time.

---

### Step 3 — Configure Environment Variables

1. **Copy the example `.env` file:**

   ```bash
   # Windows (PowerShell)
   Copy-Item .env.example .env

   # Mac / Linux
   cp .env.example .env
   ```

2. **Open `.env` in a text editor** and fill in your values:

   | Variable | What to put | Where to get it |
   |---|---|---|
   | `DATABASE_URL` | Your PostgreSQL connection string | Neon dashboard or your DB provider |
   | `SESSION_SECRET` | Any long random string | Run `openssl rand -base64 32` or make one up |
   | `STRIPE_SECRET_KEY` | Starts with `sk_test_...` | [Stripe API Keys](https://dashboard.stripe.com/test/apikeys) |
   | `VITE_STRIPE_PUBLIC_KEY` | Starts with `pk_test_...` | Same Stripe page |
   | `PORT` | Server port (default `5000`) | Leave as-is unless it conflicts |

---

### Step 4 — Initialize the Database

Push the database schema and seed it with initial data:

```bash
# Create the database tables
npm run db:push

# Seed with starter menu items (optional but recommended)
npm run db:seed
```

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
2. Look for the **“Install”** / **“Add to Home Screen”** prompt in the address bar menu.
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

## 🛠️ Troubleshooting

### "Cannot find module" error
- Make sure you ran `npm install` first
- Delete the `node_modules` folder and `package-lock.json`, then run `npm install` again

### "DATABASE_URL must be set" error
- Make sure you created a `.env` file in the root directory
- Check that your `.env` file has the `DATABASE_URL` variable set correctly

### "Port already in use" error
- Another program might be using port 5000 or 5173
- Change the `PORT` value in your `.env` file to a different number (like 3000 or 8000)

### Website won't load
- Make sure the server is running (you should see messages in the terminal)
- Check that you're using the correct URL (http://localhost:5000 or http://localhost:5173)
- Make sure your browser isn't blocking localhost

### Database connection errors
- Verify your `DATABASE_URL` is correct
- Make sure your database is accessible (not blocked by firewall)
- Check if your database provider requires SSL connections

## 📚 Additional Resources

- **Development Guide**: See `DEVELOPMENT_GUIDE.md` for more detailed technical information
- **Design Guidelines**: See `design_guidelines.md` for UI/UX specifications
- **Implementation Status**: See `IMPLEMENTATION_STATUS.md` for feature completion status

## 🎯 Available Commands

- `npm run dev` - Start the development server (integrated mode)
- `npm run dev:separate` - Start frontend and backend separately
- `npm run dev:frontend` - Start only the frontend
- `npm run dev:backend` - Start only the backend
- `npm run build` - Build the project for production
- `npm run start` - Start the production server
- `npm run check` - Check TypeScript types
- `npm run db:init` - Run the database

## 💡 Tips for Beginners

1. **Keep the terminal open**: The server needs to keep running. Don't close the terminal window while using the website.

2. **Check the terminal for errors**: If something doesn't work, look at the terminal output - it usually shows helpful error messages.

3. **Use test Stripe keys**: When developing, use Stripe's test keys (they start with `sk_test_` and `pk_test_`). These won't charge real money.

4. **Database setup**: If you're new to databases, Neon (https://neon.tech) offers a free PostgreSQL database that's easy to set up.

5. **Hot reload**: When you make changes to the code, the website will automatically refresh in your browser - this is called "hot reload" and it's very convenient!

## 📝 Notes

- The website runs on your local computer only (localhost) - it's not accessible from the internet
- To make it accessible online, you'll need to deploy it to a hosting service
- This is a development version - for production use, you'll need additional security configurations

## 📷 Local Menu Photos

- Place all food/drink photos in `client/public/menu-images/`
- Reference them from the admin form using a leading slash, e.g. `/menu-images/iced-latte.jpg`
- Avoid spaces in filenames (use `arabic-coffee.jpg`) or URL-encode them (`Arabic%20Coffee.jpg`)
- Files inside `public/` are copied to the final build, so these paths work in dev and production
- Follow the design guideline recommendation of ~400×300 px (4:3) and keep file sizes optimized
- You can still paste full URLs if you want to mix hosted and local images

## 🤝 Getting Help

If you encounter issues:
1. Check the error messages in your terminal
2. Review the troubleshooting section above
3. Check that all environment variables are set correctly
4. Make sure all dependencies are installed

---

**Happy coding! 🎉**


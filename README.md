# QuickDineFlow - Smart Ordering System

A web-based cafeteria ordering system that enables students to pre-order meals online, skip queues, and pick up orders at their convenience. The system features dual interfaces: a student-facing menu browsing and ordering system, and an admin panel for kitchen staff to manage menu items and track orders.

## 🚀 Quick Start Guide

If you've just downloaded this project from GitHub and want to run it on your computer, follow these simple steps:

### Prerequisites

Before you begin, make sure you have these installed on your computer:

1. **Node.js** (version 18 or higher)
   - Download from: https://nodejs.org/
   - This includes npm (Node Package Manager) automatically

2. **A PostgreSQL Database**
   - You can use a free database from [Neon](https://neon.tech) or any PostgreSQL provider
   - You'll need the connection string (URL) to your database

3. **Stripe Account** (for payment processing)
   - Sign up for a free account at: https://stripe.com
   - Get your test API keys from the dashboard

### Step 1: Install Dependencies

Open a terminal/command prompt in the project folder and run:

```bash
npm install
```

This will download all the required packages. It may take a few minutes the first time.

### Step 2: Set Up Environment Variables

1. Copy the example environment file:
   ```bash
   # On Windows (PowerShell)
   Copy-Item .env.example .env
   
   # On Mac/Linux
   cp .env.example .env
   ```

2. Open the `.env` file in a text editor and fill in your values:

   - **DATABASE_URL**: Your PostgreSQL connection string
     - Example: `postgresql://user:password@host:5432/database?sslmode=require`
     - If using Neon, you can copy this from your Neon dashboard
   
   - **SESSION_SECRET**: A random secret string for security
     - You can generate one using: `openssl rand -base64 32`
     - Or just use any long random string like: `my-super-secret-key-12345`
   
   - **STRIPE_SECRET_KEY**: Your Stripe secret key (starts with `sk_test_` for testing)
     - Get this from: https://dashboard.stripe.com/test/apikeys
   
   - **VITE_STRIPE_PUBLIC_KEY**: Your Stripe public key (starts with `pk_test_` for testing)
     - Get this from the same Stripe dashboard page
   
   - **PORT**: The port number (default is 5000, you can leave it as is)

### Step 3: Run the Application

You have two options to run the website:

#### Option A: Integrated Mode (Recommended for Beginners)

This runs everything on one port - simpler to use!

```bash
npm run dev
```

Then open your web browser and go to:
**http://localhost:5000**

#### Option B: Separate Mode

This runs the frontend and backend separately:

```bash
npm run dev:separate
```

Then open your web browser and go to:
**http://localhost:5173**

### Step 4: Access the Website

- Open your web browser (Chrome, Firefox, Edge, etc.)
- Type the URL in the address bar:
  - For Integrated Mode: `http://localhost:5000`
  - For Separate Mode: `http://localhost:5173`
- Press Enter

You should see the QuickDineFlow website!

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

## 🤝 Getting Help

If you encounter issues:
1. Check the error messages in your terminal
2. Review the troubleshooting section above
3. Check that all environment variables are set correctly
4. Make sure all dependencies are installed

---

**Happy coding! 🎉**


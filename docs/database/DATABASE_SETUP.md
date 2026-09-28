# Run QuickDineFlow Locally

This guide takes you from a fresh repository clone to the app running on your computer. **Use local PostgreSQL first.** You do not need a Neon or Render account to develop or try the app locally. Hosted databases and deployment are optional later steps at the end of this guide.

## What you need

- Git
- Node.js **20.19+** or **22.12+**, with npm
- PostgreSQL installed and running on your computer

Check Node.js and npm from a terminal:

```bash
node --version
npm --version
```

If you need to install PostgreSQL, use the installer or package manager for your operating system. During setup, remember the password for the `postgres` user and keep the default port `5432` unless you have a reason to change it. On Windows, open **Services** and make sure the PostgreSQL service is running. On macOS or Linux, start PostgreSQL with the service manager used by your installation. pgAdmin is an optional graphical tool for inspecting your local database.

## 1. Clone the repository and install dependencies

In a terminal, replace the repository URL with the URL for your QuickDineFlow repository:

```bash
git clone <repository-url>
cd QuickDineFlow
npm install
```

Run the remaining commands from the repository root, the folder containing `package.json`.

## 2. Configure a local database connection

In VS Code, open the cloned `QuickDineFlow` folder and create a file named `.env.local` beside `package.json`. Make sure the filename is exactly `.env.local`, with no `.txt` extension. This file is private to your computer, is loaded automatically by the app, and should not be committed. Start with:

```env
DATABASE_URL=postgresql://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/quickdineflow
SESSION_SECRET=replace-this-with-a-random-secret
ADMIN_EMAIL=admin@quickdineflow.local
ADMIN_PASSWORD=choose-a-local-admin-password
PORT=5000
```

Replace `YOUR_POSTGRES_PASSWORD` with the password for your local PostgreSQL user. If your username is not `postgres`, replace that too. If the password contains URL-reserved characters such as `@`, `#`, `/`, or `:`, URL-encode those characters in the connection string.

Generate a session secret with Node.js:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Copy the output into `SESSION_SECRET`. Choose a local admin password and remember it for signing in. These settings are for local development; never reuse them for a public deployment.

Stripe keys and password-reset email settings are optional. The app can run without them, but Stripe checkout and password-reset email will be unavailable. If you want to try Stripe, use test keys only and add them to `.env.local`:

```env
STRIPE_SECRET_KEY=sk_test_...
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

## 3. Create and seed the local database

Make sure PostgreSQL is running, then run:

```bash
npm run db:setup-local-full
```

This command creates the local `quickdineflow` database if it does not exist, applies the application schema, and seeds sample menu items and the admin account. The PostgreSQL user in `DATABASE_URL` must be able to create databases. The seed requires `ADMIN_EMAIL` and an `ADMIN_PASSWORD` of at least 12 characters; rerunning the seed resets that admin account's password to the configured value. The seed never supplies a default admin password.

If the database already exists, run just:

```bash
npm run db:setup
```

If your PostgreSQL user cannot create databases, create `quickdineflow` with that user (or make that user the database owner), then run `npm run db:setup`.

## 4. Start the app and open it

Start the integrated local server:

```bash
npm run dev
```

Keep this terminal open. Open **http://localhost:5000** in your browser. Sign in with the admin email and password from `.env.local` to explore the admin area. The sample menu is available to browse as a student.

You can check that the server is responding at **http://localhost:5000/api/health**. To stop the server, press `Ctrl+C` in the terminal where it is running.

If port `5000` is already in use, set a different `PORT` in `.env.local`, restart the server, and open `http://localhost:<PORT>` in your browser.

## If setup does not work

- **Connection refused:** Start or restart the PostgreSQL service and confirm it listens on port `5432`.
- **Password authentication failed:** Check the username and password in `DATABASE_URL` against your local PostgreSQL account.
- **Permission denied to create database:** Create `quickdineflow` manually with the configured user as its owner, then run `npm run db:setup`.
- **Tables are missing:** From the repository root, run `npm run db:setup` and check the terminal for errors.
- **Admin login fails:** Confirm you are using `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `.env.local`. If you reran the seed, it reset the admin password to that configured value.
- **App does not open:** Check the terminal for startup errors and confirm you are using the same port as `PORT` in `.env.local`.

For the broader local workflow, see [README.md](../../README.md). The recommended first milestone is to run the app and complete the menu-to-order flow locally before setting up a hosted environment.

## Later: use a hosted database or deploy

Only continue here after the local app works. A hosted database is useful when teammates need shared data or when you are preparing a deployment; it is not required for cloning, setup, or local use.

- **Neon:** The recommended free deployment database. Use the pooled connection string as `DATABASE_URL` on the Render backend. Configure it in the deployment environment, not in a committed file.
- **Render:** Hosts the Express backend only. Follow [Render backend deployment instructions](../RENDER_DEPLOY.md) when you are ready to deploy.

Never commit `.env`, `.env.local`, database passwords, session secrets, or real payment keys.

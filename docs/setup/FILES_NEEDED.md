# Files Needed for Installation on New Laptop

## 📦 Complete File List

### Essential Files (MUST HAVE)

**Root Directory:**
- `package.json` - Project configuration and dependencies
- `package-lock.json` - Locked dependency versions
- `tsconfig.json` - TypeScript configuration
- `vite.config.ts` - Vite build tool configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `drizzle.config.ts` - Database ORM configuration
- `postcss.config.js` - PostCSS configuration
- `components.json` - UI components configuration

**Client Folder (`client/`):**
- `client/index.html` - Main HTML file
- `client/src/` - All React source files
  - `App.tsx` - Main application component
  - `main.tsx` - Application entry point
  - `index.css` - Global styles
  - `components/` - All UI components
  - `pages/` - All page components
  - `contexts/` - React contexts
  - `hooks/` - Custom React hooks
  - `lib/` - Utility functions
  - `i18n/` - Translation files
- `client/public/` - Static assets (favicon, etc.)

**Server Folder (`server/`):**
- `server/index.ts` - Server entry point
- `server/routes.ts` - API routes
- `server/db.ts` - Database connection
- `server/storage.ts` - Database operations
- `server/localAuth.ts` - Authentication
- `server/seed.ts` - Database seeding script
- `server/init-db.ts` - Database initialization script
- `server/vite.ts` - Vite integration

**Shared Folder (`shared/`):**
- `shared/schema.ts` - Database schema definitions

### Configuration Files (IMPORTANT)

- `.env.example` - Template for environment variables (safe to share)
- `.gitignore` - Git ignore rules
- `.replit` - Replit configuration (optional, can be ignored)

### Documentation Files (HELPFUL)

- `README.md` - Main documentation
- `INSTALLATION_GUIDE.md` - Complete installation guide
- `QUICK_INSTALL.md` - Quick setup guide
- `SETUP_CHECKLIST.md` - Setup checklist
- `DEVELOPMENT_GUIDE.md` - Development instructions
- `TROUBLESHOOTING.md` - Common issues and solutions

### Files You DON'T Need to Transfer

- `node_modules/` - Will be recreated with `npm install`
- `.env` - Contains secrets, create new one on new laptop
- `dist/` - Build output, will be regenerated
- `.git/` - Git history (optional, only if using Git)

## 📋 What to Copy

### Option 1: Copy Entire Folder (Easiest)
Copy the entire `QuickDineFlow` folder to the new laptop, then:
- Delete `node_modules/` folder (if it exists)
- Delete `.env` file (if it exists - you'll create a new one)
- Run `npm install` on the new laptop

### Option 2: Use Git (Recommended)
If the project is on GitHub:
```bash
git clone <repository-url>
cd QuickDineFlow
npm install
```

## ✅ Minimum Required Files

If you want the absolute minimum, you need:
1. All files in `client/` folder
2. All files in `server/` folder
3. All files in `shared/` folder
4. `package.json`
5. `package-lock.json`
6. `tsconfig.json`
7. `vite.config.ts`
8. `tailwind.config.ts`
9. `drizzle.config.ts`
10. `postcss.config.js`
11. `components.json`

**But it's easier to just copy the entire folder!**

## 🔑 Files You Must Create on New Laptop

- `.env` - Environment variables (create from `.env.example` or manually)

## 📝 Summary

**Copy everything EXCEPT:**
- `node_modules/` (recreated with `npm install`)
- `.env` (create new one with your credentials)

**Then on new laptop:**
1. Run `npm install`
2. Create `.env` file
3. Run `npm run db:init`
4. Run `npm run db:seed`
5. Run `npm run dev`

That's it! 🎉


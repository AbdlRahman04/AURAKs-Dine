# Database Access Guide

This guide explains how to access and configure database connections for QuickDineFlow, including Replit and Neon databases.

## Overview

QuickDineFlow uses PostgreSQL databases. The database connection is configured through environment variables, not through physical database files in your project folder.

## Database Connection Configuration

### Where Database Configuration is Stored

The database connection is configured in **environment variables**, not in files within the `database/` folder. The `database/` folder contains:
- SQL schema files (`mysql_schema.sql`) - for reference/documentation
- Setup guides and documentation
- **NOT** the actual database connection configuration

### Environment Variables

The database connection is stored in your `.env` file (or Replit Secrets):

```env
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
```

## Accessing Different Database Types

### 1. Neon Database (Cloud PostgreSQL)

**Location of Configuration:**
- **Local Development**: `.env` file in project root
- **Replit**: Replit Secrets (Environment Variables)

**How to Access:**

1. **Get Connection String from Neon Dashboard:**
   - Go to https://neon.tech
   - Log into your account
   - Select your project
   - Click "Connect" button
   - Copy the connection string (looks like: `postgresql://user:pass@ep-xxxx.neon.tech/dbname?sslmode=require`)

2. **Set in Your Environment:**
   ```bash
   # In .env file (local development)
   DATABASE_URL=postgresql://your-neon-connection-string-here
   ```

3. **Access via Code:**
   - The connection is automatically used by `server/db.ts`
   - No additional configuration needed once `DATABASE_URL` is set

**Files Involved:**
- `server/db.ts` - Database connection setup (reads `DATABASE_URL`)
- `.env` - Environment variables (local)
- Replit Secrets - Environment variables (Replit)

### 2. Replit Database

**Location of Configuration:**
- **Replit Environment**: Automatically provided by Replit
- **Access**: Via `process.env.DATABASE_URL` in Replit

**How to Access:**

1. **In Replit:**
   - Replit automatically provides a PostgreSQL database
   - The `DATABASE_URL` is automatically set in the environment
   - No manual configuration needed

2. **Access Connection String:**
   - In Replit, go to "Secrets" (lock icon in sidebar)
   - Look for `DATABASE_URL` - this is your Replit database connection
   - You can also access it via: `process.env.DATABASE_URL` in your code

3. **Local Access (if needed):**
   - You can copy the Replit `DATABASE_URL` to your local `.env` file
   - This allows you to connect to the same database from your local machine

**Files Involved:**
- `server/db.ts` - Database connection setup
- Replit Secrets - Environment variables
- `.replit` - Replit configuration (includes database module)

### 3. Local PostgreSQL Database

**Location of Configuration:**
- `.env` file in project root

**How to Access:**

1. **Install PostgreSQL locally:**
   ```bash
   # Windows (using Chocolatey)
   choco install postgresql
   
   # Mac (using Homebrew)
   brew install postgresql
   
   # Linux (Ubuntu/Debian)
   sudo apt-get install postgresql
   ```

2. **Create Database:**
   ```bash
   createdb quickdineflow
   ```

3. **Set Connection String in .env:**
   ```env
   DATABASE_URL=postgresql://your-username:password@localhost:5432/quickdineflow
   ```

## Key Files and Their Roles

### Database Connection Files

1. **`server/db.ts`**
   - **Purpose**: Establishes database connection
   - **Reads**: `process.env.DATABASE_URL`
   - **Exports**: `db` (Drizzle ORM instance) and `pool` (connection pool)
   - **Location**: `server/db.ts`

2. **`.env` (Local Development)**
   - **Purpose**: Stores environment variables including `DATABASE_URL`
   - **Location**: Project root (not committed to git)
   - **Format**: `DATABASE_URL=postgresql://...`

3. **Replit Secrets (Replit Environment)**
   - **Purpose**: Stores environment variables in Replit
   - **Access**: Replit sidebar → Secrets tab
   - **Format**: Key-value pairs (DATABASE_URL = postgresql://...)

### Schema Definition Files

1. **`shared/schema.ts`**
   - **Purpose**: TypeScript/Drizzle ORM schema definitions
   - **Location**: `shared/schema.ts`
   - **Used by**: Application code for type-safe database operations

2. **`database/mysql_schema.sql`**
   - **Purpose**: SQL schema reference (for MySQL compatibility reference)
   - **Location**: `database/mysql_schema.sql`
   - **Note**: This is for reference only; the app uses PostgreSQL

3. **`drizzle.config.ts`**
   - **Purpose**: Drizzle Kit configuration for migrations
   - **Reads**: `process.env.DATABASE_URL`
   - **Location**: `drizzle.config.ts`

## How to Switch Between Databases

### From Replit to Local/Neon:

1. **Get your database connection string:**
   - Neon: Copy from Neon dashboard
   - Local: `postgresql://user:pass@localhost:5432/dbname`

2. **Update environment variable:**
   ```bash
   # In .env file
   DATABASE_URL=your-new-connection-string-here
   ```

3. **Initialize database (if new):**
   ```bash
   npm run db:init
   ```

4. **Restart server:**
   ```bash
   npm run dev
   ```

### From Local to Neon/Replit:

1. **Get connection string** (same as above)

2. **Update environment:**
   - Local: Update `.env` file
   - Replit: Update Secrets

3. **Run migrations if needed:**
   ```bash
   npm run db:init
   ```

## Common Questions

### Q: Where are the actual database files stored?

**A:** 
- **Neon**: Stored in Neon's cloud infrastructure (not accessible as files)
- **Replit**: Stored in Replit's infrastructure (not accessible as files)
- **Local PostgreSQL**: Stored in PostgreSQL data directory (usually `/var/lib/postgresql/` on Linux, `C:\Program Files\PostgreSQL\data\` on Windows)

### Q: Can I access the database directly?

**A:** Yes, using:
- **psql** command-line tool: `psql $DATABASE_URL`
- **pgAdmin** (GUI tool)
- **Neon Console** (for Neon databases)
- **Replit Database** tab (for Replit databases)

### Q: Where is the database connection configured in code?

**A:** 
- **Connection setup**: `server/db.ts`
- **Environment variable**: `DATABASE_URL` (in `.env` or Replit Secrets)
- **Schema definitions**: `shared/schema.ts`

### Q: How do I know which database I'm using?

**A:** Check your `DATABASE_URL`:
```bash
# In terminal
echo $DATABASE_URL

# Or in Node.js
console.log(process.env.DATABASE_URL)
```

## Troubleshooting

### "DATABASE_URL must be set"
- Check that `.env` file exists and contains `DATABASE_URL`
- Verify the connection string is correct
- Restart your server after changing `.env`

### "Connection refused" or "Cannot connect"
- Verify the database is running (for local PostgreSQL)
- Check the connection string is correct
- Ensure network access is allowed (for cloud databases)

### "Table does not exist"
- Run `npm run db:init` to create tables
- Check that you're connected to the correct database

## Summary

- **Database connection**: Configured via `DATABASE_URL` environment variable
- **Configuration files**: `.env` (local) or Replit Secrets (Replit)
- **Connection code**: `server/db.ts`
- **Schema definitions**: `shared/schema.ts`
- **The `database/` folder**: Contains documentation and SQL reference files, NOT connection configuration


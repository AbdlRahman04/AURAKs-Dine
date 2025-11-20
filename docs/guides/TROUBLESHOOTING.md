# Troubleshooting Registration Issues

## Registration Error: "Failed to register: Unknown error"

If you're getting this error when trying to register a new account, it's likely because the database tables haven't been created yet.

### Solution 1: Initialize Database Tables

Run this command to create all necessary database tables:

```bash
npm run db:init
```

If this command fails, try Solution 2.

### Solution 2: Check Your Database Connection

1. **Verify your DATABASE_URL in `.env` file:**
   - It should look like: `postgresql://user:password@host:port/database?sslmode=require`
   - For Neon databases, you can get the connection string from your Neon dashboard

2. **Test the connection:**
   - Make sure your database is accessible
   - Check if your database provider requires SSL connections

### Solution 3: Manual Table Creation

If the automatic initialization doesn't work, you can create the tables manually using your database management tool (pgAdmin, DBeaver, or Neon's SQL editor).

The main table you need is the `users` table. Here's the SQL:

```sql
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE NOT NULL,
  password VARCHAR,
  first_name VARCHAR,
  last_name VARCHAR,
  profile_image_url VARCHAR,
  student_id VARCHAR(10) UNIQUE,
  role VARCHAR(20) NOT NULL DEFAULT 'student',
  preferred_pickup_location VARCHAR,
  phone_number VARCHAR,
  dietary_restrictions TEXT[],
  allergies TEXT[],
  stripe_customer_id VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Solution 4: Check Server Logs

1. Look at the terminal where the server is running
2. Try to register again
3. Check the error message - it should now show more details about what went wrong
4. The improved error logging will show:
   - If the table doesn't exist: "Database table 'users' does not exist"
   - If there's a duplicate: "Email or student ID already exists"
   - Other database errors with more details

### Common Issues

**Issue:** "Database table 'users' does not exist"
- **Fix:** Run `npm run db:init` to create the tables

**Issue:** "Email already registered"
- **Fix:** Use a different email address, or the account already exists

**Issue:** Connection errors
- **Fix:** Check your DATABASE_URL in the `.env` file
- Make sure your database is running and accessible
- Verify network/firewall settings

**Issue:** "getaddrinfo ENOTFOUND host"
- **Fix:** Your DATABASE_URL is incorrect or contains placeholder values
- Update your `.env` file with the correct database connection string

## After Fixing

Once the tables are created, try registering again. The registration should work!

If you still encounter issues, check the server terminal output for detailed error messages.


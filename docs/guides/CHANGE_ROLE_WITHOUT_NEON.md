# How to Change Role from Student to Admin (Without Neon)

This guide shows you how to change a user's role from `student` to `admin` using different database options (local PostgreSQL, MySQL, or other providers).

## Method 1: Using the make-admin Script (Recommended)

The `make-admin.ts` script works with **any database** as long as your `DATABASE_URL` is configured correctly.

### Steps:

1. **Make sure your `.env` file has the correct `DATABASE_URL`** pointing to your database:
   ```env
   # For local PostgreSQL
   DATABASE_URL=postgresql://username:password@localhost:5432/quickdineflow
   
   # For MySQL (if you've configured it)
   DATABASE_URL=mysql://username:password@localhost:3306/quickdineflow
   
   # For any other PostgreSQL provider
   DATABASE_URL=postgresql://user:pass@host:port/database
   ```

2. **Run the make-admin script:**
   ```bash
   # Using npm script
   npm run make-admin -- user@example.com
   
   # Or directly with tsx
   npx tsx scripts/make-admin.ts user@example.com
   ```

3. **The script will:**
   - Find the user by email
   - Update their role to `admin`
   - Show confirmation

4. **Log out and log back in** to refresh your session

5. **Access the admin panel** at `/admin`

---

## Method 2: Direct SQL Update

### For PostgreSQL (Local or Any Provider)

If you have access to your PostgreSQL database (via psql, pgAdmin, or any SQL client):

```sql
UPDATE users 
SET role = 'admin', updated_at = NOW() 
WHERE email = 'user@example.com';
```

**Using psql command line:**
```bash
psql -U your_username -d quickdineflow -c "UPDATE users SET role = 'admin', updated_at = NOW() WHERE email = 'user@example.com';"
```

### For MySQL

If you're using MySQL:

```sql
UPDATE users 
SET role = 'admin', updated_at = NOW() 
WHERE email = 'user@example.com';
```

**Using MySQL command line:**
```bash
mysql -u your_username -p quickdineflow -e "UPDATE users SET role = 'admin', updated_at = NOW() WHERE email = 'user@example.com';"
```

---

## Method 3: Using Database Management Tools

### Option A: pgAdmin (for PostgreSQL)

1. Open pgAdmin
2. Connect to your database
3. Right-click on your database → **Query Tool**
4. Run:
   ```sql
   UPDATE users 
   SET role = 'admin', updated_at = NOW() 
   WHERE email = 'user@example.com';
   ```
5. Click **Execute** (F5)

### Option B: MySQL Workbench (for MySQL)

1. Open MySQL Workbench
2. Connect to your database
3. Open a new SQL tab
4. Run:
   ```sql
   UPDATE users 
   SET role = 'admin', updated_at = NOW() 
   WHERE email = 'user@example.com';
   ```
5. Click **Execute** (Ctrl+Enter)

### Option C: DBeaver (Universal Database Tool)

1. Open DBeaver
2. Connect to your database (PostgreSQL or MySQL)
3. Open SQL Editor
4. Run the UPDATE query
5. Execute

### Option D: VS Code Database Extensions

If you have a database extension in VS Code (like "SQLTools"):

1. Connect to your database
2. Open a new query
3. Run the UPDATE SQL statement
4. Execute

---

## Method 4: Using Node.js Script (Alternative)

You can create a simple script to update the role:

```typescript
// update-role.ts
import "dotenv/config";
import { db } from './server/db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

const email = process.argv[2];
const newRole = process.argv[3] || 'admin';

async function updateRole() {
  try {
    await db
      .update(users)
      .set({ 
        role: newRole,
        updatedAt: new Date(),
      })
      .where(eq(users.email, email));
    
    console.log(`✅ Updated ${email} to ${newRole}`);
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

updateRole();
```

Run it:
```bash
npx tsx update-role.ts user@example.com admin
```

---

## Verification

After changing the role, verify it worked:

### Using SQL:
```sql
SELECT email, first_name, last_name, role 
FROM users 
WHERE email = 'user@example.com';
```

### Using the make-admin script:
The script will show you all users if the email isn't found, which helps verify the change.

---

## Troubleshooting

### "DATABASE_URL must be set" Error

Make sure your `.env` file has `DATABASE_URL` set:
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname
```

### "User not found" Error

1. Check that the user exists:
   ```sql
   SELECT email, role FROM users;
   ```
2. Make sure you're using the correct email address
3. The make-admin script will show all available users if it can't find the email

### "Connection refused" Error

1. Make sure your database server is running
2. Check that your `DATABASE_URL` is correct
3. Verify the database exists

### Role Changed But Still Can't Access Admin Panel

1. **Log out completely** from your application
2. **Clear browser cookies/cache**
3. **Log back in** with the updated account
4. Try accessing `/admin` again

---

## Database-Specific Notes

### Local PostgreSQL Setup

If you're using local PostgreSQL:

1. Install PostgreSQL:
   ```bash
   # Windows (using Chocolatey)
   choco install postgresql
   
   # macOS
   brew install postgresql
   
   # Linux
   sudo apt-get install postgresql
   ```

2. Create database:
   ```bash
   createdb quickdineflow
   ```

3. Set DATABASE_URL:
   ```env
   DATABASE_URL=postgresql://your_username@localhost:5432/quickdineflow
   ```

### MySQL Setup

If you want to use MySQL instead:

1. Install MySQL
2. Create database:
   ```sql
   CREATE DATABASE quickdineflow;
   ```
3. Run the MySQL schema:
   ```bash
   mysql -u root -p quickdineflow < database/mysql_schema.sql
   ```
4. Update `server/db.ts` to use MySQL driver (you'll need to modify the connection)

---

## Security Note

⚠️ **Important**: Only promote trusted users to admin. Admin users have full access to:
- All customer orders
- Menu management
- System analytics
- Order status updates

Make sure to keep admin accounts secure!


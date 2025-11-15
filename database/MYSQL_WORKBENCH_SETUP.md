# MySQL Workbench Setup Guide - Step by Step

This guide will walk you through setting up the QuickDineFlow database using MySQL Workbench.

## Prerequisites

- MySQL Server installed and running
- MySQL Workbench installed
- You have MySQL root password or user credentials

---

## Method 1: Using MySQL Workbench (Recommended)

### Step 1: Open MySQL Workbench

1. Launch **MySQL Workbench**
2. You should see your MySQL connection in the home screen
3. **Double-click** on your MySQL connection (or click the connection and enter your password)

### Step 2: Open the SQL Script

1. In MySQL Workbench, go to **File** → **Open SQL Script...**
2. Navigate to your project folder: `QuickDineFlow/database/`
3. Select `mysql_schema.sql`
4. Click **Open**

### Step 3: Select the Database (IMPORTANT!)

**Before running the script, you need to select/create the database:**

**Option A: Using the Schema List (Easiest)**
1. Look at the left sidebar under **"SCHEMAS"**
2. If you see `quickdineflow` database, **double-click it** to select it
3. If you don't see it, the script will create it (continue to Step 4)

**Option B: Run Database Creation First**
1. In the SQL editor, find these lines at the top:
   ```sql
   CREATE DATABASE IF NOT EXISTS quickdineflow CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   USE quickdineflow;
   ```
2. **Select ONLY these two lines** (highlight them)
3. Click the **Execute** button (⚡ lightning bolt icon) or press `Ctrl+Shift+Enter`
4. Wait for "Script executed successfully"
5. Now **double-click `quickdineflow`** in the SCHEMAS list to select it

### Step 4: Execute the Full Script

1. **Select ALL the SQL code** in the editor:
   - Press `Ctrl+A` (Windows) or `Cmd+A` (Mac)
   - Or click and drag to select all

2. **Execute the script**:
   - Click the **Execute** button (⚡ lightning bolt icon)
   - Or press `Ctrl+Shift+Enter` (Windows) or `Cmd+Shift+Enter` (Mac)

3. **Wait for completion**:
   - You'll see "Script executed successfully" at the bottom
   - Check the "Output" panel for any warnings (usually safe to ignore)

### Step 5: Verify Tables Were Created

1. In the left sidebar, expand **SCHEMAS** → **quickdineflow** → **Tables**
2. You should see **9 tables**:
   - ✅ audit_logs
   - ✅ favorites
   - ✅ feedback
   - ✅ menu_items
   - ✅ order_items
   - ✅ orders
   - ✅ payment_methods
   - ✅ sessions
   - ✅ users

### Step 6: Verify Admin User Was Created

1. In the SQL editor, type:
   ```sql
   SELECT * FROM users WHERE role = 'admin';
   ```
2. Click **Execute** (⚡)
3. You should see one admin user with email `admin@quickdineflow.com`

---

## Method 2: Using Command Line (Alternative)

If you prefer command line:

### Step 1: Open Command Prompt/Terminal

**Windows:**
- Open Command Prompt or PowerShell
- Navigate to MySQL bin directory (if not in PATH):
  ```bash
  cd "C:\Program Files\MySQL\MySQL Server 8.0\bin"
  ```

**Mac/Linux:**
- Open Terminal
- MySQL should be in your PATH

### Step 2: Connect to MySQL

```bash
mysql -u root -p
```

Enter your MySQL root password when prompted.

### Step 3: Run the Schema Script

**Option A: From MySQL Command Line**
```sql
source /path/to/QuickDineFlow/database/mysql_schema.sql
```

**Windows Example:**
```sql
source C:\Users\ABDUL RAHMIN\Documents\3bdlr7man04\Coding Projects\Software Engineering Projects\project5\QuickDineFlow\database\mysql_schema.sql
```

**Option B: From Terminal (Outside MySQL)**
```bash
mysql -u root -p < database/mysql_schema.sql
```

Or with full path:
```bash
mysql -u root -p < "C:\Users\ABDUL RAHMIN\Documents\3bdlr7man04\Coding Projects\Software Engineering Projects\project5\QuickDineFlow\database\mysql_schema.sql"
```

---

## Troubleshooting

### Error: "No database selected"

**Solution:**
1. Make sure you've run the `USE quickdineflow;` statement
2. Or double-click `quickdineflow` in the SCHEMAS list
3. The database name should be **bold** in the SCHEMAS list when selected

### Error: "Access denied for user"

**Solution:**
- Make sure you're using the correct username and password
- Try using `root` user: `mysql -u root -p`

### Error: "Table already exists"

**Solution:**
- This is okay! The script uses `CREATE TABLE IF NOT EXISTS`
- If you want to start fresh, drop the database first:
  ```sql
  DROP DATABASE IF EXISTS quickdineflow;
  ```
  Then run the schema script again

### Error: "Unknown database 'quickdineflow'"

**Solution:**
- The database wasn't created. Make sure you run the `CREATE DATABASE` statement first
- Or manually create it:
  ```sql
  CREATE DATABASE quickdineflow CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  USE quickdineflow;
  ```

### MySQL Workbench Not Connecting

**Solution:**
1. Make sure MySQL Server is running
2. Check your connection settings (host: localhost, port: 3306)
3. Verify your MySQL service is started:
   - **Windows**: Check Services (services.msc) → MySQL
   - **Mac**: `brew services list` or System Preferences
   - **Linux**: `sudo systemctl status mysql`

---

## Quick Visual Guide for MySQL Workbench

```
┌─────────────────────────────────────────┐
│  MySQL Workbench                        │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────┐    ┌──────────────┐   │
│  │  SCHEMAS    │    │  SQL Editor  │   │
│  │  (Left)     │    │  (Right)     │   │
│  │             │    │              │   │
│  │  ▼ quickdine│    │  [SQL Code]  │   │
│  │    ▼ Tables │    │              │   │
│  │      users  │    │  [Execute ⚡]│   │
│  │      orders │    │              │   │
│  │      ...    │    │              │   │
│  └─────────────┘    └──────────────┘   │
│                                         │
│  Steps:                                 │
│  1. Double-click "quickdineflow"       │
│  2. Open mysql_schema.sql              │
│  3. Select all (Ctrl+A)                │
│  4. Click Execute (⚡)                 │
└─────────────────────────────────────────┘
```

---

## Verification Checklist

After running the script, verify:

- [ ] Database `quickdineflow` exists in SCHEMAS list
- [ ] 9 tables are visible under `quickdineflow` → Tables
- [ ] Can run: `SELECT * FROM users;` and see the admin user
- [ ] Can run: `SELECT * FROM menu_items;` (should be empty, but no error)
- [ ] No error messages in the Output panel

---

## Next Steps

After successful setup:

1. **Update your application** to use MySQL (if needed)
2. **Change the admin password** - The default password hash is a placeholder
3. **Add sample data** - Insert menu items, test orders, etc.
4. **Test your application** - Make sure everything connects correctly

---

## Need Help?

If you're still having issues:

1. Check the error message carefully
2. Make sure MySQL Server is running
3. Verify you have the correct permissions
4. Try creating the database manually first:
   ```sql
   CREATE DATABASE quickdineflow;
   USE quickdineflow;
   ```
   Then run the rest of the script

Good luck! 🚀


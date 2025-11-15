# MySQL Database Setup Guide for QuickDineFlow

This guide will help you set up a MySQL database for your QuickDineFlow application.

## Prerequisites

1. **MySQL Server** installed on your system
   - Download from: https://dev.mysql.com/downloads/mysql/
   - Or use XAMPP/WAMP which includes MySQL
   - Or use Docker: `docker run --name mysql-quickdine -e MYSQL_ROOT_PASSWORD=yourpassword -p 3306:3306 -d mysql:8.0`

2. **MySQL Client** (command-line tool or MySQL Workbench)
   - Usually comes with MySQL Server installation
   - Or download MySQL Workbench: https://dev.mysql.com/downloads/workbench/

## Method 1: Using MySQL Command Line

### Step 1: Open MySQL Command Line

**Windows:**
- Open Command Prompt or PowerShell
- Navigate to MySQL bin directory (usually `C:\Program Files\MySQL\MySQL Server 8.0\bin`)
- Or if MySQL is in your PATH, just open any terminal

**Linux/Mac:**
- Open Terminal
- MySQL should be in your PATH

### Step 2: Connect to MySQL

```bash
mysql -u root -p
```

Enter your MySQL root password when prompted.

### Step 3: Create the Database

```sql
CREATE DATABASE IF NOT EXISTS quickdineflow CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE quickdineflow;
```

### Step 4: Run the Schema Script

**Option A: Copy and Paste**
1. Open the `database/mysql_schema.sql` file in a text editor
2. Copy the entire contents
3. Paste into your MySQL command line
4. Press Enter

**Option B: Source the File**
```bash
source /path/to/QuickDineFlow/database/mysql_schema.sql
```

**Windows Example:**
```bash
source C:\Users\ABDUL RAHMIN\Documents\3bdlr7man04\Coding Projects\Software Engineering Projects\project5\QuickDineFlow\database\mysql_schema.sql
```

**Option C: Using Command Line (from outside MySQL)**
```bash
mysql -u root -p quickdineflow < database/mysql_schema.sql
```

### Step 5: Verify Tables Were Created

```sql
SHOW TABLES;
```

You should see:
- audit_logs
- favorites
- feedback
- menu_items
- order_items
- orders
- payment_methods
- sessions
- users

### Step 6: Verify a Table Structure

```sql
DESCRIBE users;
```

## Method 2: Using MySQL Workbench

### Step 1: Open MySQL Workbench

1. Launch MySQL Workbench
2. Connect to your MySQL server (click on the connection)

### Step 2: Create Database

1. Click on the "Schemas" tab in the left sidebar
2. Right-click in the schemas area
3. Select "Create Schema..."
4. Name it `quickdineflow`
5. Set Character Set to `utf8mb4`
6. Set Collation to `utf8mb4_unicode_ci`
7. Click "Apply"

### Step 3: Run the Schema Script

1. Click on the `quickdineflow` schema to select it
2. Go to `File` → `Open SQL Script...`
3. Navigate to `database/mysql_schema.sql`
4. Click "Open"
5. Click the "Execute" button (lightning bolt icon) or press `Ctrl+Shift+Enter`
6. Wait for "Script executed successfully" message

### Step 4: Verify

1. In the left sidebar, expand `quickdineflow` → `Tables`
2. You should see all 9 tables listed

## Method 3: Using phpMyAdmin (if using XAMPP/WAMP)

### Step 1: Start Services

1. Start XAMPP/WAMP
2. Start Apache and MySQL services
3. Open phpMyAdmin (usually at http://localhost/phpmyadmin)

### Step 2: Create Database

1. Click "New" in the left sidebar
2. Database name: `quickdineflow`
3. Collation: `utf8mb4_unicode_ci`
4. Click "Create"

### Step 3: Import Schema

1. Select the `quickdineflow` database
2. Click the "Import" tab
3. Click "Choose File"
4. Select `database/mysql_schema.sql`
5. Click "Go" at the bottom
6. Wait for success message

## Method 4: Using Docker

### Step 1: Create and Start MySQL Container

```bash
docker run --name mysql-quickdine \
  -e MYSQL_ROOT_PASSWORD=yourpassword \
  -e MYSQL_DATABASE=quickdineflow \
  -p 3306:3306 \
  -d mysql:8.0
```

### Step 2: Copy Schema File to Container

```bash
docker cp database/mysql_schema.sql mysql-quickdine:/tmp/schema.sql
```

### Step 3: Execute Schema

```bash
docker exec -i mysql-quickdine mysql -uroot -pyourpassword quickdineflow < database/mysql_schema.sql
```

Or:

```bash
docker exec -i mysql-quickdine mysql -uroot -pyourpassword quickdineflow -e "source /tmp/schema.sql"
```

## Updating Your Application Configuration

After setting up the database, you need to update your application to use MySQL instead of PostgreSQL.

### Step 1: Install MySQL Driver

```bash
npm install mysql2
```

### Step 2: Update Database Connection

You'll need to modify `server/db.ts` to use MySQL instead of PostgreSQL. The connection string format for MySQL is:

```
mysql://username:password@host:port/database
```

Example:
```
mysql://root:yourpassword@localhost:3306/quickdineflow
```

### Step 3: Update Environment Variables

Update your `.env` file:

```env
DATABASE_URL=mysql://root:yourpassword@localhost:3306/quickdineflow
```

## Important Notes

### 1. Character Encoding
- The database uses `utf8mb4` encoding to support emojis and special characters
- This is important for Arabic text support

### 2. JSON Fields
- MySQL stores arrays as JSON (unlike PostgreSQL which has native arrays)
- When querying, you may need to use `JSON_EXTRACT()` or `JSON_UNQUOTE()` functions
- Example: `SELECT JSON_EXTRACT(dietary_restrictions, '$[0]') FROM users;`

### 3. UUID Generation
- MySQL uses `UUID()` function instead of PostgreSQL's `gen_random_uuid()`
- The schema uses `DEFAULT (UUID())` for user IDs

### 4. Auto-increment
- MySQL uses `AUTO_INCREMENT` instead of PostgreSQL's `SERIAL`
- Primary keys are set to auto-increment automatically

### 5. Timestamps
- MySQL uses `CURRENT_TIMESTAMP` instead of `NOW()`
- `ON UPDATE CURRENT_TIMESTAMP` automatically updates the `updated_at` field

## Troubleshooting

### Error: "Access denied for user"
- Make sure you're using the correct username and password
- Check if the MySQL service is running

### Error: "Unknown database"
- Make sure you created the database first
- Check the database name spelling

### Error: "Table already exists"
- The script uses `CREATE TABLE IF NOT EXISTS`, so this shouldn't happen
- If it does, you can drop tables first: `DROP TABLE IF EXISTS table_name;`

### Error: "Foreign key constraint fails"
- Make sure you're running the script in the correct order
- The script creates tables in the correct dependency order

### Connection Issues
- Make sure MySQL is running on port 3306 (default)
- Check firewall settings
- Verify the connection string format

## Security Recommendations

1. **Change Default Admin Password**
   - The schema includes a default admin user
   - Change the password hash immediately after setup

2. **Create a Dedicated Database User**
   ```sql
   CREATE USER 'quickdineflow_user'@'localhost' IDENTIFIED BY 'strong_password';
   GRANT ALL PRIVILEGES ON quickdineflow.* TO 'quickdineflow_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

3. **Use Environment Variables**
   - Never hardcode database credentials
   - Use `.env` file (and add it to `.gitignore`)

## Next Steps

1. Update your application code to use MySQL
2. Test database connections
3. Run your application
4. Verify all features work correctly

## Support

If you encounter any issues:
1. Check MySQL error logs
2. Verify all prerequisites are installed
3. Ensure MySQL service is running
4. Check connection string format


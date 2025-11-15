# Quick Start: MySQL Database Setup

## Fastest Method (Copy & Paste)

### 1. Install MySQL (if not installed)
- **Windows**: Download from https://dev.mysql.com/downloads/installer/
- **Mac**: `brew install mysql` or download installer
- **Linux**: `sudo apt-get install mysql-server` (Ubuntu/Debian)

### 2. Start MySQL
- **Windows**: Start MySQL service from Services
- **Mac/Linux**: `sudo systemctl start mysql` or `brew services start mysql`

### 3. Open MySQL Command Line
```bash
mysql -u root -p
```
Enter your MySQL root password.

### 4. Create Database
```sql
CREATE DATABASE quickdineflow CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE quickdineflow;
```

### 5. Copy and Paste the Schema

Open `database/mysql_schema.sql` in a text editor, copy ALL the content, and paste it into your MySQL command line, then press Enter.

**OR** use this command from your terminal (outside MySQL):

```bash
mysql -u root -p quickdineflow < database/mysql_schema.sql
```

### 6. Verify
```sql
SHOW TABLES;
```

You should see 9 tables.

### 7. Update Your .env File
```env
DATABASE_URL=mysql://root:yourpassword@localhost:3306/quickdineflow
```

Replace `yourpassword` with your actual MySQL root password.

## Done! 🎉

Your MySQL database is ready. Now update your application code to use MySQL instead of PostgreSQL.


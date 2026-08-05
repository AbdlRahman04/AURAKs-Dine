# How to Access the Admin Panel

The admin panel at `/admin` requires:
1. **You must be logged in** to your account
2. **Your account must have the `admin` role**

## Why You're Getting a 404 Error

If you're seeing a 404 error when trying to access `/admin`, it's likely because:
- You're not logged in, OR
- Your user account doesn't have the `admin` role (default is `student`)

## How to Make a User an Admin

### Option 1: Using the Script (Recommended)

1. **Make sure you have a user account** - Register or log in first at `/register` or `/login`

2. **Run the make-admin script** with your email:
   ```bash
   # Using npm script (note the -- before the email)
   npm run make-admin -- your-email@example.com
   
   # Or using tsx directly (simpler)
   npx tsx scripts/make-admin.ts your-email@example.com
   ```

3. **Log out and log back in** to refresh your session

4. **Access the admin panel** at `/admin`

### Option 2: Using SQL Directly

If you have direct database access, you can update the user's role:

```sql
UPDATE users 
SET role = 'admin', updated_at = NOW() 
WHERE email = 'your-email@example.com';
```

### Option 3: Using a Database Tool

If you're using Neon or another PostgreSQL provider:

1. Go to your database dashboard
2. Open the SQL editor
3. Run this query (replace with your email):
   ```sql
   UPDATE users 
   SET role = 'admin', updated_at = NOW() 
   WHERE email = 'your-email@example.com';
   ```

## Verifying Admin Access

After promoting a user to admin:

1. **Log out** from your current session
2. **Log back in** with the admin account
3. **Navigate to** `https://your-app.onrender.com/admin`
4. You should now see the admin dashboard

## Admin Panel Features

Once you have admin access, you can:
- **Kitchen Display** (`/admin`) - View and manage orders in real-time
- **Menu Management** (`/admin/menu`) - Add, edit, and remove menu items
- **All Orders** (`/admin/orders`) - View all customer orders
- **Customer Feedback** (`/admin/feedback`) - Manage customer feedback
- **Analytics** (`/admin/analytics`) - View business analytics

📖 **For detailed instructions on using all admin features, see [ADMIN_DASHBOARD_GUIDE.md](ADMIN_DASHBOARD_GUIDE.md)**

## Troubleshooting

### Still Getting 404 After Making Admin?

1. **Clear your browser cache and cookies**
2. **Log out completely** and log back in
3. **Check your session** - Make sure you're logged in as the admin user
4. **Verify the role** - Run the script again to confirm the role was updated

### Can't Find Your User?

If the script says "User not found":
1. Make sure you've registered an account first
2. Check that you're using the correct email address
3. The script will show you all available users if it can't find your email

### On Render Deployment

If you're deploying on Render:
1. Make sure your database is properly connected
2. Run the make-admin script locally pointing to your production database, OR
3. Use Render's database console to run the SQL update directly

## Security Note

⚠️ **Important**: Only promote trusted users to admin. Admin users have full access to:
- All customer orders
- Menu management
- System analytics
- Order status updates

Make sure to keep admin accounts secure!


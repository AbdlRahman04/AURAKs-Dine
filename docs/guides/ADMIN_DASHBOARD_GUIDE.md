# Admin Dashboard User Guide

This guide will help you understand and use all the features available in the QuickDineFlow Admin Dashboard.

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [Admin Panel Overview](#admin-panel-overview)
3. [Kitchen Display](#kitchen-display)
4. [Menu Management](#menu-management)
5. [All Orders](#all-orders)
6. [Customer Feedback](#customer-feedback)
7. [Analytics Dashboard](#analytics-dashboard)
8. [Tips & Best Practices](#tips--best-practices)

---

## Getting Started

### Step 1: Access the Admin Panel

1. **Make sure you have admin access** (see `ADMIN_ACCESS.md` if you need to promote your account)
2. **Log in** to your account
3. **Navigate to** `https://your-app.onrender.com/admin`

### Step 2: Understanding the Layout

The admin panel has:
- **Left Sidebar**: Navigation menu with all admin sections
- **Main Content Area**: Displays the selected section
- **User Info**: Shows your profile at the bottom of the sidebar

---

## Admin Panel Overview

The admin dashboard consists of 5 main sections:

1. **Kitchen Display** (`/admin`) - Real-time order management
2. **Menu Management** (`/admin/menu`) - Add, edit, and manage menu items
3. **All Orders** (`/admin/orders`) - View all customer orders
4. **Customer Feedback** (`/admin/feedback`) - Manage customer feedback
5. **Analytics** (`/admin/analytics`) - View business insights and reports

---

## Kitchen Display

**Location**: `/admin` (default admin page)

### What It Does
The Kitchen Display shows all active orders in real-time, allowing kitchen staff to:
- View incoming orders
- Track order status
- Update order progress
- See pickup times

### How to Use

#### Viewing Orders

1. **Filter Orders**:
   - Click "Active Orders" to see all non-completed orders
   - Click "Received" to see newly placed orders
   - Click "Preparing" to see orders being prepared
   - Click "Ready" to see orders ready for pickup

2. **Order Information Displayed**:
   - Order number
   - Pickup time
   - Order status (color-coded badges)
   - All items in the order with quantities
   - Special instructions (if any)
   - Total price

#### Updating Order Status

Orders flow through these statuses:

1. **Received** → New order just placed
   - Click "Start Preparing" to move to next stage

2. **Preparing** → Order is being prepared
   - Click "Mark Ready" when order is complete

3. **Ready** → Order is ready for customer pickup
   - Click "Complete" when customer picks up

4. **Completed** → Order is finished (automatically hidden from active view)

### Real-Time Updates
- Orders automatically refresh every 5 seconds
- WebSocket notifications alert you when orders are updated
- Orders are sorted by pickup time (earliest first)

### Tips
- Focus on orders with the earliest pickup times first
- Check special instructions carefully
- Update status promptly to keep customers informed

---

## Menu Management

**Location**: `/admin/menu`

### What It Does
Manage your entire menu - add new items, edit existing ones, set prices, mark items as specials, and control availability.

### How to Use

#### Adding a New Menu Item

1. Click the **"Add Menu Item"** button (top right)
2. Fill in the form:
   - **Name (English)** * - Required
   - **Name (Arabic)** - Optional, for bilingual support
   - **Description (English)** - Describe the item
   - **Description (Arabic)** - Optional Arabic description
   - **Category** * - Select from: Breakfast, Lunch, Dinner, Beverages, Snacks, Desserts, Salads, Sandwiches, Specials
   - **Price (AED)** * - Set the price in UAE Dirhams
   - **Image URL** - Add a link to an image (optional)
   - **Prep Time** - Estimated preparation time in minutes
   - **Available for Order** - Toggle to show/hide from menu
   - **Special Item** - Mark as today's special
   - **Special Price** - Set discounted price for specials
   - **Dietary Information** - Click badges to add tags: Vegetarian, Vegan, Halal, Gluten-Free, Dairy-Free, Nut-Free

3. Click **"Create Menu Item"**

#### Editing a Menu Item

1. Find the item in the menu grid
2. Click the **Edit icon** (pencil) on the item card
3. Modify any fields
4. Click **"Update Menu Item"**

#### Deleting a Menu Item

1. Find the item in the menu grid
2. Click the **Delete icon** (trash) on the item card
3. Confirm deletion in the popup

#### Managing Availability

- **To hide an item temporarily**: Edit the item and turn off "Available for Order"
- **To show a hidden item**: Edit the item and turn on "Available for Order"

#### Setting Special Items

1. Edit the menu item
2. Turn on "Special Item" toggle
3. Optionally set a "Special Price" (if left empty, regular price is used)
4. Save changes

#### Searching and Filtering

- **Search**: Type in the search box to find items by name (English or Arabic)
- **Filter by Category**: Use the dropdown to show only specific categories

### Tips
- Use high-quality images for better customer appeal
- Set accurate prep times to help customers plan
- Use dietary tags to help customers with restrictions
- Mark popular items as specials to boost sales
- Keep descriptions clear and appetizing

---

## All Orders

**Location**: `/admin/orders`

### What It Does
View all customer orders (both active and completed) with full details.

### How to Use

1. Navigate to "All Orders" from the sidebar
2. View the complete order history
3. See order details including:
   - Customer information
   - Order items and quantities
   - Order status
   - Payment information
   - Timestamps

**Note**: This page shows the same Kitchen Display interface but includes completed orders. Use it for historical reference and order tracking.

---

## Customer Feedback

**Location**: `/admin/feedback`

### What It Does
Review and manage all customer feedback submissions, including ratings, comments, and suggestions.

### How to Use

#### Viewing Feedback

The dashboard shows:
- **Total Feedback** - All submissions
- **Pending** - New feedback awaiting review
- **Reviewed** - Feedback you've looked at
- **Resolved** - Issues that have been addressed

#### Filtering Feedback

1. **By Category**:
   - Food Quality
   - Service
   - Menu Suggestion
   - General

2. **By Status**:
   - Pending
   - Reviewed
   - Resolved
   - Dismissed

#### Managing Feedback

1. **View Details**:
   - Click "View" button on any feedback card
   - See full message, rating, related order (if any), and timestamps

2. **Update Status**:
   - For pending feedback, use the status dropdown
   - Change status to:
     - **Reviewed** - You've seen it
     - **Resolved** - Issue has been fixed
     - **Dismissed** - Not actionable

3. **In Detail View**:
   - Read the complete feedback message
   - See all metadata (date, order number, rating)
   - Update status directly from the dialog

### Feedback Status Workflow

```
Pending → Reviewed → Resolved
   ↓
Dismissed (if not actionable)
```

### Tips
- Review pending feedback daily
- Respond to low ratings (1-2 stars) promptly
- Use menu suggestions to improve offerings
- Mark resolved items to track improvements
- Dismiss spam or irrelevant feedback

---

## Analytics Dashboard

**Location**: `/admin/analytics`

### What It Does
View business insights, sales trends, popular items, and performance metrics.

### How to Use

#### Key Metrics

The dashboard displays three main metrics:
- **Total Revenue** - Total sales in AED
- **Total Orders** - Number of orders placed
- **Average Order Value** - Average amount per order

#### Date Range Selection

Use the dropdown to view:
- **Today** - Current day's data
- **Last 7 Days** - Week overview
- **Last 30 Days** - Month overview

#### Charts and Reports

1. **Revenue Over Time**
   - Line chart showing daily revenue trends
   - Export to CSV for external analysis

2. **Popular Items**
   - Top-selling menu items
   - Shows quantity sold and revenue generated
   - Export to CSV

3. **Peak Hours**
   - Bar chart showing order volume by hour
   - Identify busiest times
   - Export to CSV

4. **Order Trends**
   - Bar chart showing daily order volume
   - Track growth over time
   - Export to CSV

#### Exporting Data

Click "Export CSV" buttons to download data for:
- External analysis
- Reporting
- Spreadsheet applications

### Tips
- Check analytics regularly to spot trends
- Use peak hours data to optimize staffing
- Monitor popular items to ensure stock
- Track revenue trends to set goals
- Export data monthly for record-keeping

---

## Tips & Best Practices

### Daily Workflow

1. **Morning**:
   - Check Kitchen Display for early orders
   - Review any pending feedback
   - Check analytics from previous day

2. **During Service**:
   - Monitor Kitchen Display actively
   - Update order statuses promptly
   - Keep menu items available/updated

3. **End of Day**:
   - Review all feedback
   - Check analytics for the day
   - Update menu availability if needed

### Best Practices

1. **Order Management**:
   - Update statuses within 2-3 minutes of completion
   - Prioritize orders by pickup time
   - Check special instructions carefully

2. **Menu Management**:
   - Keep descriptions accurate
   - Update prices promptly
   - Mark sold-out items as unavailable
   - Use specials to promote slow-moving items

3. **Feedback Management**:
   - Respond to feedback within 24 hours
   - Address negative feedback personally
   - Use suggestions to improve menu

4. **Analytics**:
   - Review weekly trends
   - Identify popular items
   - Adjust menu based on data
   - Track growth over time

### Keyboard Shortcuts

- Use browser refresh (F5) to manually refresh data
- Use browser back/forward for navigation
- Tab key to navigate form fields

### Troubleshooting

**Orders not updating?**
- Check your internet connection
- Refresh the page
- Check browser console for errors

**Can't edit menu items?**
- Make sure you're logged in as admin
- Check that all required fields are filled
- Verify image URLs are valid

**Analytics showing old data?**
- Change date range and change back
- Refresh the page
- Check if data exists for selected period

---

## Quick Reference

### Order Status Flow
```
Received → Preparing → Ready → Completed
```

### Menu Item Required Fields
- Name (English)
- Category
- Price

### Feedback Status Options
- Pending
- Reviewed
- Resolved
- Dismissed

### Available Categories
- Breakfast
- Lunch
- Dinner
- Beverages
- Snacks
- Desserts
- Salads
- Sandwiches
- Specials

---

## Need Help?

If you encounter issues:
1. Check `ADMIN_ACCESS.md` for access problems
2. Review `TROUBLESHOOTING.md` for common issues
3. Check browser console for error messages
4. Verify you're logged in with admin account

---

**Happy managing! 🎉**


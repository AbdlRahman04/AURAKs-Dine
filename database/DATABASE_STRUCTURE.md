# QuickDineFlow MySQL Database Structure

## Overview

This document describes the MySQL database structure for the QuickDineFlow application. The database consists of 9 main tables that support user management, menu browsing, ordering, payments, and administrative functions.

## Database Schema Diagram

```
┌─────────────┐
│   users     │
│─────────────│
│ id (PK)     │
│ email       │
│ password    │
│ first_name  │
│ last_name   │
│ student_id  │
│ role        │
│ ...         │
└──────┬──────┘
       │
       ├─────────────────┬──────────────────┬─────────────────┬──────────────────┐
       │                 │                  │                 │                  │
┌──────▼──────┐  ┌───────▼──────┐  ┌───────▼──────┐  ┌───────▼──────┐  ┌───────▼──────┐
│   orders    │  │  favorites   │  │ audit_logs   │  │  feedback    │  │payment_method│
│─────────────│  │──────────────│  │──────────────│  │──────────────│  │──────────────│
│ id (PK)     │  │ id (PK)      │  │ id (PK)      │  │ id (PK)      │  │ id (PK)      │
│ user_id (FK)│  │ user_id (FK) │  │ user_id (FK) │  │ user_id (FK) │  │ user_id (FK) │
│ order_number│  │ menu_item_id │  │ action       │  │ order_id (FK)│  │ stripe_pm_id │
│ status      │  │ created_at   │  │ entity_type  │  │ category     │  │ card_brand   │
│ ...         │  └──────┬───────┘  │ ...          │  │ message      │  │ ...          │
└──────┬──────┘         │          └──────────────┘  │ rating       │  └──────────────┘
       │                │                            │ ...          │
       │                │                            └──────────────┘
       │                │
       │        ┌───────▼──────┐
       │        │ menu_items   │
       │        │──────────────│
       │        │ id (PK)      │
       │        │ name         │
       │        │ name_ar      │
       │        │ price        │
       │        │ category     │
       │        │ ...          │
       │        └──────┬───────┘
       │               │
       │        ┌──────▼──────┐
       │        │order_items  │
       │        │─────────────│
       │        │ id (PK)     │
       │        │ order_id(FK)│
       │        │ menu_item_id│
       │        │ quantity    │
       │        │ unit_price  │
       │        │ ...         │
       │        └─────────────┘
       │
┌──────▼──────┐
│  sessions   │
│─────────────│
│ sid (PK)    │
│ sess (JSON) │
│ expire      │
└─────────────┘
```

## Tables Description

### 1. `users`
**Purpose**: Stores user accounts (students and administrators)

**Key Fields**:
- `id` (VARCHAR(36), PK): Unique user identifier (UUID)
- `email` (VARCHAR(255), UNIQUE): User email address
- `password` (VARCHAR(255)): Hashed password (null for OAuth users)
- `student_id` (VARCHAR(10), UNIQUE): 10-digit student ID
- `role` (VARCHAR(20)): 'student' or 'admin'
- `dietary_restrictions` (JSON): Array of dietary preferences
- `allergies` (JSON): Array of allergen information

**Relationships**:
- One-to-many with `orders`
- One-to-many with `favorites`
- One-to-many with `audit_logs`
- One-to-many with `feedback`
- One-to-many with `payment_methods`

### 2. `sessions`
**Purpose**: Stores session data for authentication

**Key Fields**:
- `sid` (VARCHAR(255), PK): Session ID
- `sess` (JSON): Session data
- `expire` (TIMESTAMP): Session expiration time

### 3. `menu_items`
**Purpose**: Stores menu items with bilingual support

**Key Fields**:
- `id` (INT, PK, AUTO_INCREMENT): Menu item identifier
- `name` (VARCHAR(255)): English name
- `name_ar` (VARCHAR(255)): Arabic name
- `description` (TEXT): English description
- `description_ar` (TEXT): Arabic description
- `price` (DECIMAL(10,2)): Base price
- `category` (VARCHAR(50)): breakfast, lunch, snacks, beverages
- `is_available` (BOOLEAN): Real-time availability status
- `is_special` (BOOLEAN): Daily special flag
- `special_price` (DECIMAL(10,2)): Promotional price
- `nutritional_info` (JSON): Nutritional data
- `allergens` (JSON): Array of allergens
- `dietary_tags` (JSON): Array of dietary tags
- `size_variants` (JSON): Size options with price modifiers

**Relationships**:
- One-to-many with `order_items`
- One-to-many with `favorites`

### 4. `orders`
**Purpose**: Stores customer orders

**Key Fields**:
- `id` (INT, PK, AUTO_INCREMENT): Order identifier
- `user_id` (VARCHAR(36), FK): Reference to users table
- `order_number` (VARCHAR(50), UNIQUE): Unique order number
- `status` (VARCHAR(20)): received, preparing, ready, completed, cancelled
- `pickup_time` (TIMESTAMP): Scheduled pickup time
- `subtotal` (DECIMAL(10,2)): Order subtotal
- `tax` (DECIMAL(10,2)): Tax amount
- `total` (DECIMAL(10,2)): Total amount
- `payment_method` (VARCHAR(20)): card or cash
- `payment_status` (VARCHAR(20)): pending, completed, failed

**Relationships**:
- Many-to-one with `users`
- One-to-many with `order_items`
- One-to-many with `feedback`

### 5. `order_items`
**Purpose**: Stores individual items within an order

**Key Fields**:
- `id` (INT, PK, AUTO_INCREMENT): Order item identifier
- `order_id` (INT, FK): Reference to orders table
- `menu_item_id` (INT, FK): Reference to menu_items table
- `menu_item_name` (VARCHAR(255)): Snapshot of item name at order time
- `quantity` (INT): Item quantity
- `unit_price` (DECIMAL(10,2)): Price at order time
- `selected_size` (VARCHAR(50)): Selected size variant
- `customizations` (TEXT): Customization options
- `subtotal` (DECIMAL(10,2)): Line item total

**Relationships**:
- Many-to-one with `orders`
- Many-to-one with `menu_items`

### 6. `favorites`
**Purpose**: Stores user favorite menu items

**Key Fields**:
- `id` (INT, PK, AUTO_INCREMENT): Favorite identifier
- `user_id` (VARCHAR(36), FK): Reference to users table
- `menu_item_id` (INT, FK): Reference to menu_items table
- `created_at` (TIMESTAMP): When item was favorited

**Relationships**:
- Many-to-one with `users`
- Many-to-one with `menu_items`
- Unique constraint on (user_id, menu_item_id)

### 7. `audit_logs`
**Purpose**: Logs administrative actions for audit trail

**Key Fields**:
- `id` (INT, PK, AUTO_INCREMENT): Log entry identifier
- `user_id` (VARCHAR(36), FK): Admin user who performed action
- `action` (VARCHAR(100)): Action performed (e.g., created_menu_item)
- `entity_type` (VARCHAR(50)): Type of entity affected
- `entity_id` (VARCHAR(50)): ID of affected entity
- `details` (JSON): Additional action details
- `created_at` (TIMESTAMP): When action was performed

**Relationships**:
- Many-to-one with `users`

### 8. `feedback`
**Purpose**: Stores customer feedback and menu suggestions

**Key Fields**:
- `id` (INT, PK, AUTO_INCREMENT): Feedback identifier
- `user_id` (VARCHAR(36), FK): User who submitted feedback
- `order_id` (INT, FK, NULL): Related order (optional)
- `category` (VARCHAR(50)): food_quality, service, menu_suggestion, general
- `message` (TEXT): Feedback message
- `rating` (INT): 1-5 star rating (optional)
- `status` (VARCHAR(20)): pending, reviewed, resolved, dismissed
- `admin_response` (TEXT): Admin's response to feedback

**Relationships**:
- Many-to-one with `users`
- Many-to-one with `orders` (optional)

### 9. `payment_methods`
**Purpose**: Stores saved payment methods for users

**Key Fields**:
- `id` (INT, PK, AUTO_INCREMENT): Payment method identifier
- `user_id` (VARCHAR(36), FK): Reference to users table
- `stripe_payment_method_id` (VARCHAR(255)): Stripe payment method ID
- `card_brand` (VARCHAR(50)): visa, mastercard, amex, etc.
- `card_last4` (VARCHAR(4)): Last 4 digits of card
- `card_exp_month` (INT): Card expiration month
- `card_exp_year` (INT): Card expiration year
- `is_default` (BOOLEAN): Default payment method flag

**Relationships**:
- Many-to-one with `users`

## Key Design Decisions

### 1. JSON Fields for Arrays
- MySQL doesn't have native array types like PostgreSQL
- Arrays are stored as JSON (e.g., `dietary_restrictions`, `allergies`, `dietary_tags`)
- Use `JSON_EXTRACT()` or `JSON_UNQUOTE()` when querying

### 2. UUID Generation
- User IDs use UUID() function
- Trigger automatically generates UUID if not provided during INSERT
- Ensures unique identifiers across distributed systems

### 3. Character Encoding
- Database uses `utf8mb4` encoding
- Supports emojis and special characters
- Essential for Arabic text support

### 4. Timestamps
- `created_at`: Set automatically on INSERT
- `updated_at`: Updated automatically on UPDATE
- Uses `CURRENT_TIMESTAMP` for MySQL compatibility

### 5. Foreign Key Constraints
- CASCADE deletes for dependent records
- SET NULL for optional relationships (e.g., feedback.order_id)
- Ensures referential integrity

## Indexes

The database includes indexes on:
- Primary keys (automatic)
- Foreign keys
- Frequently queried fields (email, order_number, status, etc.)
- Composite indexes for common query patterns

## Data Types Mapping (PostgreSQL → MySQL)

| PostgreSQL | MySQL | Notes |
|------------|-------|-------|
| SERIAL | INT AUTO_INCREMENT | Auto-incrementing integer |
| VARCHAR | VARCHAR | Same, but MySQL requires length |
| TEXT | TEXT | Same |
| JSONB | JSON | MySQL uses JSON type |
| TEXT[] | JSON | Arrays stored as JSON |
| BOOLEAN | BOOLEAN | Same |
| DECIMAL(10,2) | DECIMAL(10,2) | Same |
| TIMESTAMP | TIMESTAMP | Same |
| gen_random_uuid() | UUID() | Different function name |

## Sample Queries

### Get user with orders
```sql
SELECT u.*, o.id as order_id, o.order_number, o.total
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.email = 'user@example.com';
```

### Get menu items with availability
```sql
SELECT id, name, name_ar, price, category, is_available
FROM menu_items
WHERE is_available = TRUE
ORDER BY category, name;
```

### Get order with items
```sql
SELECT o.*, oi.menu_item_name, oi.quantity, oi.unit_price, oi.subtotal
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
WHERE o.order_number = 'ORD-12345';
```

### Get user favorites
```sql
SELECT mi.*, f.created_at as favorited_at
FROM favorites f
JOIN menu_items mi ON f.menu_item_id = mi.id
WHERE f.user_id = 'user-uuid-here';
```

## Maintenance

### Backup
```bash
mysqldump -u root -p quickdineflow > backup.sql
```

### Restore
```bash
mysql -u root -p quickdineflow < backup.sql
```

### Check Table Sizes
```sql
SELECT 
    table_name AS 'Table',
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.TABLES
WHERE table_schema = 'quickdineflow'
ORDER BY (data_length + index_length) DESC;
```


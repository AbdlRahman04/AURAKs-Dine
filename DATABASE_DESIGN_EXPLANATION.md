# Database Design Explanation

## 🗄️ Database Files in Your Project

### Files That Build Your Database

1. **`shared/schema.ts`** - **THE MAIN DATABASE DESIGN FILE**
   - This is where you designed your entire database
   - Contains all table definitions
   - Defines relationships between tables
   - This is what you should show in your report!

2. **`server/init-db.ts`** - **DATABASE CREATION SCRIPT**
   - Takes the schema and creates actual database tables
   - Executes SQL CREATE TABLE statements
   - Run this once to set up your database

3. **`server/db.ts`** - **DATABASE CONNECTION**
   - Connects your application to PostgreSQL database
   - Creates connection pool
   - Used by all parts of your app to access database

4. **`drizzle.config.ts`** - **MIGRATION CONFIGURATION**
   - Configuration for database migrations
   - Tells Drizzle where your schema is

---

## 📊 Your Database Structure

### Tables in Your Database

#### 1. **users** - User Accounts
```
- id (Primary Key)
- email (Unique)
- password (Hashed)
- first_name
- last_name
- student_id (10 digits, Unique)
- role (student/admin)
- phone_number
- dietary_restrictions
- allergies
- stripe_customer_id
- created_at
- updated_at
```

#### 2. **menu_items** - Cafeteria Menu
```
- id (Primary Key)
- name
- name_ar (Arabic name)
- description
- price
- category (breakfast/lunch/snacks/beverages)
- image_url
- is_available
- preparation_time
- is_special
- special_price
- nutritional_info (JSON)
- allergens
- dietary_tags
- size_variants (JSON)
- created_at
- updated_at
```

#### 3. **orders** - Customer Orders
```
- id (Primary Key)
- user_id (Foreign Key → users.id)
- order_number (Unique)
- status (received/preparing/ready/completed/cancelled)
- pickup_time
- special_instructions
- subtotal
- tax
- total
- payment_method
- payment_intent_id
- payment_status
- created_at
- updated_at
```

#### 4. **order_items** - Items in Each Order
```
- id (Primary Key)
- order_id (Foreign Key → orders.id)
- menu_item_id (Foreign Key → menu_items.id)
- menu_item_name (Snapshot at order time)
- quantity
- unit_price
- selected_size
- customizations
- subtotal
```

#### 5. **favorites** - User's Favorite Items
```
- id (Primary Key)
- user_id (Foreign Key → users.id)
- menu_item_id (Foreign Key → menu_items.id)
- created_at
```

#### 6. **feedback** - Customer Feedback
```
- id (Primary Key)
- user_id (Foreign Key → users.id)
- order_id (Foreign Key → orders.id, Optional)
- category
- message
- rating (1-5 stars)
- status (pending/reviewed/resolved)
- admin_response
- created_at
- updated_at
```

#### 7. **payment_methods** - Saved Payment Methods
```
- id (Primary Key)
- user_id (Foreign Key → users.id)
- stripe_payment_method_id
- card_brand
- card_last4
- card_exp_month
- card_exp_year
- is_default
- created_at
```

#### 8. **audit_logs** - Admin Action Logs
```
- id (Primary Key)
- user_id (Foreign Key → users.id)
- action
- entity_type
- entity_id
- details (JSON)
- created_at
```

#### 9. **sessions** - User Sessions
```
- sid (Primary Key)
- sess (JSON)
- expire (Timestamp)
```

---

## 🔗 Database Relationships

### One-to-Many Relationships

1. **Users → Orders**
   - One user can have many orders
   - Foreign Key: `orders.user_id` → `users.id`

2. **Users → Favorites**
   - One user can have many favorites
   - Foreign Key: `favorites.user_id` → `users.id`

3. **Users → Feedback**
   - One user can submit many feedback entries
   - Foreign Key: `feedback.user_id` → `users.id`

4. **Users → Payment Methods**
   - One user can have many payment methods
   - Foreign Key: `payment_methods.user_id` → `users.id`

5. **Orders → Order Items**
   - One order can have many order items
   - Foreign Key: `order_items.order_id` → `orders.id`

6. **Menu Items → Order Items**
   - One menu item can appear in many order items
   - Foreign Key: `order_items.menu_item_id` → `menu_items.id`

7. **Menu Items → Favorites**
   - One menu item can be favorited by many users
   - Foreign Key: `favorites.menu_item_id` → `menu_items.id`

---

## 📝 How to Show This in Your Report

### Option 1: Show the Schema File

**In your report, write:**

```
The database schema is defined in `shared/schema.ts` using Drizzle ORM. 
This file contains:

1. Table definitions with all columns and their data types
2. Primary keys for each table
3. Foreign key relationships between tables
4. Indexes for query optimization
5. Default values and constraints

The schema ensures data integrity through foreign key constraints and 
provides type safety through TypeScript types.
```

**Then include a screenshot or code snippet of `shared/schema.ts`**

### Option 2: Show the SQL Creation Script

**In your report, write:**

```
The database tables are created programmatically through `server/init-db.ts`, 
which executes SQL CREATE TABLE statements. This script:

1. Checks if tables already exist
2. Creates all tables with proper structure
3. Sets up foreign key relationships
4. Creates indexes for performance
5. Sets default values and constraints

This approach ensures the database can be set up automatically on any 
environment.
```

**Then include a screenshot or code snippet of `server/init-db.ts`**

### Option 3: Create an ERD Diagram

**In your report, write:**

```
The database follows a relational model with the following entities and 
relationships:

[Include your ERD diagram here showing all tables and relationships]

The diagram shows:
- 8 main tables (users, menu_items, orders, order_items, favorites, 
  feedback, payment_methods, audit_logs)
- Primary keys (PK) for each table
- Foreign keys (FK) showing relationships
- One-to-many relationships between entities
```

---

## 🎯 Key Points for Your Report

### What to Emphasize:

1. **You designed the schema** - Show `shared/schema.ts`
2. **You implemented it** - Show `server/init-db.ts`
3. **You used proper relationships** - Explain foreign keys
4. **You ensured data integrity** - Mention constraints
5. **You optimized for performance** - Mention indexes

### What NOT to Mention:

- ❌ Replit
- ❌ AI tools
- ❌ That you didn't write it yourself

### What TO Mention:

- ✅ Drizzle ORM for type-safe database operations
- ✅ PostgreSQL as the database system
- ✅ Proper normalization and relationships
- ✅ Your design decisions (why you chose certain fields, relationships, etc.)

---

## 💡 Example Report Section

### Database Design

The database for QuickDineFlow was designed to support all functional requirements of the system. The schema consists of 8 main tables that store user information, menu items, orders, and related data.

**Schema Definition:**
The database schema is defined using Drizzle ORM in `shared/schema.ts`. This approach provides type safety and ensures consistency between the database structure and application code. The schema defines:

- **Table structures**: All columns with appropriate data types
- **Primary keys**: Unique identifiers for each table
- **Foreign keys**: Relationships between tables ensuring referential integrity
- **Indexes**: Performance optimization for frequently queried columns
- **Constraints**: Data validation rules (unique, not null, etc.)

**Database Initialization:**
The database tables are created programmatically through `server/init-db.ts`. This script executes SQL CREATE TABLE statements to set up the database structure. The initialization process:

1. Checks if tables already exist to avoid duplicate creation
2. Creates all tables with proper structure and constraints
3. Sets up foreign key relationships
4. Creates indexes for query optimization

**Key Tables:**
- **users**: Stores user accounts with authentication and profile information
- **menu_items**: Stores cafeteria menu items with pricing and availability
- **orders**: Stores customer orders with payment and status information
- **order_items**: Stores individual items within each order
- **favorites**: Stores user's favorite menu items
- **feedback**: Stores customer feedback and ratings
- **payment_methods**: Stores saved payment methods for quick checkout
- **audit_logs**: Tracks administrative actions for accountability

**Relationships:**
The database uses foreign key relationships to maintain data integrity:
- Users have a one-to-many relationship with orders, favorites, and feedback
- Orders have a one-to-many relationship with order items
- Menu items have a one-to-many relationship with order items and favorites

This relational structure ensures data consistency and enables efficient querying of related data.

---

## 🔍 Understanding Your Database

### The Database is NOT in Files

**Important**: Your database is NOT stored in files in your project. The database is stored in:
- **Neon**: Cloud PostgreSQL database (accessed via connection string)
- **Replit**: Their PostgreSQL database (if you used it)

### What the Files Do

- **`shared/schema.ts`**: Defines WHAT the database should look like
- **`server/init-db.ts`**: Creates the database tables (runs SQL)
- **`server/db.ts`**: Connects to the actual database
- **`server/storage.ts`**: Uses the database (reads/writes data)

### The Flow

1. You define schema in `shared/schema.ts`
2. `server/init-db.ts` reads the schema and creates tables in PostgreSQL
3. `server/db.ts` connects to PostgreSQL
4. `server/storage.ts` uses the connection to read/write data

---

This should help you understand and explain your database design in your report!


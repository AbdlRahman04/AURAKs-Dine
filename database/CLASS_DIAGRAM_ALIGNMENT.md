# Class Diagram to Database Schema Alignment

This document maps the UML Class Diagram entities to the MySQL database tables.

## Class Diagram → Database Table Mapping

### ✅ Core User Management

| Class Diagram | Database Table | Status | Notes |
|--------------|----------------|--------|-------|
| **User** (abstract) | `users` | ✅ Aligned | Single table with `role` field (student/admin) |
| **Admin** | `users` (role='admin') | ✅ Aligned | Stored in same table, differentiated by role |
| **Student** | `users` (role='student') | ✅ Aligned | Includes `student_id` field matching class diagram |

**Class Diagram Attributes:**
- `userId` → `users.id` (VARCHAR(36), UUID)
- `name` → `users.first_name` + `users.last_name`
- `email` → `users.email`
- `passwordHash` → `users.password`
- `role` → `users.role`
- `language` → Not in DB (handled in session/frontend)
- `themePreference` → Not in DB (handled in session/frontend)
- `studentId` → `users.student_id` (for Student only)

### ✅ Menu Management

| Class Diagram | Database Table | Status | Notes |
|--------------|----------------|--------|-------|
| **Menu** | `menu_items` (via category/date filtering) | ✅ Aligned | Menu is a logical grouping, not a separate table |
| **MenuItem** | `menu_items` | ✅ Aligned | All attributes present |

**MenuItem Attributes Mapping:**
- `itemId` → `menu_items.id`
- `name` → `menu_items.name` + `menu_items.name_ar` (bilingual)
- `description` → `menu_items.description` + `menu_items.description_ar`
- `price` → `menu_items.price`
- `category` → `menu_items.category`
- `image` → `menu_items.image_url`
- `isAvailable` → `menu_items.is_available`
- `prepTime` → `menu_items.preparation_time`
- `nutritionInfo` → `menu_items.nutritional_info` (JSON)
- `allergens` → `menu_items.allergens` (JSON array)
- `isSpecial` → `menu_items.is_special`
- `specialPrice` → `menu_items.special_price`

### ✅ Order Management

| Class Diagram | Database Table | Status | Notes |
|--------------|----------------|--------|-------|
| **Order** | `orders` | ✅ Aligned | All attributes present |
| **OrderItem** | `order_items` | ✅ Aligned | All attributes present |
| **Cart** | Not stored (session-based) | ✅ Aligned | Cart is temporary, stored in frontend/session |

**Order Attributes Mapping:**
- `orderId` → `orders.id`
- `orderNumber` → `orders.order_number`
- `orderDate` → `orders.created_at`
- `status` → `orders.status`
- `pickupTime` → `orders.pickup_time`
- `specialInstructions` → `orders.special_instructions`
- `totalAmount` → `orders.total`

**OrderItem Attributes Mapping:**
- `quantity` → `order_items.quantity`
- `size` → `order_items.selected_size`
- `price` → `order_items.unit_price`

### ✅ Payment

| Class Diagram | Database Table | Status | Notes |
|--------------|----------------|--------|-------|
| **Payment** | `orders` (payment fields) + `payment_methods` | ✅ Aligned | Payment info split between orders and saved methods |

**Payment Attributes:**
- `paymentId` → `orders.id` (payment tied to order)
- `method` → `orders.payment_method`
- `amount` → `orders.total`
- `paymentStatus` → `orders.payment_status`
- Saved payment methods → `payment_methods` table

### ✅ User Features

| Class Diagram | Database Table | Status | Notes |
|--------------|----------------|--------|-------|
| **Favorite** | `favorites` | ✅ Aligned | Exact match |
| **Feedback** | `feedback` | ✅ Aligned | Enhanced with more fields |

**Favorite Attributes:**
- `favoriteId` → `favorites.id`
- Relationship to MenuItem → `favorites.menu_item_id`
- Relationship to Student → `favorites.user_id`

**Feedback Attributes:**
- `feedbackId` → `feedback.id`
- `rating` → `feedback.rating`
- `comment` → `feedback.message`
- `status` → `feedback.status`
- Additional: `feedback.category`, `feedback.admin_response`, `feedback.order_id`

### ⚠️ Additional Tables (Not in Class Diagram)

These tables exist in the database but aren't explicitly shown in the class diagram:

| Database Table | Purpose | Status |
|----------------|---------|--------|
| `sessions` | Session storage for authentication | ✅ Needed for implementation |
| `audit_logs` | Admin action tracking | ✅ Needed for NFR-28 (audit trail) |

### ⚠️ Class Diagram Entities (Not in Database)

These are handled differently in the implementation:

| Class Diagram | Implementation | Status |
|--------------|----------------|--------|
| **RealtimeService** | WebSocket service (no DB table) | ✅ Correct - service layer, not data |
| **Notification** | In-memory/WebSocket (no DB table) | ✅ Correct - real-time, not persisted |
| **Report** | Generated on-demand (no DB table) | ✅ Correct - computed, not stored |
| **Cart** | Session/frontend state (no DB table) | ✅ Correct - temporary data |

## Relationship Mapping

### Class Diagram Relationships → Database Foreign Keys

1. **Student → Order** (1-to-many)
   - ✅ `orders.user_id` → `users.id` (FK)

2. **Order → OrderItem** (1-to-many)
   - ✅ `order_items.order_id` → `orders.id` (FK)

3. **OrderItem → MenuItem** (many-to-1)
   - ✅ `order_items.menu_item_id` → `menu_items.id` (FK)

4. **Student → Favorite** (1-to-many)
   - ✅ `favorites.user_id` → `users.id` (FK)

5. **Favorite → MenuItem** (many-to-1)
   - ✅ `favorites.menu_item_id` → `menu_items.id` (FK)

6. **Student → Feedback** (1-to-many)
   - ✅ `feedback.user_id` → `users.id` (FK)

7. **Order → Payment** (1-to-1)
   - ✅ Payment data stored in `orders` table (payment_method, payment_status, payment_intent_id)

8. **Admin → Report** (1-to-many)
   - ✅ Reports generated on-demand, not stored (correct approach)

9. **Order → Notification** (1-to-many)
   - ✅ Notifications sent via WebSocket, not persisted (correct approach)

## Summary

### ✅ Fully Aligned
- User/Admin/Student hierarchy
- MenuItem structure
- Order and OrderItem relationships
- Favorite system
- Feedback system
- Payment information

### ✅ Enhanced Beyond Class Diagram
- Bilingual support (Arabic fields)
- Audit logging
- Session management
- Saved payment methods
- More detailed feedback tracking

### ✅ Correctly Implemented as Services (Not Tables)
- RealtimeService (WebSocket)
- Notification (real-time messaging)
- Report (on-demand generation)
- Cart (session-based)

## Conclusion

The MySQL database schema **fully supports** all entities and relationships shown in the class diagram, with additional enhancements for production requirements. The schema is properly normalized and includes all necessary foreign key relationships.


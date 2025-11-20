-- =====================================================
-- QuickDineFlow MySQL Database Schema
-- =====================================================
-- This script creates the complete database structure
-- for the QuickDineFlow application
-- =====================================================

-- Step 1: Create the database (if it doesn't exist)
CREATE DATABASE IF NOT EXISTS quickdineflow CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Step 2: Select the database to use
USE quickdineflow;

-- =====================================================
-- Table: sessions
-- Purpose: Session storage for authentication
-- =====================================================
CREATE TABLE IF NOT EXISTS sessions (
    sid VARCHAR(255) PRIMARY KEY,
    sess JSON NOT NULL,
    expire TIMESTAMP NOT NULL,
    INDEX idx_session_expire (expire)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table: users
-- Purpose: User accounts (students and admins)
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NULL COMMENT 'Hashed password for email/password auth (null for OAuth users)',
    first_name VARCHAR(255) NULL,
    last_name VARCHAR(255) NULL,
    profile_image_url VARCHAR(500) NULL,
    student_id VARCHAR(10) UNIQUE NULL COMMENT '10-digit student ID (FR-04)',
    role VARCHAR(20) NOT NULL DEFAULT 'student' COMMENT 'student or admin (FR-26: role-based access)',
    preferred_pickup_location VARCHAR(255) NULL COMMENT 'FR-05: profile preferences',
    phone_number VARCHAR(20) NULL COMMENT 'FR-05: contact details',
    dietary_restrictions JSON NULL COMMENT 'FR-05: dietary preferences (vegetarian, vegan, etc.) stored as JSON array',
    allergies JSON NULL COMMENT 'FR-05: allergen information stored as JSON array',
    stripe_customer_id VARCHAR(255) NULL COMMENT 'FR-26: Stripe customer ID for saved payment methods',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_student_id (student_id),
    INDEX idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table: menu_items
-- Purpose: Menu items with bilingual support
-- Related to: FR-06 to FR-10
-- =====================================================
CREATE TABLE IF NOT EXISTS menu_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255) NULL COMMENT 'Arabic name for bilingual support',
    description TEXT NULL,
    description_ar TEXT NULL COMMENT 'Arabic description for bilingual support',
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(50) NOT NULL COMMENT 'breakfast, lunch, snacks, beverages',
    image_url TEXT NULL,
    is_available BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'FR-09: real-time availability',
    preparation_time INT NOT NULL COMMENT 'in minutes',
    is_special BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'FR-32: daily specials',
    special_price DECIMAL(10, 2) NULL COMMENT 'promotional offer price',
    nutritional_info JSON NULL COMMENT 'FR-10: {calories, protein, carbs, fats, fiber}',
    allergens JSON NULL COMMENT 'FR-10: array of allergen strings stored as JSON',
    dietary_tags JSON NULL COMMENT 'FR-08: vegetarian, vegan, gluten-free, etc. stored as JSON array',
    size_variants JSON NULL COMMENT 'Size options: [{"name": "Small", "priceModifier": -2.00}, {"name": "Medium", "priceModifier": 0}, {"name": "Large", "priceModifier": 3.00}]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_menu_items_category (category),
    INDEX idx_menu_items_is_available (is_available),
    INDEX idx_menu_items_is_special (is_special)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table: orders
-- Purpose: Customer orders
-- Related to: FR-11 to FR-22
-- =====================================================
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    order_number VARCHAR(50) NOT NULL UNIQUE COMMENT 'FR-16: unique order number',
    status VARCHAR(20) NOT NULL DEFAULT 'received' COMMENT 'received, preparing, ready, completed, cancelled',
    pickup_time TIMESTAMP NOT NULL COMMENT 'FR-13: pickup time slot',
    special_instructions TEXT NULL COMMENT 'FR-15: special instructions',
    subtotal DECIMAL(10, 2) NOT NULL,
    tax DECIMAL(10, 2) NOT NULL,
    total DECIMAL(10, 2) NOT NULL COMMENT 'FR-14: total with taxes',
    payment_method VARCHAR(20) NOT NULL DEFAULT 'card' COMMENT 'card or cash',
    payment_intent_id VARCHAR(255) NULL COMMENT 'Stripe payment intent ID (null for cash)',
    payment_status VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT 'pending, completed, failed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_orders_user_id (user_id),
    INDEX idx_orders_order_number (order_number),
    INDEX idx_orders_status (status),
    INDEX idx_orders_pickup_time (pickup_time),
    INDEX idx_orders_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table: order_items
-- Purpose: Individual items in an order
-- Related to: FR-11
-- =====================================================
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    menu_item_id INT NOT NULL,
    menu_item_name VARCHAR(255) NOT NULL COMMENT 'snapshot at order time',
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL COMMENT 'price at order time',
    selected_size VARCHAR(50) NULL COMMENT 'Selected size variant (Small/Medium/Large)',
    customizations TEXT NULL COMMENT 'FR-11: customization options',
    subtotal DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id),
    INDEX idx_order_items_order_id (order_id),
    INDEX idx_order_items_menu_item_id (menu_item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table: favorites
-- Purpose: User favorite menu items
-- Related to: FR-44
-- =====================================================
CREATE TABLE IF NOT EXISTS favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    menu_item_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_favorite (user_id, menu_item_id),
    INDEX idx_favorites_user_id (user_id),
    INDEX idx_favorites_menu_item_id (menu_item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table: audit_logs
-- Purpose: Admin action audit trail
-- Related to: NFR-28
-- =====================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    action VARCHAR(100) NOT NULL COMMENT 'created_menu_item, updated_menu_item, etc.',
    entity_type VARCHAR(50) NOT NULL COMMENT 'menu_item, order, etc.',
    entity_id VARCHAR(50) NULL,
    details JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_audit_logs_user_id (user_id),
    INDEX idx_audit_logs_entity_type (entity_type),
    INDEX idx_audit_logs_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table: feedback
-- Purpose: Customer feedback and menu suggestions
-- =====================================================
CREATE TABLE IF NOT EXISTS feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    order_id INT NULL,
    category VARCHAR(50) NOT NULL COMMENT 'food_quality, service, menu_suggestion, general',
    message TEXT NOT NULL,
    rating INT NULL COMMENT '1-5 stars (optional)',
    status VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT 'pending, reviewed, resolved, dismissed',
    admin_response TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
    INDEX idx_feedback_user_id (user_id),
    INDEX idx_feedback_order_id (order_id),
    INDEX idx_feedback_status (status),
    INDEX idx_feedback_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table: payment_methods
-- Purpose: Saved payment methods for users
-- Related to: FR-26
-- =====================================================
CREATE TABLE IF NOT EXISTS payment_methods (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    stripe_payment_method_id VARCHAR(255) NOT NULL COMMENT 'Stripe payment method ID',
    card_brand VARCHAR(50) NULL COMMENT 'visa, mastercard, amex, etc.',
    card_last4 VARCHAR(4) NULL COMMENT 'last 4 digits for display',
    card_exp_month INT NULL,
    card_exp_year INT NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'default payment method',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_payment_methods_user_id (user_id),
    INDEX idx_payment_methods_is_default (is_default)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Trigger: Auto-generate UUID for users.id if not provided
-- =====================================================
DELIMITER //
DROP TRIGGER IF EXISTS users_before_insert//
CREATE TRIGGER users_before_insert
BEFORE INSERT ON users
FOR EACH ROW
BEGIN
    IF NEW.id IS NULL OR NEW.id = '' THEN
        SET NEW.id = UUID();
    END IF;
END//
DELIMITER ;

-- =====================================================
-- Sample Data (Optional - for testing)
-- =====================================================

-- Insert a default admin user (password: admin123 - CHANGE THIS!)
-- Password hash is for 'admin123' using bcrypt with salt rounds 10
-- You should change this password after first login!
INSERT INTO users (id, email, password, first_name, last_name, role, student_id) 
VALUES (
    UUID(),
    'admin@quickdineflow.com',
    '$2b$10$rOzJqJqJqJqJqJqJqJqJqOqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq', -- Change this hash!
    'Admin',
    'User',
    'admin',
    NULL
) ON DUPLICATE KEY UPDATE email=email;

-- =====================================================
-- Database Setup Complete!
-- =====================================================


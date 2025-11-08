import "dotenv/config";
import { db } from "./db";
import * as schema from "@shared/schema";
import { sql } from "drizzle-orm";

async function initDatabase() {
  console.log("Initializing database...");
  
  try {
    // Check if users table exists
    const tableCheck = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    const tableExists = (tableCheck.rows[0] as any)?.exists;
    
    if (tableExists) {
      console.log("✓ Database tables already exist");
      return;
    }
    
    console.log("Database tables not found. Creating tables...");
    
    // Create users table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR UNIQUE NOT NULL,
        password VARCHAR,
        first_name VARCHAR,
        last_name VARCHAR,
        profile_image_url VARCHAR,
        student_id VARCHAR(8) UNIQUE,
        role VARCHAR(20) NOT NULL DEFAULT 'student',
        preferred_pickup_location VARCHAR,
        phone_number VARCHAR,
        dietary_restrictions TEXT[],
        allergies TEXT[],
        stripe_customer_id VARCHAR,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // Create sessions table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS sessions (
        sid VARCHAR PRIMARY KEY,
        sess JSONB NOT NULL,
        expire TIMESTAMP NOT NULL
      );
      CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions(expire);
    `);
    
    // Create menu_items table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS menu_items (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        name_ar VARCHAR(255),
        description TEXT,
        description_ar TEXT,
        price DECIMAL(10, 2) NOT NULL,
        category VARCHAR(50) NOT NULL,
        image_url TEXT,
        is_available BOOLEAN NOT NULL DEFAULT true,
        preparation_time INTEGER NOT NULL,
        is_special BOOLEAN NOT NULL DEFAULT false,
        special_price DECIMAL(10, 2),
        nutritional_info JSONB,
        allergens TEXT[],
        dietary_tags TEXT[],
        size_variants JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // Create orders table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        order_number VARCHAR(50) NOT NULL UNIQUE,
        status VARCHAR(20) NOT NULL DEFAULT 'received',
        pickup_time TIMESTAMP NOT NULL,
        special_instructions TEXT,
        subtotal DECIMAL(10, 2) NOT NULL,
        tax DECIMAL(10, 2) NOT NULL,
        total DECIMAL(10, 2) NOT NULL,
        payment_method VARCHAR(20) NOT NULL DEFAULT 'card',
        payment_intent_id VARCHAR,
        payment_status VARCHAR(20) NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // Create order_items table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        menu_item_id INTEGER NOT NULL REFERENCES menu_items(id),
        menu_item_name VARCHAR(255) NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price DECIMAL(10, 2) NOT NULL,
        selected_size VARCHAR(50),
        customizations TEXT,
        subtotal DECIMAL(10, 2) NOT NULL
      );
    `);
    
    // Create favorites table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS favorites (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        menu_item_id INTEGER NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // Create audit_logs table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR NOT NULL REFERENCES users(id),
        action VARCHAR(100) NOT NULL,
        entity_type VARCHAR(50) NOT NULL,
        entity_id VARCHAR(50),
        details JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // Create feedback table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS feedback (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
        category VARCHAR(50) NOT NULL,
        message TEXT NOT NULL,
        rating INTEGER,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        admin_response TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // Create payment_methods table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS payment_methods (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        stripe_payment_method_id VARCHAR NOT NULL,
        card_brand VARCHAR(50),
        card_last4 VARCHAR(4),
        card_exp_month INTEGER,
        card_exp_year INTEGER,
        is_default BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    console.log("✓ Database tables created successfully!");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}

initDatabase()
  .then(() => {
    console.log("Database initialization complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed to initialize database:", error);
    process.exit(1);
  });


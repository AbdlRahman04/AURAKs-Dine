import * as schema from "@shared/schema";
import { Pool as NeonPool, neonConfig } from '@neondatabase/serverless';
import { drizzle as neonDrizzle } from 'drizzle-orm/neon-serverless';
import { Pool as PgPool } from 'pg';
import { drizzle as pgDrizzle } from 'drizzle-orm/node-postgres';
import ws from "ws";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Detect if we're using Neon (serverless) or regular PostgreSQL
const isNeon = process.env.DATABASE_URL.includes('neon.tech');

let db: any;
let pool: any;

if (isNeon) {
  // Use Neon serverless driver (for cloud Neon database)
  neonConfig.webSocketConstructor = ws;
  pool = new NeonPool({ connectionString: process.env.DATABASE_URL });
  db = neonDrizzle({ client: pool, schema });

  console.log('[Database] Using Neon serverless driver');
} else {
  // Use regular PostgreSQL driver (for local PostgreSQL)
  pool = new PgPool({ connectionString: process.env.DATABASE_URL });
  db = pgDrizzle({ client: pool, schema });

  console.log('[Database] Using local PostgreSQL driver');
}

export { pool, db };

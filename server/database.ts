import type { PoolConfig } from "pg";

/**
 * Shared database helpers for local Postgres and Neon.
 * Import after ./config so env vars are loaded.
 */

export function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL must be set. Did you forget to provision a database?",
    );
  }
  return url;
}

export function isNeonDatabase(url: string = getDatabaseUrl()): boolean {
  return url.includes("neon.tech") || url.includes("neon.database");
}

/**
 * Normalize a connection string for the standard `pg` driver.
 * Strips Neon's channel_binding param which can break connect-pg-simple.
 */
export function sanitizeConnectionString(url: string = getDatabaseUrl()): string {
  if (!isNeonDatabase(url)) {
    return url;
  }
  return url.replace(/[&?]channel_binding=require/g, "");
}

/**
 * Pool options for the standard `pg` driver (sessions, local Postgres).
 * For Neon, use the pooled connection string and enable SSL.
 */
export function getPgPoolOptions(
  connectionString: string = getDatabaseUrl(),
): PoolConfig {
  const isNeon = isNeonDatabase(connectionString);
  return {
    connectionString: sanitizeConnectionString(connectionString),
    connectionTimeoutMillis: isNeon ? 30000 : 10000,
    idleTimeoutMillis: 30000,
    ssl: isNeon ? { rejectUnauthorized: false } : undefined,
    max: 10,
  };
}

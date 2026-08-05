import "./config"; // Must be first — loads .env.local then .env
import * as schema from "@shared/schema";
import { Pool as NeonPool, neonConfig } from "@neondatabase/serverless";
import { drizzle as neonDrizzle, type NeonDatabase } from "drizzle-orm/neon-serverless";
import { Pool as PgPool } from "pg";
import { drizzle as pgDrizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import ws from "ws";
import { getDatabaseUrl, isNeonDatabase } from "./database";

const databaseUrl = getDatabaseUrl();
const usingNeon = isNeonDatabase(databaseUrl);

type AppSchema = typeof schema;
type AppDatabase = NeonDatabase<AppSchema> | NodePgDatabase<AppSchema>;

let pool: NeonPool | PgPool;
let db: AppDatabase;

if (usingNeon) {
  neonConfig.webSocketConstructor = ws;
  pool = new NeonPool({ connectionString: databaseUrl });
  db = neonDrizzle({ client: pool, schema });
  console.log("[Database] Using Neon serverless driver");
} else {
  pool = new PgPool({ connectionString: databaseUrl });
  db = pgDrizzle({ client: pool, schema });
  console.log("[Database] Using local PostgreSQL driver");
}

export { pool, db };

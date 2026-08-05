/**
 * Environment configuration loader.
 * Must be imported FIRST (before any other app modules) in all entry points.
 * 
 * Loads .env.local first (local dev overrides), then .env as fallback.
 * dotenv won't override vars already set by .env.local.
 */
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
  console.log('[Config] Loaded .env.local');
}
dotenv.config(); // loads .env (won't override already-set vars)

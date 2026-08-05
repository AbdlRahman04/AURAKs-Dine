import { defineConfig } from "drizzle-kit";
import "./server/config"; // loads .env.local then .env (same as the app)
import { getDatabaseUrl } from "./server/database";

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: getDatabaseUrl(),
  },
});

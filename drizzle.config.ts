import { defineConfig } from "drizzle-kit";

const databaseDirectUrl = process.env.DATABASE_DIRECT_URL ?? process.env.DATABASE_URL;

if (!databaseDirectUrl) {
  throw new Error("DATABASE_DIRECT_URL or DATABASE_URL must be set to provision the database");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseDirectUrl,
    ssl: "require",
  },
});

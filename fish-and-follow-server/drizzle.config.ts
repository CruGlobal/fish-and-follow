import dotenv from 'dotenv';
import { defineConfig } from 'drizzle-kit';

dotenv.config();

const databaseAddress = process.env.DB_PORT_5432_TCP_ADD;
const databaseName = process.env.DB_ENV_POSTGRESQL_DB;
const databaseUser = process.env.DB_ENV_POSTGRESQL_USER;
const databasePassword = process.env.DB_ENV_POSTGRESQL_PASS;

const databaseURL = `postgres://${databaseUser}:${databasePassword}@${databaseAddress}/${databaseName}`;

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: databaseURL!,
  },
  verbose: false, // Suppress verbose output
  strict: false,  // Less strict mode
});

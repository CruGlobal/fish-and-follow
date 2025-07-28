import dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

dotenv.config();

const databaseAddress = process.env.DB_PORT_5432_TCP_ADD;
const databaseName = process.env.DB_ENV_POSTGRESQL_DB;
const databaseUser = process.env.DB_ENV_POSTGRESQL_USER;
const databasePassword = process.env.DB_ENV_POSTGRESQL_PASS;

const databaseURL = `postgres://${databaseUser}:${databasePassword}@${databaseAddress}/${databaseName}`;

export const pool = new Pool({
  connectionString: databaseURL,
});

export const db = drizzle(pool, { schema });

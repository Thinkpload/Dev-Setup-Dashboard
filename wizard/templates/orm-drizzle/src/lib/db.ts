import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../../drizzle/schema';

function createDb() {
  const databaseUrl = process.env['DATABASE_URL'];
  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL environment variable is not set. Please add it to your .env file.'
    );
  }
  return drizzle(databaseUrl, { schema });
}

const globalForDrizzle = globalThis as unknown as { db: ReturnType<typeof createDb> };

export const db = globalForDrizzle.db ?? createDb();

if (process.env['NODE_ENV'] !== 'production') globalForDrizzle.db = db;

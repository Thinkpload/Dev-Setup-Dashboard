import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../../drizzle/schema';

const databaseUrl = process.env['DATABASE_URL'];
if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set. Please add it to your .env file.');
}

export const db = drizzle(databaseUrl, { schema });

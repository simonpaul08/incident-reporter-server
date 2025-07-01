import { drizzle } from 'drizzle-orm/node-postgres';
import { config } from 'dotenv';

config({ path: ".env" })

const databasePath = process.env.DATABASE_URL!;

export const db = drizzle(databasePath);


import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import * as schema from '@shared/schema';

const databaseUrl = process.env.DATABASE_URL;
const shouldUseSsl = typeof databaseUrl === 'string' && databaseUrl.includes('supabase.com');

export const pool = databaseUrl
  ? new Pool({
      connectionString: databaseUrl,
      ssl: shouldUseSsl ? { rejectUnauthorized: false } : undefined,
    })
  : null;
export const db = pool ? drizzle(pool, { schema }) : null;

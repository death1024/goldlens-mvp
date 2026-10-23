import path from 'node:path';
import { mkdir } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { drizzle as drizzlePglite } from 'drizzle-orm/pglite';
import { drizzle as drizzlePostgres } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { BOOTSTRAP_SQL } from './bootstrap';
import { seed } from './seed';

type AnyDb = ReturnType<typeof drizzlePglite<typeof schema>> | ReturnType<typeof drizzlePostgres<typeof schema>>;

const globalForDb = globalThis as unknown as { __goldlensDb?: Promise<AnyDb> };

async function init(): Promise<AnyDb> {
  const url = process.env.DATABASE_URL;

  if (url) {
    const client = postgres(url, { max: 1, prepare: false });
    await client.unsafe(BOOTSTRAP_SQL);
    const db = drizzlePostgres(client, { schema });
    await seed(db);
    return db;
  }

  const cwd = process.cwd();
  const rootData = /(?:apps[\\/]web|packages[\\/]db)$/.test(cwd)
    ? path.resolve(cwd, '..', '..', '.data', 'pglite')
    : path.join(cwd, '.data', 'pglite');
  const dataDir = process.env.PGLITE_DIR ?? rootData;
  await mkdir(dataDir, { recursive: true });
  const client = new PGlite({ dataDir });
  await client.waitReady;
  await client.exec(BOOTSTRAP_SQL);
  const db = drizzlePglite(client, { schema });
  await seed(db);
  return db;
}

export function getDb(): Promise<AnyDb> {
  if (!globalForDb.__goldlensDb) {
    globalForDb.__goldlensDb = init().catch((error) => {
      globalForDb.__goldlensDb = undefined;
      throw error;
    });
  }
  return globalForDb.__goldlensDb;
}

export { schema };
export * from './schema';

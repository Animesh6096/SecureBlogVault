import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import { drizzle as drizzleSQLite } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';

// This is the correct way neon config - DO NOT change this
neonConfig.webSocketConstructor = ws;

// Use SQLite for local development if DATABASE_URL is not set
let db;
let pool;

if (!process.env.DATABASE_URL) {
  console.log("DATABASE_URL not set, using SQLite for local development");
  // Ensure the data directory exists
  const dbDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  
  const sqlite = new Database(path.join(dbDir, 'local.db'));
  db = drizzleSQLite(sqlite);
} else {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle({ client: pool, schema });
}

export { pool, db };
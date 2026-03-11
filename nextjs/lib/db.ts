import fs from 'fs';
import path from 'path';
import type { DB } from './types';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

export function readDB(): DB {
  const raw = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(raw) as DB;
}

export function writeDB(db: DB): void {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
}

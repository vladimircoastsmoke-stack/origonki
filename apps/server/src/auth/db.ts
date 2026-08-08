import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const dataDir = process.env.DATA_DIR ?? path.join(process.cwd(), 'data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'origonki.db');

export const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS organizers (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    blocked INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    kind TEXT NOT NULL,
    organizer_id TEXT,
    expires_at INTEGER NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
`);

export function cleanupExpiredSessions(): void {
  db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(Date.now());
}

setInterval(cleanupExpiredSessions, 60 * 60 * 1000);

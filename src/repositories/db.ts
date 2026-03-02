import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const sqlitePath = process.env.SQLITE_PATH || './zkteco.db';

// Ensure directory exists
const dbDir = path.dirname(sqlitePath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(sqlitePath);
db.pragma('journal_mode = WAL');

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS devices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sn TEXT UNIQUE NOT NULL,
    ip TEXT,
    last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS commands (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sn TEXT NOT NULL,
    command_text TEXT NOT NULL,
    status INTEGER DEFAULT 0, -- 0=pending, 1=sent, 2=acked, 3=failed
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    sent_at DATETIME,
    ack_at DATETIME,
    response_text TEXT,
    job_id TEXT
  );

  CREATE TABLE IF NOT EXISTS rtlogs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sn TEXT NOT NULL,
    raw_line TEXT NOT NULL,
    parsed_json TEXT,
    received_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY, -- UUID
    sn TEXT NOT NULL,
    job_type TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, done, failed, timeout
    requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    finished_at DATETIME,
    result_json TEXT,
    error_text TEXT
  );
`);

export default db;

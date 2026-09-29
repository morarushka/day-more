import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '../data');
mkdirSync(dataDir, { recursive: true });

export const db = new Database(join(dataDir, 'bot.sqlite'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    telegram_id INTEGER PRIMARY KEY,
    onboarding_seen INTEGER NOT NULL DEFAULT 0,
    active_scenario_id TEXT,
    context_json TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    scenario_id TEXT NOT NULL,
    kind TEXT NOT NULL,
    rejection_reason TEXT,
    rating TEXT,
    occurred_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_events_user ON events(user_id);

  CREATE TABLE IF NOT EXISTS moments (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    scenario_id TEXT NOT NULL,
    scenario_title TEXT NOT NULL,
    rating TEXT NOT NULL,
    photo_file_id TEXT,
    note TEXT,
    completed_at TEXT NOT NULL,
    tags_json TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_moments_user ON moments(user_id);

  CREATE TABLE IF NOT EXISTS saved_scenarios (
    user_id INTEGER NOT NULL,
    scenario_id TEXT NOT NULL,
    PRIMARY KEY (user_id, scenario_id)
  );
`);

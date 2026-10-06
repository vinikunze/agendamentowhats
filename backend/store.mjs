import { DatabaseSync } from 'node:sqlite'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

export function openStore(path) {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true, mode: 0o700 })
  const db = new DatabaseSync(path)
  db.exec(`
    PRAGMA journal_mode=WAL;
    PRAGMA synchronous=FULL;
    PRAGMA busy_timeout=5000;
    CREATE TABLE IF NOT EXISTS agenda (id INTEGER PRIMARY KEY CHECK (id=1), state TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS inbound (id TEXT PRIMARY KEY, received_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS contacts (phone TEXT PRIMARY KEY, last_seen INTEGER NOT NULL DEFAULT 0, subscribed INTEGER NOT NULL DEFAULT 0);
    CREATE TABLE IF NOT EXISTS summaries (day TEXT PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS outbox (
      id INTEGER PRIMARY KEY AUTOINCREMENT, phone TEXT NOT NULL, body TEXT NOT NULL, kind TEXT NOT NULL,
      state TEXT NOT NULL DEFAULT 'pending', created_at INTEGER NOT NULL, meta_id TEXT, error_code TEXT,
      template_day TEXT, is_template INTEGER NOT NULL DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS outbox_pending ON outbox(state, id);
    CREATE INDEX IF NOT EXISTS outbox_meta ON outbox(meta_id);
  `)
  db.prepare('INSERT OR IGNORE INTO agenda VALUES (1, ?)').run(JSON.stringify({ version: 1, nextId: 1, nextMessageId: 1, appointments: [], messages: [] }))
  // A process may have stopped after Meta accepted a request. Never resend blindly.
  db.prepare("UPDATE outbox SET state='unknown', error_code='process_restarted' WHERE state='sending'").run()
  function transaction(fn) {
    db.exec('BEGIN IMMEDIATE')
    try { const result = fn(); db.exec('COMMIT'); return result } catch (error) { db.exec('ROLLBACK'); throw error }
  }
  const state = () => JSON.parse(db.prepare('SELECT state FROM agenda WHERE id=1').get().state)
  const save = (value) => db.prepare('UPDATE agenda SET state=? WHERE id=1').run(JSON.stringify(value))
  const enqueue = (phone, body, kind, now) => db.prepare('INSERT INTO outbox (phone, body, kind, created_at) VALUES (?, ?, ?, ?)').run(phone, body, kind, now)
  const contact = (phone) => db.prepare('SELECT * FROM contacts WHERE phone=?').get(phone)
  const metrics = () => db.prepare('SELECT state, COUNT(*) AS count FROM outbox GROUP BY state').all()
  return { db, transaction, state, save, enqueue, contact, metrics, close: () => db.close() }
}

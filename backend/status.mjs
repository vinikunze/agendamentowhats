import { DatabaseSync } from 'node:sqlite'

if (!process.env.DATABASE_PATH) throw new Error('Configure DATABASE_PATH para consultar a fila localmente.')
const db = new DatabaseSync(process.env.DATABASE_PATH, { readOnly: true })
try {
  console.log(JSON.stringify({
    outbox: db.prepare('SELECT state, COUNT(*) AS count FROM outbox GROUP BY state').all(),
    needsReview: db.prepare("SELECT id, state, error_code FROM outbox WHERE state IN ('failed','unknown') ORDER BY id DESC LIMIT 50").all(),
  }, null, 2))
} finally { db.close() }

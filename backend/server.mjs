import { loadConfig } from './config.mjs'
import { openStore } from './store.mjs'
import { createService } from './service.mjs'
import { createWebhookServer } from './http.mjs'

process.umask(0o077)
const config = loadConfig()
const store = openStore(config.databasePath)
const service = createService(config, store)
const server = createWebhookServer(config, service)
const tick = () => {
  try { service.scheduleSummary() } catch { console.error('summary_failed') }
  service.flush().catch(() => console.error('flush_failed'))
}
const timer = setInterval(tick, 30_000)
server.listen(config.port, '0.0.0.0', () => {
  console.log(`WhatsApp webhook listening on port ${config.port}`)
  tick()
})
let stopping = false
function stop() {
  if (stopping) return
  stopping = true
  clearInterval(timer)
  server.close(() => process.exit(0))
  setTimeout(() => process.exit(0), 20_000).unref()
}
process.on('SIGINT', stop)
process.on('SIGTERM', stop)

import { createServer } from 'node:http'
import { createHmac, timingSafeEqual } from 'node:crypto'

function equal(a, b) {
  const left = Buffer.from(a || ''), right = Buffer.from(b || '')
  return left.length === right.length && timingSafeEqual(left, right)
}

export function createWebhookServer(config, service, { log = (event) => console.log(JSON.stringify(event)) } = {}) {
  return createServer({ requestTimeout: 15_000, headersTimeout: 10_000 }, async (req, res) => {
    res.setHeader('Cache-Control', 'no-store')
    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    const send = (status, body) => { res.writeHead(status); res.end(body) }
    let url
    try { url = new URL(req.url, 'http://localhost') } catch { return send(400, 'Invalid URL') }
    if (url.pathname === '/healthz' && req.method === 'GET') return send(200, 'ok')
    if (url.pathname !== '/webhooks/whatsapp') return send(404, 'Not found')
    if (req.method === 'GET') {
      if (url.searchParams.get('hub.mode') !== 'subscribe' || !equal(url.searchParams.get('hub.verify_token'), config.verifyToken)) return send(403, 'Forbidden')
      const challenge = url.searchParams.get('hub.challenge')
      return challenge && challenge.length <= 500 ? send(200, challenge) : send(400, 'Invalid challenge')
    }
    if (req.method !== 'POST') return send(405, 'Method not allowed')
    if (!/^sha256=[a-f0-9]{64}$/.test(req.headers['x-hub-signature-256'] || '')) return send(401, 'Invalid signature')
    try {
      let size = 0
      const parts = []
      for await (const part of req) {
        size += part.length
        if (size > 1024 * 1024) { send(413, 'Payload too large'); return }
        parts.push(part)
      }
      const raw = Buffer.concat(parts)
      const expected = `sha256=${createHmac('sha256', config.appSecret).update(raw).digest('hex')}`
      if (!equal(req.headers['x-hub-signature-256'], expected)) return send(401, 'Invalid signature')
      let payload
      try { payload = JSON.parse(raw.toString('utf8')) } catch { return send(400, 'Invalid JSON') }
      service.webhook(payload)
      send(200, 'EVENT_RECEIVED')
      // ACK only after the command and outbox are committed; HTTP sending is separate.
      setImmediate(() => service.flush().catch(() => log({ event: 'flush_failed' })))
    } catch {
      log({ event: 'webhook_failed' })
      if (!res.headersSent) send(500, 'Please retry')
    }
  })
}

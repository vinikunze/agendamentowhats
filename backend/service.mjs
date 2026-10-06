import { processCommand, normalize, dailyAgenda, formatDate } from '../src/lib/agenda.ts'

const DAY = 86_400_000
const SESSION = DAY - 5 * 60_000
const HELP = 'Agenda da Oficina\n\nRecepção: Agendar amanhã às 8h: Amarok, troca de 4 pneus. Depois: Confirmar 1.\nMecânicos: Assumir 1 · Começar 1 · Finalizar 1.\nTodos: Agenda hoje · Agenda amanhã.\n\nPara receber avisos e o resumo diário: Ativar avisos. Para interromper: Parar avisos. Use o número real do agendamento.'

export function localClock(timestamp, timeZone) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(timestamp)).map((p) => [p.type, p.value]))
  return { today: `${parts.year}-${parts.month}-${parts.day}`, clock: `${parts.hour}:${parts.minute}` }
}

function chunks(text) {
  const result = []
  // WhatsApp text body limit is 4096; leave room for UTF-16 and headings.
  let body = text
  while (body.length > 3500) {
    let end = body.lastIndexOf('\n', 3500)
    if (end < 1) end = 3500
    result.push(body.slice(0, end))
    body = body.slice(end).trimStart()
  }
  if (body) result.push(body)
  return result
}

export function createService(config, store, { now = Date.now, fetchImpl = fetch, log = (event) => console.log(JSON.stringify(event)) } = {}) {
  const people = new Map(config.team.map((p) => [p.phone, p]))
  const mechanics = config.team.filter((p) => p.role === 'mechanic').map((p) => p.name)
  const { db } = store
  let flushing = false

  function enqueue(phone, body, kind, timestamp) {
    for (const part of chunks(body)) store.enqueue(phone, part, kind, timestamp)
  }

  function receive(message) {
    const person = people.get(message?.from)
    const timestamp = Number(message?.timestamp) * 1000
    const current = now()
    if (!person || typeof message.id !== 'string' || message.id.length > 250 || !message.id || !Number.isSafeInteger(timestamp) || timestamp <= 0 || timestamp > current + 300_000 || current - timestamp >= DAY) return
    store.transaction(() => {
      if (!db.prepare('INSERT OR IGNORE INTO inbound VALUES (?, ?)').run(message.id, current).changes) return
      db.prepare('INSERT INTO contacts (phone, last_seen) VALUES (?, ?) ON CONFLICT(phone) DO UPDATE SET last_seen=MAX(last_seen, excluded.last_seen)').run(person.phone, Math.min(timestamp, current))
      const text = message.type === 'text' && typeof message.text?.body === 'string' ? message.text.body.trim() : ''
      const command = normalize(text)
      if (command === 'ativar avisos' || command === 'parar avisos') {
        const enabled = command === 'ativar avisos'
        db.prepare('UPDATE contacts SET subscribed=? WHERE phone=?').run(enabled ? 1 : 0, person.phone)
        if (!enabled) db.prepare("UPDATE outbox SET state='cancelled' WHERE phone=? AND kind<>'reply' AND state IN ('pending','waiting_window')").run(person.phone)
        enqueue(person.phone, enabled ? 'Avisos ativados. Você receberá novos agendamentos e o resumo diário. Para interromper, escreva Parar avisos.' : 'Avisos desativados. Você ainda pode consultar e atualizar a agenda por mensagem.', 'reply', current)
        return
      }
      if (!text || text.length > 500 || ['oi', 'ola', 'ajuda', 'menu'].includes(command)) {
        enqueue(person.phone, HELP, 'reply', current)
        return
      }
      const channel = person.role === 'reception' ? 'reception' : `team:${person.name}`
      const previous = store.state()
      const next = processCommand(previous, channel, text, { ...localClock(current, config.timeZone), mechanics, live: true })
      store.save(next)
      for (const message of next.messages.filter((m) => m.id >= previous.nextMessageId && m.sender === 'assistant')) {
        let body = [message.title, message.text].filter(Boolean).join('\n')
        if (message.title?.startsWith('Conferir agendamento')) body += `\n\nResponda: Confirmar ${message.appointmentId}`
        if (message.title?.startsWith('Novo agendamento')) body += `\n\nPara assumir: Assumir ${message.appointmentId}`
        const recipients = message.channel === channel
          ? [person]
          : config.team.filter((p) => message.channel === 'reception' ? p.role === 'reception' : message.channel === `team:${p.name}` && p.role === 'mechanic')
        for (const recipient of recipients) {
          const direct = message.channel === channel && recipient.phone === person.phone
          if (direct || store.contact(recipient.phone)?.subscribed) enqueue(recipient.phone, body, direct ? 'reply' : 'notice', current)
        }
      }
    })
  }

  function receiveStatus(status) {
    if (!status || typeof status.id !== 'string' || !people.has(status.recipient_id)) return
    const rank = { sending: 0, unknown: 0, accepted: 1, sent: 2, delivered: 3, read: 4 }
    if (!['sent', 'delivered', 'read', 'failed'].includes(status.status)) return
    const callback = /^agenda:(\d+)$/.exec(status.biz_opaque_callback_data || '')
    const row = db.prepare('SELECT * FROM outbox WHERE meta_id=? AND phone=?').get(status.id, status.recipient_id) ||
      (callback ? db.prepare('SELECT * FROM outbox WHERE id=? AND phone=?').get(Number(callback[1]), status.recipient_id) : null)
    if (!row || !Object.hasOwn(rank, row.state) || (row.meta_id && row.meta_id !== status.id)) return
    if (status.status === 'failed' && rank[row.state] >= 3) return
    if (status.status !== 'failed' && rank[status.status] < rank[row.state]) return
    const code = status.status === 'failed' ? String(Number(status.errors?.[0]?.code) || 'meta_delivery_failed') : null
    db.prepare('UPDATE outbox SET state=?, meta_id=?, error_code=? WHERE id=?').run(status.status, status.id, code, row.id)
    if (status.status === 'failed') log({ event: 'delivery_failed', outboxId: row.id, code })
  }

  function webhook(payload) {
    if (payload?.object !== 'whatsapp_business_account' || !Array.isArray(payload.entry)) return
    for (const entry of payload.entry) {
      for (const change of Array.isArray(entry?.changes) ? entry.changes : []) {
        const value = change?.value
        if (change?.field !== 'messages' || value?.metadata?.phone_number_id !== config.phoneNumberId) continue
        for (const message of Array.isArray(value.messages) ? value.messages : []) receive(message)
        for (const status of Array.isArray(value.statuses) ? value.statuses : []) receiveStatus(status)
      }
    }
  }

  function scheduleSummary() {
    const current = now()
    const { today, clock } = localClock(current, config.timeZone)
    const minutes = (time) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3))
    const delay = minutes(clock) - minutes(config.summaryTime)
    // Catch up a brief restart, but do not send a morning summary in the afternoon.
    if (delay < 0 || delay > 30) return
    store.transaction(() => {
      if (!db.prepare('INSERT OR IGNORE INTO summaries VALUES (?)').run(today).changes) return
      const body = `Agenda · ${formatDate(today, true)}\n${dailyAgenda(store.state(), today)}`
      for (const person of config.team) if (store.contact(person.phone)?.subscribed) enqueue(person.phone, body, 'summary', current)
    })
  }

  async function flush() {
    if (flushing) return
    flushing = true
    try {
      const rows = db.prepare("SELECT * FROM outbox WHERE state IN ('pending','waiting_window') ORDER BY id").all()
      for (const row of rows) {
        const current = now()
        const person = people.get(row.phone)
        const contact = store.contact(row.phone)
        if (!person || (row.kind !== 'reply' && !contact?.subscribed)) {
          db.prepare("UPDATE outbox SET state='cancelled' WHERE id=?").run(row.id)
          continue
        }
        if (current - row.created_at >= DAY) {
          db.prepare("UPDATE outbox SET state='expired' WHERE id=?").run(row.id)
          continue
        }
        const sessionOpen = contact && current - contact.last_seen < SESSION
        const day = localClock(current, config.timeZone).today
        let payload
        if (sessionOpen) {
          payload = { type: 'text', text: { preview_url: false, body: row.body } }
        } else {
          const alreadyNotified = db.prepare("SELECT id FROM outbox WHERE phone=? AND template_day=? AND is_template=1 AND state IN ('sending','unknown','accepted','sent','delivered','read') LIMIT 1").get(row.phone, day)
          if (row.kind === 'reply' || !config.template || alreadyNotified) {
            db.prepare("UPDATE outbox SET state='waiting_window' WHERE id=?").run(row.id)
            continue
          }
          payload = { type: 'template', template: { name: config.template, language: { code: config.language } } }
        }
        db.prepare("UPDATE outbox SET state='sending', is_template=?, template_day=? WHERE id=?").run(sessionOpen ? 0 : 1, sessionOpen ? null : day, row.id)
        let state = 'unknown', metaId = null, errorCode = null
        try {
          const response = await fetchImpl(`https://graph.facebook.com/${config.graphVersion}/${config.phoneNumberId}/messages`, {
            method: 'POST', headers: { Authorization: `Bearer ${config.token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ messaging_product: 'whatsapp', recipient_type: 'individual', to: row.phone, biz_opaque_callback_data: `agenda:${row.id}`, ...payload }),
            signal: AbortSignal.timeout(15_000), redirect: 'error',
          })
          const data = await response.json()
          if (response.ok && typeof data.messages?.[0]?.id === 'string') {
            state = 'accepted'; metaId = data.messages[0].id
          } else if (response.status >= 400 && response.status < 500) {
            state = 'failed'; errorCode = String(Number(data.error?.code) || response.status)
          } else errorCode = `http_${response.status}`
        } catch { errorCode = 'network_or_response_error' }
        // Status webhooks can arrive while the HTTP call above is awaiting Meta.
        db.prepare("UPDATE outbox SET state=?, meta_id=?, error_code=? WHERE id=? AND state='sending'").run(state, metaId, errorCode, row.id)
        if (state === 'failed' || state === 'unknown') log({ event: 'send_needs_review', outboxId: row.id, state, code: errorCode })
      }
    } finally { flushing = false }
  }
  return { webhook, flush, scheduleSummary }
}

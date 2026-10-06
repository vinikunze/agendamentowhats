import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createHmac } from 'node:crypto'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { loadConfig } from '../backend/config.mjs'
import { openStore } from '../backend/store.mjs'
import { createService, localClock } from '../backend/service.mjs'
import { createWebhookServer } from '../backend/http.mjs'

const reception = '5511999990001', mechanic = '5511999990002', other = '5511999990003'
const config = loadConfig({
  WHATSAPP_ACCESS_TOKEN: 'test-token-never-use-in-production', WHATSAPP_APP_SECRET: 'test-app-secret',
  WHATSAPP_VERIFY_TOKEN: 'verification-token-for-local-tests-only', WHATSAPP_PHONE_NUMBER_ID: '12345678',
  WHATSAPP_GRAPH_VERSION: 'v23.0', DATABASE_PATH: ':memory:',
  WHATSAPP_TEAM_JSON: JSON.stringify([{ name: 'Recepção', phone: reception, role: 'reception' }, { name: 'Carlos', phone: mechanic, role: 'mechanic' }, { name: 'Ana', phone: other, role: 'mechanic' }]),
})
function fixture(t, options = {}) {
  const store = openStore(options.path || ':memory:')
  t.after(() => store.close())
  let clock = Date.parse('2026-12-31T14:00:00Z'), sequence = 0
  const sent = [], logs = []
  const settings = { ...config, ...options.config }
  const service = createService(settings, store, {
    now: () => clock, log: (e) => logs.push(e),
    fetchImpl: options.fetchImpl || (async (url, init) => {
      assert.match(url, /^https:\/\/graph\.facebook\.com\/v23\.0\/12345678\/messages$/)
      assert.equal(init.headers.Authorization, `Bearer ${config.token}`)
      sent.push(JSON.parse(init.body))
      return Response.json({ messages: [{ id: `wamid.out${sent.length}` }] })
    }),
  })
  const envelope = (value) => ({ object: 'whatsapp_business_account', entry: [{ changes: [{ field: 'messages', value: { metadata: { phone_number_id: settings.phoneNumberId }, ...value } }] }] })
  const payload = (phone, text, id = `wamid.in${++sequence}`, timestamp = clock) => envelope({ messages: [{ id, from: phone, timestamp: String(Math.floor(timestamp / 1000)), type: 'text', text: { body: text } }] })
  const command = (phone, text, id, timestamp) => service.webhook(payload(phone, text, id, timestamp))
  return { store, service, settings, sent, logs, command, payload, envelope, time: (value) => { clock = Date.parse(value) } }
}

test('real calendar crosses year, uses workshop timezone and real mechanic names', (t) => {
  const f = fixture(t)
  f.command(reception, 'Agendar amanhã às 8h: Amarok, troca de pneus. Com Carlos.')
  assert.equal(f.store.state().appointments[0].date, '2027-01-01')
  assert.equal(f.store.state().appointments[0].mechanic, 'Carlos')
  assert.equal(f.store.state().appointments[0].id, 1)
  assert.equal(localClock(Date.parse('2027-01-01T02:00:00Z'), 'America/Cuiaba').today, '2026-12-31')
  f.command(reception, 'Agendar 30/12/2026 às 8h: Gol, óleo.')
  assert.equal(f.store.state().appointments.length, 1)
})

test('complete signed-message domain flow persists agenda, notifies opted-in team, and enforces role/ownership', async (t) => {
  const f = fixture(t)
  for (const phone of [reception, mechanic, other]) f.command(phone, 'Ativar avisos')
  f.command(reception, 'Agendar amanhã às 8h: Amarok, troca de pneus.')
  const before = f.store.db.prepare("SELECT COUNT(*) AS n FROM outbox WHERE kind='notice'").get().n
  assert.equal(before, 0)
  f.command(mechanic, 'Confirmar 1')
  assert.equal(f.store.state().appointments[0].status, 'pending')
  f.command(reception, 'Confirmar 1')
  assert.equal(f.store.db.prepare("SELECT COUNT(*) AS n FROM outbox WHERE kind='notice'").get().n, 2)
  f.command(mechanic, 'Assumir 1')
  f.command(other, 'Assumir 1')
  f.command(other, 'Começar 1')
  assert.equal(f.store.state().appointments[0].mechanic, 'Carlos')
  assert.equal(f.store.state().appointments[0].status, 'scheduled')
  f.command(mechanic, 'Começar 1')
  f.command(mechanic, 'Finalizar 1')
  assert.equal(f.store.state().appointments[0].status, 'completed')
  await f.service.flush()
  assert.ok(f.sent.some((m) => m.to === reception && /Serviço #1 concluído/.test(m.text?.body)))
  assert.ok(f.sent.some((m) => /Responda: Confirmar 1/.test(m.text?.body)))
  assert.ok(f.sent.every((m) => m.recipient_type === 'individual' && m.messaging_product === 'whatsapp'))
  assert.ok(f.sent.every((m) => !m.text.body.includes('demonstração')))
})

test('duplicate webhooks and repeat confirmation do not duplicate appointments or team notifications', (t) => {
  const f = fixture(t)
  f.command(mechanic, 'Ativar avisos')
  f.command(reception, 'Agendar amanhã às 8h: Gol, óleo.', 'same')
  f.command(reception, 'Agendar amanhã às 8h: Gol, óleo.', 'same')
  f.command(reception, 'Confirmar 1', 'confirm')
  f.command(reception, 'Confirmar 1', 'confirm')
  f.command(reception, 'Confirmar 1')
  assert.equal(f.store.state().appointments.length, 1)
  assert.equal(f.store.db.prepare("SELECT COUNT(*) AS n FROM outbox WHERE kind='notice'").get().n, 1)
})

test('unknown senders, another receiving number and stale/future events cannot change the agenda', (t) => {
  const f = fixture(t)
  f.command('5511999990099', 'Agendar amanhã às 8h: Gol, óleo.')
  f.command(reception, 'Agendar amanhã às 8h: Gol, óleo.', 'old', Date.parse('2026-12-29T14:00:00Z'))
  f.command(reception, 'Agendar amanhã às 8h: Gol, óleo.', 'future', Date.parse('2027-01-01T14:00:00Z'))
  const wrong = f.payload(reception, 'Agendar amanhã às 8h: Gol, óleo.')
  wrong.entry[0].changes[0].value.metadata.phone_number_id = '987'
  f.service.webhook(wrong)
  assert.equal(f.store.state().appointments.length, 0)
  assert.equal(f.store.db.prepare('SELECT COUNT(*) AS n FROM inbound').get().n, 0)
})

test('subscription is explicit and stopping cancels pending proactive notifications', async (t) => {
  const f = fixture(t)
  f.command(reception, 'Agendar amanhã às 8h: Gol, óleo.')
  f.command(reception, 'Confirmar 1')
  assert.equal(f.store.db.prepare("SELECT COUNT(*) AS n FROM outbox WHERE kind='notice'").get().n, 0)
  f.command(mechanic, 'Ativar avisos')
  f.command(reception, 'Remarcar 1 para amanhã às 9h')
  f.command(mechanic, 'Parar avisos')
  await f.service.flush()
  assert.ok(!f.sent.some((m) => m.to === mechanic && /Novo horário/.test(m.text.body)))
  assert.equal(f.store.contact(mechanic).subscribed, 0)
})

test('closed 24-hour window waits without a template; opening it permits text', async (t) => {
  const f = fixture(t)
  f.command(mechanic, 'Ativar avisos')
  await f.service.flush()
  f.time('2027-01-02T14:00:00Z')
  f.command(reception, 'Agendar amanhã às 8h: Gol, óleo.')
  f.command(reception, 'Confirmar 1')
  await f.service.flush()
  assert.equal(f.store.db.prepare("SELECT COUNT(*) AS n FROM outbox WHERE state='waiting_window'").get().n, 1)
  assert.equal(f.sent.filter((m) => m.to === mechanic).length, 1)
  f.command(mechanic, 'Agenda amanhã')
  await f.service.flush()
  assert.ok(f.sent.some((m) => m.to === mechanic && /Novo agendamento/.test(m.text?.body)))
})

test('approved generic template is used outside window, limited to one per recipient/day', async (t) => {
  const f = fixture(t, { config: { template: 'aviso_agenda_oficina' } })
  f.command(mechanic, 'Ativar avisos')
  await f.service.flush()
  f.time('2027-01-02T14:00:00Z')
  f.command(reception, 'Agendar amanhã às 8h: Gol, óleo.')
  f.command(reception, 'Confirmar 1')
  f.command(reception, 'Remarcar 1 para amanhã às 9h')
  await f.service.flush()
  const templates = f.sent.filter((m) => m.type === 'template')
  assert.equal(templates.length, 1)
  assert.deepEqual(templates[0].template, { name: 'aviso_agenda_oficina', language: { code: 'pt_BR' } })
  assert.equal(templates[0].to, mechanic)
})

test('daily summary is idempotent, local-time based and only for subscribed participants', (t) => {
  const f = fixture(t)
  f.command(mechanic, 'Ativar avisos')
  f.time('2027-01-01T10:59:00Z'); f.service.scheduleSummary()
  assert.equal(f.store.db.prepare("SELECT COUNT(*) AS n FROM outbox WHERE kind='summary'").get().n, 0)
  f.time('2027-01-01T11:00:00Z'); f.service.scheduleSummary(); f.service.scheduleSummary()
  assert.equal(f.store.db.prepare("SELECT COUNT(*) AS n FROM outbox WHERE kind='summary'").get().n, 1)
  f.time('2027-01-02T16:00:00Z'); f.service.scheduleSummary()
  assert.equal(f.store.db.prepare("SELECT COUNT(*) AS n FROM outbox WHERE kind='summary'").get().n, 1)
})

test('delivery statuses update monotonically; acceptance is not reported as delivery', async (t) => {
  const f = fixture(t)
  f.command(reception, 'Ajuda'); await f.service.flush()
  assert.equal(f.store.metrics()[0].state, 'accepted')
  const status = (value) => f.service.webhook(f.envelope({ statuses: [{ id: 'wamid.out1', recipient_id: reception, status: value }] }))
  status('read'); status('sent'); status('failed')
  assert.equal(f.store.metrics()[0].state, 'read')
})

test('API failures and ambiguous timeout are visible, never blindly retried or logged with secrets', async (t) => {
  const f = fixture(t, { fetchImpl: async () => { throw new Error(`never log ${config.token}`) } })
  f.command(reception, 'Ajuda'); await f.service.flush(); await f.service.flush()
  assert.equal(f.store.metrics()[0].state, 'unknown')
  assert.equal(f.logs.length, 1)
  assert.ok(!JSON.stringify(f.logs).includes(config.token))
  f.service.webhook(f.envelope({ statuses: [{ id: 'wamid.recovered', recipient_id: reception, status: 'delivered', biz_opaque_callback_data: 'agenda:1' }] }))
  assert.equal(f.store.metrics()[0].state, 'delivered')
  const g = fixture(t, { fetchImpl: async () => Response.json({ error: { code: 190 } }, { status: 401 }) })
  g.command(reception, 'Ajuda'); await g.service.flush()
  assert.equal(g.store.metrics()[0].state, 'failed')
})

test('transaction rollback keeps inbound retryable when persistence fails', (t) => {
  const f = fixture(t)
  const save = f.store.save
  f.store.save = () => { throw new Error('disk failure') }
  assert.throws(() => f.command(reception, 'Agendar amanhã às 8h: Gol, óleo.', 'retry'))
  assert.equal(f.store.db.prepare('SELECT COUNT(*) AS n FROM inbound').get().n, 0)
  f.store.save = save
  f.command(reception, 'Agendar amanhã às 8h: Gol, óleo.', 'retry')
  assert.equal(f.store.state().appointments.length, 1)
})

test('SQLite persists agenda and deduplication across service restarts', (t) => {
  const directory = mkdtempSync(join(tmpdir(), 'whatsapp-test-'))
  t.after(() => rmSync(directory, { recursive: true, force: true }))
  const path = join(directory, 'agenda.sqlite')
  const first = openStore(path)
  first.transaction(() => {
    first.save({ version: 1, nextId: 2, nextMessageId: 1, appointments: [{ id: 1, vehicle: 'Gol' }], messages: [] })
    first.db.prepare('INSERT INTO inbound VALUES (?, ?)').run('persisted', 1)
    first.enqueue(reception, 'test', 'reply', 1)
    first.db.prepare("UPDATE outbox SET state='sending'").run()
  })
  first.close()
  const second = openStore(path)
  assert.equal(second.state().appointments[0].vehicle, 'Gol')
  assert.equal(second.db.prepare('SELECT id FROM inbound').get().id, 'persisted')
  assert.equal(second.metrics()[0].state, 'unknown')
  second.close()
})

test('HTTP verification, raw-body HMAC, malformed input and webhook acknowledgement', async (t) => {
  const f = fixture(t)
  const server = createWebhookServer(f.settings, f.service, { log: () => {} })
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  t.after(() => new Promise((resolve) => server.close(resolve)))
  const base = `http://127.0.0.1:${server.address().port}`
  assert.equal((await fetch(`${base}/healthz`)).status, 200)
  assert.equal((await fetch(`${base}/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=wrong&hub.challenge=hello`)).status, 403)
  const verified = await fetch(`${base}/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=${config.verifyToken}&hub.challenge=hello`)
  assert.equal(await verified.text(), 'hello')
  const send = (body, secret = config.appSecret) => fetch(`${base}/webhooks/whatsapp`, { method: 'POST', headers: { 'x-hub-signature-256': `sha256=${createHmac('sha256', secret).update(body).digest('hex')}` }, body })
  const body = JSON.stringify(f.payload(reception, 'Agendar amanhã às 8h: Gol, óleo.', 'http'))
  assert.equal((await send(body, 'wrong')).status, 401)
  assert.equal((await send('not json')).status, 400)
  assert.equal(f.store.state().appointments.length, 0)
  assert.equal((await send(body)).status, 200)
  assert.equal((await send(body)).status, 200)
  assert.equal(f.store.state().appointments.length, 1)
})

test('configuration fails closed without secrets, unique roster and a reception/mechanic', () => {
  assert.throws(() => loadConfig({}), /WHATSAPP_ACCESS_TOKEN/)
  assert.throws(() => loadConfig({ WHATSAPP_ACCESS_TOKEN: 'x' }), /WHATSAPP_APP_SECRET/)
})

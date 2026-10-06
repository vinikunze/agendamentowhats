import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  createInitialState,
  dailyAgenda,
  parseBooking,
  parseDate,
  parseSavedState,
  processCommand,
} from '../src/lib/agenda.ts'

const run = (state, channel, text) => processCommand(state, channel, text)
const item = (state, id = 23) => state.appointments.find((a) => a.id === id)
const reply = (state) => state.messages.at(-1)?.text

test('understands dates, accented names and a complete booking without guessing missing fields', () => {
  const parsed = parseBooking(
    'Agendar quarta às 9h30: Gol, troca de óleo. Com João.',
  )
  assert.deepEqual(parsed.booking, {
    vehicle: 'Gol',
    service: 'Troca de óleo',
    date: '2026-10-07',
    time: '09:30',
    mechanic: 'João',
  })
  assert.equal(parseDate('31/02'), null)
  assert.equal(parseDate('06/10'), '2026-10-06')
  assert.ok('error' in parseBooking('Agendar amanhã às 25h: Gol, óleo'))
  assert.ok('error' in parseBooking('Agendar amanhã às 8h: Gol'))
  assert.ok('error' in parseBooking('Agendar ontem às 8h: Gol, óleo'))
})

test('confirmation gates the team notification and is idempotent', () => {
  const seed = createInitialState()
  assert.ok(!dailyAgenda(seed, '2026-10-06').includes('Amarok'))
  assert.equal(
    seed.messages.filter((m) => m.channel.startsWith('team:')).length,
    0,
  )
  const confirmed = run(seed, 'reception', 'Confirmar 23')
  assert.equal(item(confirmed).status, 'scheduled')
  assert.ok(dailyAgenda(confirmed, '2026-10-06').includes('Amarok'))
  assert.equal(
    confirmed.messages.filter((m) => m.channel.startsWith('team:')).length,
    3,
  )
  const repeated = run(confirmed, 'reception', 'Confirmar 23')
  assert.equal(
    repeated.messages.filter((m) => m.channel.startsWith('team:')).length,
    3,
  )
  assert.equal(item(seed).status, 'pending', 'previous state remains immutable')
})

test('a second mechanic cannot take over an assigned service', () => {
  let state = run(createInitialState(), 'reception', 'Confirmar 23')
  state = run(state, 'team:João', 'Assumir 23')
  state = run(state, 'team:Pedro', 'Assumir 23')
  assert.equal(item(state).mechanic, 'João')
  assert.match(reply(state), /João já assumiu/)
})

test('only the assigned mechanic can start and finish in order', () => {
  let state = run(createInitialState(), 'reception', 'Confirmar 23')
  state = run(state, 'updates:João', 'Começar 23')
  assert.equal(item(state).status, 'scheduled')
  state = run(state, 'team:João', 'Assumir 23')
  state = run(state, 'updates:João', 'Finalizar 23')
  assert.equal(item(state).status, 'scheduled')
  state = run(state, 'updates:Pedro', 'Começar 23')
  assert.equal(item(state).status, 'scheduled')
  state = run(state, 'updates:João', 'Começar 23')
  assert.equal(item(state).status, 'in_progress')
  state = run(state, 'updates:Pedro', 'Finalizar 23')
  assert.equal(item(state).status, 'in_progress')
  state = run(state, 'updates:João', 'Finalizar 23')
  assert.equal(item(state).status, 'completed')
  assert.ok(
    state.messages.some(
      (m) => m.channel === 'reception' && m.title === 'Serviço #23 concluído',
    ),
  )
})

test('booking a new vehicle creates a pending record and rejects duplicates', () => {
  let state = run(
    createInitialState(),
    'reception',
    'Agendar 07/10 às 10h: Gol, revisão. Sem mecânico definido.',
  )
  assert.equal(item(state, 26).status, 'pending')
  assert.equal(item(state, 26).mechanic, null)
  state = run(state, 'reception', 'Agendar 07/10 às 10h: Gol, revisão.')
  assert.equal(state.appointments.length, 4)
  assert.equal(state.nextId, 27)
})

test('rescheduling updates the summary and cancellation preserves history', () => {
  let state = run(createInitialState(), 'reception', 'Confirmar 23')
  state = run(state, 'reception', 'Remarcar 23 para 07/10 às 10h30')
  assert.equal(item(state).date, '2026-10-07')
  assert.equal(item(state).time, '10:30')
  assert.ok(!dailyAgenda(state, '2026-10-06').includes('Amarok'))
  assert.ok(dailyAgenda(state, '2026-10-07').includes('Amarok'))
  state = run(state, 'reception', 'Cancelar 23')
  assert.equal(item(state).status, 'cancelled')
  assert.ok(!dailyAgenda(state, '2026-10-07').includes('Amarok'))
  assert.equal(state.appointments.length, 3)
})

test('mechanics cannot confirm, cancel or reschedule reception bookings', () => {
  for (const command of [
    'Confirmar 23',
    'Cancelar 23',
    'Remarcar 23 para 07/10 às 10h',
  ]) {
    const state = run(createInitialState(), 'team:João', command)
    assert.equal(item(state).status, 'pending')
    assert.equal(item(state).date, '2026-10-06')
    assert.match(reply(state), /recepção/)
  }
})

test('prevents assigning two services at the same time to one mechanic', () => {
  let state = run(
    createInitialState(),
    'reception',
    'Agendar amanhã às 9h30: Civic, revisão. Com Pedro.',
  )
  state = run(state, 'reception', 'Confirmar 26')
  assert.equal(item(state, 26).status, 'pending')
  assert.match(reply(state), /já tem o serviço #24/)
})

test('unknown IDs and invalid commands do not change appointments', () => {
  const seed = createInitialState()
  for (const command of [
    'Confirmar 999',
    'Confirmar 23 errado',
    'Agenda 31/02',
    'Remarcar 23 para 31/02 às 10h',
  ]) {
    const state = run(seed, 'reception', command)
    assert.deepEqual(state.appointments, seed.appointments)
    assert.equal(state.messages.length, seed.messages.length + 2)
  }
})

test('persistence validates data and rejects corrupted or incompatible state', () => {
  const state = run(createInitialState(), 'reception', 'Confirmar 23')
  assert.deepEqual(parseSavedState(JSON.stringify(state)), state)
  assert.equal(parseSavedState('broken json'), null)
  assert.equal(parseSavedState(JSON.stringify({ ...state, version: 2 })), null)
  assert.equal(
    parseSavedState(
      JSON.stringify({
        ...state,
        appointments: [{ ...item(state), time: '99:99' }],
      }),
    ),
    null,
  )
  assert.equal(parseSavedState(JSON.stringify({ ...state, nextId: 1 })), null)
})

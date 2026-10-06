'use client'

import { useSyncExternalStore } from 'react'
import {
  appointmentDetails,
  createInitialState,
  normalize,
  parseBooking,
  parseSavedState,
  processCommand,
  type AgendaState,
  type Channel,
} from './agenda'

export const STORAGE_KEY = 'agenda-da-oficina:demo:v1'
type Snapshot = { state: AgendaState; warning: string | null }
const serverSnapshot: Snapshot = { state: createInitialState(), warning: null }
let snapshot: Snapshot | null = null
const listeners = new Set<() => void>()

function getSnapshot(): Snapshot {
  if (snapshot) return snapshot
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const saved = raw ? parseSavedState(raw) : null
    snapshot = {
      state: saved ?? createInitialState(),
      warning:
        raw && !saved
          ? 'A cópia salva não pôde ser lida. Carregamos os exemplos novamente.'
          : null,
    }
  } catch {
    snapshot = {
      state: createInitialState(),
      warning:
        'O navegador bloqueou o armazenamento. As alterações duram apenas nesta página.',
    }
  }
  return snapshot
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) {
      snapshot = null
      listener()
    }
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', onStorage)
  }
}

function save(state: AgendaState) {
  let warning: string | null = null
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    warning =
      'Não foi possível salvar no navegador. Mantenha esta página aberta para continuar.'
  }
  snapshot = { state, warning }
  listeners.forEach((listener) => listener())
}

export function sendCommand(channel: Channel, input: string) {
  const next = processCommand(getSnapshot().state, channel, input)
  save(next)
  return next
}

export function editPending(id: number, input: string): string | null {
  const result = parseBooking(input)
  if ('error' in result) return result.error
  const state = getSnapshot().state
  const current = state.appointments.find((a) => a.id === id)
  if (!current || current.status !== 'pending')
    return 'Este agendamento já foi confirmado. Use a opção de remarcar.'
  const duplicate = state.appointments.find(
    (a) =>
      a.id !== id &&
      a.status !== 'cancelled' &&
      a.date === result.booking.date &&
      a.time === result.booking.time &&
      normalize(a.vehicle) === normalize(result.booking.vehicle),
  )
  if (duplicate)
    return `Já existe o agendamento #${duplicate.id} para esse carro e horário.`
  const updated = { ...current, ...result.booking }
  save({
    ...state,
    appointments: state.appointments.map((a) => (a.id === id ? updated : a)),
    nextMessageId: state.nextMessageId + 1,
    messages: [
      ...state.messages,
      {
        id: state.nextMessageId,
        channel: 'reception',
        sender: 'assistant',
        title: `Conferir agendamento #${id}`,
        text: appointmentDetails(updated),
        appointmentId: id,
        time: '15:43',
      },
    ].slice(-300) as AgendaState['messages'],
  })
  return null
}

export function resetDemo() {
  save(createInitialState())
}

export function useAgenda() {
  return useSyncExternalStore(subscribe, getSnapshot, () => serverSnapshot)
}

'use client'

import { useState } from 'react'
import {
  DEMO_TOMORROW,
  STATUS_LABELS,
  formatDate,
  type Appointment,
  type Status,
} from '@/lib/agenda'
import { Icon } from './icons'

export function AgendaView({
  appointments,
  onNew,
  onConfirm,
  onReschedule,
  onCancel,
}: {
  appointments: Appointment[]
  onNew: () => void
  onConfirm: (id: number) => void
  onReschedule: (item: Appointment) => void
  onCancel: (item: Appointment) => void
}) {
  const [date, setDate] = useState(DEMO_TOMORROW)
  const [filter, setFilter] = useState<'all' | Status>('all')
  const items = appointments
    .filter(
      (item) =>
        (!date || item.date === date) &&
        (filter === 'all' || item.status === filter),
    )
    .toSorted(
      (a, b) =>
        `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`) || a.id - b.id,
    )
  return (
    <>
      <p className="modal-description">
        Tudo que acontece nas conversas aparece aqui. Os dados ficam neste
        navegador.
      </p>
      <div className="agenda-toolbar">
        <label>
          Data
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </label>
        <label>
          Status
          <select
            value={filter}
            onChange={(event) =>
              setFilter(event.target.value as 'all' | Status)
            }
          >
            <option value="all">Todos os status</option>
            {Object.entries(STATUS_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <button className="button button-primary" onClick={onNew}>
          <Icon name="plus" size={17} />
          Novo agendamento
        </button>
      </div>
      <div className="agenda-list" aria-live="polite">
        {items.length ? (
          items.map((item) => (
            <article
              className="appointment-row"
              key={item.id}
              aria-label={`Agendamento ${item.id}`}
            >
              <div className="appointment-time">
                <strong>{item.time}</strong>
                <span>{formatDate(item.date)}</span>
              </div>
              <div className="appointment-info">
                <h3>
                  {item.vehicle}
                  <span>#{item.id}</span>
                </h3>
                <p>{item.service}</p>
                <span className="assignee">
                  {item.mechanic ?? 'Responsável a definir'}
                </span>
              </div>
              <div className="appointment-state">
                <span className={`status-pill status-${item.status}`}>
                  {STATUS_LABELS[item.status]}
                </span>
                <div className="row-actions">
                  {item.status === 'pending' ? (
                    <button onClick={() => onConfirm(item.id)}>
                      Confirmar
                    </button>
                  ) : null}
                  {['pending', 'scheduled'].includes(item.status) ? (
                    <button onClick={() => onReschedule(item)}>Remarcar</button>
                  ) : null}
                  {!['cancelled', 'completed'].includes(item.status) ? (
                    <button onClick={() => onCancel(item)}>Cancelar</button>
                  ) : null}
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="empty-state">
            <Icon name="calendar" size={30} />
            <h3>Nenhum agendamento por aqui</h3>
            <p>Escolha outra data ou crie um novo agendamento.</p>
          </div>
        )}
      </div>
      <p className="agenda-footnote">
        Semana de exemplo: 5 a 11 de outubro de 2026. A confirmar ainda não
        entra no resumo da equipe.
      </p>
    </>
  )
}

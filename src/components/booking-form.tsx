'use client'

import { useState } from 'react'
import {
  DEMO_TODAY,
  DEMO_TOMORROW,
  MECHANICS,
  type Appointment,
} from '@/lib/agenda'

export function BookingForm({
  appointment,
  onSave,
  onCancel,
  reschedule = false,
}: {
  appointment?: Appointment
  onSave: (command: string) => string | null
  onCancel: () => void
  reschedule?: boolean
}) {
  const [error, setError] = useState<string | null>(null)
  return (
    <form
      className="booking-form"
      onSubmit={(event) => {
        event.preventDefault()
        const data = new FormData(event.currentTarget)
        const date = String(data.get('date'))
        const time = String(data.get('time'))
        const mechanic = String(data.get('mechanic') ?? '')
        const command =
          reschedule && appointment
            ? `Remarcar ${appointment.id} para ${date} às ${time}`
            : `Agendar ${date} às ${time}: ${String(data.get('vehicle')).trim()}, ${String(data.get('service')).trim()}.${mechanic ? ` Com ${mechanic}.` : ' Sem mecânico definido.'}`
        setError(onSave(command))
      }}
    >
      <p className="modal-description">
        {reschedule
          ? 'Escolha o novo horário. A equipe receberá a atualização na demonstração.'
          : 'Preencha os detalhes. A confirmação final acontece na conversa da recepção.'}
      </p>
      {!reschedule ? (
        <>
          <label>
            Carro
            <input
              name="vehicle"
              required
              maxLength={60}
              defaultValue={appointment?.vehicle}
              placeholder="Ex.: Amarok"
            />
          </label>
          <label>
            Serviço
            <input
              name="service"
              required
              maxLength={180}
              defaultValue={appointment?.service}
              placeholder="Ex.: Troca de 4 pneus"
            />
          </label>
        </>
      ) : null}
      <div className="form-row">
        <label>
          Data
          <input
            name="date"
            type="date"
            required
            min={DEMO_TODAY}
            max="2099-12-31"
            defaultValue={appointment?.date ?? DEMO_TOMORROW}
          />
        </label>
        <label>
          Horário
          <input
            name="time"
            type="time"
            required
            defaultValue={appointment?.time ?? '08:00'}
          />
        </label>
      </div>
      {!reschedule ? (
        <label>
          Responsável
          <select name="mechanic" defaultValue={appointment?.mechanic ?? ''}>
            <option value="">A definir</option>
            {MECHANICS.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
          <small>O serviço pode ser confirmado sem um mecânico definido.</small>
        </label>
      ) : null}
      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}
      <div className="modal-actions">
        <button
          className="button button-secondary"
          type="button"
          onClick={onCancel}
        >
          Voltar
        </button>
        <button className="button button-primary" type="submit">
          {reschedule ? 'Salvar novo horário' : 'Conferir na conversa'}
        </button>
      </div>
    </form>
  )
}

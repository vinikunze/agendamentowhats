'use client'

import { useState } from 'react'
import {
  appointmentDetails,
  dailyAgenda,
  DEMO_TOMORROW,
  formatDate,
  MECHANICS,
  parseBooking,
  type Appointment,
  type Mechanic,
} from '@/lib/agenda'
import {
  editPending,
  resetDemo,
  sendCommand,
  useAgenda,
} from '@/lib/agenda-store'
import { AgendaView } from './agenda-view'
import { BookingForm } from './booking-form'
import { Bubble, ChatPhone } from './chat-phone'
import { Icon } from './icons'
import { Modal } from './modal'

type Dialog =
  | { type: 'agenda' | 'new' | 'help' | 'reset' }
  | { type: 'edit' | 'reschedule' | 'cancel'; appointment: Appointment }

function focusReception() {
  document
    .getElementById('step-1')
    ?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'instant'
        : 'smooth',
      block: 'start',
    })
  document.getElementById('reception-message')?.focus({ preventScroll: true })
}

export function WorkshopDemo() {
  const { state, warning } = useAgenda()
  const [mechanic, setMechanic] = useState<Mechanic>('João')
  const [dialog, setDialog] = useState<Dialog | null>(null)
  const [receptionInput, setReceptionInput] = useState('')
  const pending = state.appointments.findLast((a) => a.status === 'pending')
  const examplePending = state.appointments.some(
    (a) => a.id === 23 && a.status === 'pending',
  )
  const unassigned = state.appointments.find(
    (a) => a.status === 'scheduled' && !a.mechanic,
  )
  const assigned =
    state.appointments.find(
      (a) => a.mechanic === mechanic && a.status === 'in_progress',
    ) ??
    state.appointments.find(
      (a) => a.mechanic === mechanic && a.status === 'scheduled',
    )
  const teamChannel = `team:${mechanic}` as const
  const progressChannel = `updates:${mechanic}` as const
  const teamMessages = state.messages.filter((m) => m.channel === teamChannel)
  const updateMessages = state.messages.filter(
    (m) => m.channel === progressChannel,
  )
  const help = () => setDialog({ type: 'help' })
  const close = () => setDialog(null)

  function saveBooking(command: string): string | null {
    if (dialog?.type === 'edit') {
      const error = editPending(dialog.appointment.id, command)
      if (error) return error
    } else {
      if (dialog?.type !== 'reschedule') {
        const parsed = parseBooking(command)
        if ('error' in parsed) return parsed.error
      }
      const next = sendCommand('reception', command)
      const last = next.messages.findLast(
        (m) => m.channel === 'reception' && m.sender === 'assistant',
      )
      if (
        dialog?.type === 'reschedule'
          ? !last?.title?.includes('remarcado')
          : !last?.title?.startsWith('Conferir agendamento')
      )
        return last?.text ?? 'Não foi possível registrar. Confira os dados.'
    }
    setDialog(null)
    window.setTimeout(focusReception, 0)
    return null
  }

  return (
    <>
      <header className="site-header container">
        <a
          className="brand"
          href="#inicio"
          aria-label="Agenda da Oficina — início"
        >
          <Icon name="chat" size={30} />
          <span>Agenda da Oficina</span>
        </a>
        <nav aria-label="Navegação principal">
          <a href="#como-funciona">Como funciona</a>
          <button onClick={() => setDialog({ type: 'agenda' })}>
            Ver agenda
          </button>
          <span className="demo-badge">
            <i />
            Demonstração
          </span>
        </nav>
      </header>
      <main id="inicio" className="container">
        <section className="hero" aria-labelledby="hero-title">
          <div>
            <h1 id="hero-title">
              Agenda da oficina.
              <br />
              Tudo pelo WhatsApp.
            </h1>
            <p className="hero-description">
              Você agenda por mensagem. A equipe recebe, assume e atualiza.
              Simples assim.
            </p>
            <div className="hero-actions">
              <button
                className="button button-primary"
                onClick={focusReception}
              >
                Experimentar agora
                <Icon name="arrow" size={18} />
              </button>
              <button
                className="button button-secondary"
                onClick={() => setDialog({ type: 'agenda' })}
              >
                Ver agenda
              </button>
            </div>
          </div>
          <aside className="hero-note">
            <Icon name="chat" size={29} />
            <div>
              <strong>Sem login para a equipe.</strong>
              <p>
                Mais tempo na oficina.
                <br />
                Menos tempo em telas.
              </p>
            </div>
          </aside>
        </section>
        {warning ? (
          <p className="storage-warning" role="status">
            {warning}
          </p>
        ) : null}
        <section id="como-funciona" aria-label="Experimente as quatro etapas">
          <div className="section-rule">
            <span>Da primeira mensagem ao serviço concluído</span>
            <span>01 — 04</span>
          </div>
          <div className="steps-grid">
            <article className="step-card" id="step-1">
              <div className="step-copy">
                <p className="eyebrow">Recepção · segunda à tarde</p>
                <h2>01. Você agenda</h2>
                <p className="step-description">
                  Escreva o carro, o serviço e o horário. Confira antes de
                  confirmar.
                </p>
              </div>
              <ChatPhone
                label="Recepção"
                messages={state.messages.filter(
                  (m) => m.channel === 'reception',
                )}
                onSend={(text) => sendCommand('reception', text)}
                onHelp={help}
                inputId="reception-message"
                value={receptionInput}
                onValueChange={setReceptionInput}
                actions={
                  pending ? (
                    <>
                      <button
                        className="chat-action chat-action-primary"
                        onClick={() =>
                          sendCommand('reception', `Confirmar ${pending.id}`)
                        }
                      >
                        <Icon name="check" size={15} />
                        Confirmar {pending.id}
                      </button>
                      <button
                        className="chat-action"
                        onClick={() =>
                          setDialog({ type: 'edit', appointment: pending })
                        }
                      >
                        Editar
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="chat-action chat-action-primary"
                        onClick={() => setDialog({ type: 'new' })}
                      >
                        <Icon name="plus" size={15} />
                        Novo agendamento
                      </button>
                      <button
                        className="chat-action"
                        onClick={() =>
                          sendCommand('reception', 'Agenda amanhã')
                        }
                      >
                        Agenda amanhã
                      </button>
                    </>
                  )
                }
              />
              <p className="step-note">
                O serviço pode entrar na agenda mesmo sem responsável.
              </p>
            </article>

            <article className="step-card" id="step-2">
              <div className="step-copy">
                <div className="step-topline">
                  <p className="eyebrow">Mecânico · aviso individual</p>
                  <label className="mechanic-select">
                    <span>Como:</span>
                    <select
                      aria-label="Conversando como"
                      value={mechanic}
                      onChange={(event) =>
                        setMechanic(event.target.value as Mechanic)
                      }
                    >
                      {MECHANICS.map((name) => (
                        <option key={name}>{name}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <h2>02. A equipe recebe</h2>
                <p className="step-description">
                  O serviço aparece para a equipe. Quem vai atender responde por
                  aqui.
                </p>
              </div>
              <ChatPhone
                label={`Equipe — ${mechanic}`}
                clock="15:43"
                messages={teamMessages}
                onSend={(text) => sendCommand(teamChannel, text)}
                onHelp={help}
                actions={
                  !examplePending && unassigned ? (
                    <button
                      className="chat-action chat-action-primary"
                      onClick={() =>
                        sendCommand(teamChannel, `Assumir ${unassigned.id}`)
                      }
                    >
                      <Icon name="check" size={15} />
                      Assumir {unassigned.id}
                    </button>
                  ) : assigned ? (
                    <button
                      className="chat-action chat-action-primary"
                      onClick={() =>
                        document
                          .getElementById('step-4')
                          ?.scrollIntoView({ block: 'start' })
                      }
                    >
                      Ver meu serviço
                      <Icon name="arrow" size={15} />
                    </button>
                  ) : null
                }
              >
                {!teamMessages.length ? (
                  <Bubble
                    message={{
                      sender: 'assistant',
                      title: 'Pronto para receber os avisos',
                      text: `Confirme o agendamento #23 na recepção. O aviso aparecerá aqui para ${mechanic} e para o restante da equipe.`,
                      time: '15:43',
                    }}
                  />
                ) : null}
              </ChatPhone>
              <p className="step-note">
                Escolha outro mecânico acima e veja a mesma agenda.
              </p>
            </article>

            <article className="step-card" id="step-3">
              <div className="step-copy">
                <p className="eyebrow">Equipe · terça às 7h</p>
                <h2>03. O dia já vem organizado</h2>
                <p className="step-description">
                  Consulte a agenda e veja quem vai atender cada carro.
                </p>
              </div>
              <ChatPhone
                label="Resumo da equipe"
                clock="07:00"
                day="TERÇA, 06 DE OUTUBRO"
                messages={state.messages.filter((m) => m.channel === 'agenda')}
                onSend={(text) => sendCommand('agenda', text)}
                onHelp={help}
                actions={
                  <button
                    className="chat-action chat-action-primary"
                    onClick={() => sendCommand('agenda', 'Agenda amanhã')}
                  >
                    <Icon name="calendar" size={16} />
                    Agenda amanhã
                  </button>
                }
              >
                <Bubble
                  message={{
                    sender: 'assistant',
                    title: `Agenda de terça · ${formatDate(DEMO_TOMORROW)}`,
                    text: dailyAgenda(state, DEMO_TOMORROW),
                    time: '07:00',
                  }}
                />
              </ChatPhone>
              <p className="step-note">
                O resumo acompanha as confirmações e atualizações.
              </p>
            </article>

            <article className="step-card" id="step-4">
              <div className="step-copy">
                <p className="eyebrow">{mechanic} · durante o serviço</p>
                <h2>04. Atualizar é responder</h2>
                <p className="step-description">
                  Avise quando começar e quando terminar. A agenda acompanha.
                </p>
              </div>
              <ChatPhone
                label={`Atendimento — ${mechanic}`}
                clock="09:05"
                day="TERÇA, 06 DE OUTUBRO"
                messages={updateMessages}
                onSend={(text) => sendCommand(progressChannel, text)}
                onHelp={help}
                actions={
                  assigned ? (
                    <button
                      className="chat-action chat-action-primary"
                      onClick={() =>
                        sendCommand(
                          progressChannel,
                          `${assigned.status === 'in_progress' ? 'Finalizar' : 'Começar'} ${assigned.id}`,
                        )
                      }
                    >
                      <Icon name="check" size={15} />
                      {assigned.status === 'in_progress'
                        ? 'Finalizar'
                        : 'Começar'}{' '}
                      {assigned.id}
                    </button>
                  ) : null
                }
              >
                {!updateMessages.length ? (
                  <Bubble
                    message={{
                      sender: 'assistant',
                      title: assigned
                        ? `Seu próximo serviço · #${assigned.id}`
                        : 'Seu próximo serviço começa aqui',
                      text: assigned
                        ? appointmentDetails(assigned)
                        : 'Assuma um agendamento na conversa da equipe. Depois, registre o início e a conclusão por aqui.',
                      time: '08:00',
                    }}
                  />
                ) : null}
              </ChatPhone>
              <p className="step-note">
                A recepção acompanha. O histórico fica na conversa.
              </p>
            </article>
          </div>
        </section>
        <section className="closing-band">
          <div>
            <h2>
              O mecânico recebe, responde
              <br />e continua trabalhando.
            </h2>
            <p>
              Agenda hoje <span>·</span> Assumir 23 <span>·</span> Começar 23{' '}
              <span>·</span> Finalizar 23
            </p>
          </div>
          <button
            className="closing-action"
            onClick={() => setDialog({ type: 'new' })}
          >
            Criar um agendamento
            <Icon name="arrow" size={19} />
          </button>
        </section>
        <footer className="site-footer">
          <div>
            <p>
              Demonstração com dados ilustrativos. Nenhuma mensagem real é
              enviada.
            </p>
            <span>
              Salvo neste navegador · Semana de exemplo: 05 a 11/10/2026
            </span>
          </div>
          <button onClick={() => setDialog({ type: 'reset' })}>
            <Icon name="reset" size={14} />
            Recomeçar demonstração
          </button>
        </footer>
      </main>
      {dialog ? (
        <Modal
          title={
            dialog.type === 'agenda'
              ? 'Agenda da oficina'
              : dialog.type === 'new'
                ? 'Novo agendamento'
                : dialog.type === 'edit'
                  ? `Editar agendamento #${dialog.appointment.id}`
                  : dialog.type === 'reschedule'
                    ? `Remarcar #${dialog.appointment.id}`
                    : dialog.type === 'cancel'
                      ? `Cancelar agendamento #${dialog.appointment.id}?`
                      : dialog.type === 'reset'
                        ? 'Recomeçar a demonstração?'
                        : 'Uma mensagem resolve'
          }
          onClose={close}
          wide={dialog.type === 'agenda'}
        >
          {dialog.type === 'agenda' ? (
            <AgendaView
              appointments={state.appointments}
              onNew={() => setDialog({ type: 'new' })}
              onConfirm={(id) => {
                sendCommand('reception', `Confirmar ${id}`)
                close()
                window.setTimeout(focusReception, 0)
              }}
              onReschedule={(appointment) =>
                setDialog({ type: 'reschedule', appointment })
              }
              onCancel={(appointment) =>
                setDialog({ type: 'cancel', appointment })
              }
            />
          ) : null}
          {dialog.type === 'new' ||
          dialog.type === 'edit' ||
          dialog.type === 'reschedule' ? (
            <BookingForm
              key={dialog.type}
              appointment={
                'appointment' in dialog ? dialog.appointment : undefined
              }
              reschedule={dialog.type === 'reschedule'}
              onSave={saveBooking}
              onCancel={close}
            />
          ) : null}
          {dialog.type === 'reset' ? (
            <>
              <p className="modal-description">
                Os agendamentos e as mensagens desta demonstração serão
                substituídos pelos exemplos iniciais. Isso afeta apenas os dados
                salvos neste navegador.
              </p>
              <div className="modal-actions">
                <button className="button button-secondary" onClick={close}>
                  Continuar como está
                </button>
                <button
                  className="button button-primary"
                  onClick={() => {
                    resetDemo()
                    setMechanic('João')
                    setReceptionInput('')
                    close()
                  }}
                >
                  Recomeçar
                </button>
              </div>
            </>
          ) : null}
          {dialog.type === 'cancel' ? (
            <>
              <p className="modal-description">
                {dialog.appointment.vehicle} · {dialog.appointment.service}
                <br />
                {formatDate(dialog.appointment.date)} às{' '}
                {dialog.appointment.time}
                <br />
                <br />O serviço sai do resumo da equipe. O histórico continua
                disponível na agenda.
              </p>
              <div className="modal-actions">
                <button className="button button-secondary" onClick={close}>
                  Manter agendamento
                </button>
                <button
                  className="button button-primary"
                  onClick={() => {
                    sendCommand(
                      'reception',
                      `Cancelar ${dialog.appointment.id}`,
                    )
                    setDialog({ type: 'agenda' })
                  }}
                >
                  Confirmar cancelamento
                </button>
              </div>
            </>
          ) : null}
          {dialog.type === 'help' ? (
            <div className="help-content">
              <p className="modal-description">
                Escreva nas conversas ou use os botões sugeridos. A segunda e a
                quarta conversa usam o mecânico selecionado.
              </p>
              <dl>
                <dt>Agendar na recepção</dt>
                <dd>
                  Agendar amanhã às 8h: Amarok, troca de 4 pneus. Sem mecânico
                  definido.
                </dd>
                <dt>Definir alguém ao agendar</dt>
                <dd>Agendar 07/10 às 10h: Gol, revisão. Com João.</dd>
                <dt>Confirmar ou organizar</dt>
                <dd>
                  Confirmar 23
                  <br />
                  Remarcar 23 para 07/10 às 10h
                  <br />
                  Cancelar 23
                </dd>
                <dt>Assumir e atualizar</dt>
                <dd>Assumir 23 · Começar 23 · Finalizar 23</dd>
                <dt>Consultar outro dia</dt>
                <dd>Agenda hoje · Agenda amanhã · Agenda 07/10</dd>
              </dl>
              <p className="help-note">
                “Hoje” é segunda, 05/10/2026, nesta demonstração. Os comandos
                usam formatos definidos; não há inteligência artificial nem
                conexão com o WhatsApp. O resumo da manhã é simulado, sem
                disparos automáticos.
              </p>
              <button
                className="button button-primary"
                onClick={() => {
                  close()
                  window.setTimeout(focusReception, 0)
                }}
              >
                Experimentar na conversa
                <Icon name="arrow" size={16} />
              </button>
            </div>
          ) : null}
        </Modal>
      ) : null}
    </>
  )
}

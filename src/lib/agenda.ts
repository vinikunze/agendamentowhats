export const DEMO_TODAY = '2026-10-05'
export const DEMO_TOMORROW = '2026-10-06'
export const MECHANICS = ['João', 'Pedro', 'Marcos'] as const
export type Mechanic = string

export type CommandContext = {
  today?: string
  mechanics?: readonly string[]
  clock?: string
  live?: boolean
}
export type Status =
  | 'pending'
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
export type Channel =
  | 'reception'
  | 'agenda'
  | `team:${Mechanic}`
  | `updates:${Mechanic}`

export type Appointment = {
  id: number
  vehicle: string
  service: string
  date: string
  time: string
  mechanic: Mechanic | null
  status: Status
}

export type Message = {
  id: number
  channel: Channel
  sender: 'user' | 'assistant'
  title?: string
  text: string
  time: string
  appointmentId?: number
}

export type AgendaState = {
  version: 1
  nextId: number
  nextMessageId: number
  appointments: Appointment[]
  messages: Message[]
}

export const STATUS_LABELS: Record<Status, string> = {
  pending: 'A confirmar',
  scheduled: 'Agendado',
  in_progress: 'Em atendimento',
  completed: 'Concluído',
  cancelled: 'Cancelado',
}

export function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

export function formatDate(date: string, weekday = false) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    ...(weekday ? { weekday: 'short' as const } : {}),
    timeZone: 'UTC',
  }).format(new Date(`${date}T12:00:00Z`))
}

export function isValidDate(value: string): boolean {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(`${value}T12:00:00Z`)) &&
    new Date(`${value}T12:00:00Z`).toISOString().slice(0, 10) === value
  )
}

export function parseDate(value: string, today = DEMO_TODAY): string | null {
  const date = normalize(value).replace(/^dia\s+/, '')
  if (date === 'hoje') return today
  if (date === 'amanha') {
    const tomorrow = new Date(`${today}T12:00:00Z`)
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
    return tomorrow.toISOString().slice(0, 10)
  }
  if (isValidDate(date)) return date
  const short = date.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?$/)
  if (short) {
    const result = `${short[3] ?? today.slice(0, 4)}-${short[2].padStart(2, '0')}-${short[1].padStart(2, '0')}`
    return isValidDate(result) ? result : null
  }
  const days = [
    'domingo',
    'segunda',
    'terca',
    'quarta',
    'quinta',
    'sexta',
    'sabado',
  ]
  const day = days.indexOf(date.replace(/-feira$/, ''))
  if (day === -1) return null
  const result = new Date(`${today}T12:00:00Z`)
  result.setUTCDate(result.getUTCDate() + ((day - result.getUTCDay() + 7) % 7))
  return result.toISOString().slice(0, 10)
}

export function appointmentDetails(item: Appointment) {
  return `${formatDate(item.date, true)} · ${item.time}\n${item.vehicle} · ${item.service}\nResponsável: ${item.mechanic ?? 'a definir'}`
}

export function dailyAgenda(state: AgendaState, date: string) {
  const items = state.appointments
    .filter(
      (a) =>
        a.date === date && a.status !== 'pending' && a.status !== 'cancelled',
    )
    .toSorted((a, b) => a.time.localeCompare(b.time) || a.id - b.id)
  if (!items.length)
    return 'Nenhum carro agendado para este dia.\nOs agendamentos aparecem aqui depois da confirmação.'
  return (
    `${items.length} ${items.length === 1 ? 'carro agendado' : 'carros agendados'}\n\n` +
    items
      .map(
        (item) =>
          `${item.time} · #${item.id} ${item.vehicle}\n${item.service} · ${item.mechanic ?? 'A definir'}${item.status === 'scheduled' ? '' : `\n${STATUS_LABELS[item.status]}`}`,
      )
      .join('\n\n')
  )
}

export function createInitialState(): AgendaState {
  const amarok: Appointment = {
    id: 23,
    vehicle: 'Amarok',
    service: 'Troca de 4 pneus',
    date: DEMO_TOMORROW,
    time: '08:00',
    mechanic: null,
    status: 'pending',
  }
  return {
    version: 1,
    nextId: 26,
    nextMessageId: 3,
    appointments: [
      amarok,
      {
        id: 24,
        vehicle: 'Corolla',
        service: 'Troca de óleo',
        date: DEMO_TOMORROW,
        time: '09:30',
        mechanic: 'Pedro',
        status: 'scheduled',
      },
      {
        id: 25,
        vehicle: 'S10',
        service: 'Revisão de freios',
        date: DEMO_TOMORROW,
        time: '14:00',
        mechanic: null,
        status: 'scheduled',
      },
    ],
    messages: [
      {
        id: 1,
        channel: 'reception',
        sender: 'user',
        text: 'Agendar amanhã às 8h: Amarok, troca de 4 pneus. Sem mecânico definido.',
        time: '15:42',
      },
      {
        id: 2,
        channel: 'reception',
        sender: 'assistant',
        title: 'Conferir agendamento #23',
        text: appointmentDetails(amarok),
        time: '15:42',
        appointmentId: 23,
      },
    ],
  }
}

type ParsedBooking = Omit<Appointment, 'id' | 'status'>
type BookingResult = { booking: ParsedBooking } | { error: string }

export function parseBooking(input: string, context: CommandContext = {}): BookingResult {
  const today = context.today ?? DEMO_TODAY
  const mechanics = context.mechanics ?? MECHANICS
  const match = input
    .trim()
    .match(
      /^agendar\s+(.+?)\s+[àa]s?\s+(\d{1,2})(?:(?::|h)(\d{2})?)?\s*[:.,-]\s*(.+)$/i,
    )
  if (!match)
    return {
      error:
        'Use este formato:\nAgendar amanhã às 8h: Amarok, troca de 4 pneus.\nVocê também pode usar uma data, como 07/10, ou abrir “Novo agendamento”.',
    }
  const date = parseDate(match[1], today)
  const hour = Number(match[2])
  const minute = Number(match[3] ?? '0')
  if (!date || hour > 23 || minute > 59)
    return {
      error:
        'Confira a data e o horário. Exemplo: Agendar 07/10 às 9h30: Gol, troca de óleo.',
    }
  if (date < today)
    return {
      error:
        `Escolha uma data a partir de ${formatDate(today)}/${today.slice(0, 4)}.`,
    }
  let details = match[4].replace(/[.\s]+$/, '')
  let mechanic: Mechanic | null = null
  const assignee = details.match(
    /[.,]\s*(?:com|respons[aá]vel:?|mec[aâ]nico:?)\s+(.+)$/i,
  )
  if (assignee) {
    mechanic =
      mechanics.find((name) => normalize(name) === normalize(assignee[1])) ??
      null
    if (!mechanic)
      return {
        error:
          `Os mecânicos cadastrados são ${mechanics.join(', ')}. Você também pode deixar sem responsável.`,
      }
    details = details.slice(0, assignee.index)
  }
  details = details.replace(
    /[.,]\s*(?:sem mec[aâ]nico(?: definido)?|sem respons[aá]vel|a definir)$/i,
    '',
  )
  const separator = details.indexOf(',')
  if (separator === -1)
    return {
      error:
        'Separe o carro e o serviço com uma vírgula. Exemplo: Amarok, troca de 4 pneus.',
    }
  const vehicle = details.slice(0, separator).trim()
  const service = details
    .slice(separator + 1)
    .trim()
    .replace(/[.\s]+$/, '')
  if (!vehicle || !service || vehicle.length > 60 || service.length > 180)
    return {
      error:
        'Informe um carro (até 60 caracteres) e um serviço (até 180 caracteres).',
    }
  return {
    booking: {
      vehicle,
      service: service[0].toUpperCase() + service.slice(1),
      date,
      time: `${match[2].padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
      mechanic,
    },
  }
}

export function processCommand(
  previous: AgendaState,
  channel: Channel,
  input: string,
  context: CommandContext = {},
): AgendaState {
  const today = context.today ?? DEMO_TODAY
  const mechanics = context.mechanics ?? MECHANICS
  const text = input.trim().slice(0, 500)
  if (!text) return previous
  const state: AgendaState = {
    ...previous,
    appointments: previous.appointments.map((a) => ({ ...a })),
    messages: [...previous.messages],
  }
  const clock = context.clock ?? (channel.startsWith('updates:')
    ? '09:05'
    : channel === 'agenda'
      ? '07:00'
      : '15:43')
  function message(
    target: Channel,
    body: string,
    title?: string,
    appointmentId?: number,
    sender: Message['sender'] = 'assistant',
  ) {
    state.messages.push({
      id: state.nextMessageId++,
      channel: target,
      text: body,
      ...(title === undefined ? {} : { title }),
      ...(appointmentId === undefined ? {} : { appointmentId }),
      sender,
      time: clock,
    })
    // Keep all appointments; bound only the conversation history stored on this device.
    if (state.messages.length > 300) state.messages = state.messages.slice(-300)
  }
  function reply(body: string, title?: string, appointmentId?: number) {
    message(channel, body, title, appointmentId)
  }
  function notifyTeam(item: Appointment, title: string) {
    for (const name of mechanics)
      message(`team:${name}`, appointmentDetails(item), title, item.id)
  }
  const actor = channel.includes(':')
    ? (channel.slice(channel.indexOf(':') + 1) as Mechanic)
    : null
  const command = normalize(text)
  message(channel, text, undefined, undefined, 'user')

  if (command.startsWith('agendar ')) {
    if (channel !== 'reception') {
      reply('Novos agendamentos são feitos na conversa da recepção.')
      return state
    }
    const result = parseBooking(text, context)
    if ('error' in result) {
      reply(result.error, 'Vamos conferir a mensagem')
      return state
    }
    const duplicate = state.appointments.find(
      (a) =>
        a.status !== 'cancelled' &&
        a.date === result.booking.date &&
        a.time === result.booking.time &&
        normalize(a.vehicle) === normalize(result.booking.vehicle),
    )
    if (duplicate) {
      reply(
        `Já existe o agendamento #${duplicate.id} para este carro, data e horário. Use a agenda para conferir ou remarcar.`,
        'Agendamento já registrado',
      )
      return state
    }
    const item: Appointment = {
      ...result.booking,
      id: state.nextId++,
      status: 'pending',
    }
    state.appointments.push(item)
    reply(appointmentDetails(item), `Conferir agendamento #${item.id}`, item.id)
    return state
  }

  const agenda = command.match(/^agenda(?:\s+(.+))?$/)
  if (agenda) {
    const date = parseDate(agenda[1] || 'hoje', today)
    if (!date) {
      reply('Peça “Agenda hoje”, “Agenda amanhã” ou “Agenda 07/10”.')
      return state
    }
    reply(dailyAgenda(state, date), `Agenda · ${formatDate(date, true)}`)
    return state
  }

  const action = command.match(
    /^(confirmar|assumir|comecar|finalizar|cancelar|remarcar)\s+#?(\d+)(?:\s+(.+))?$/,
  )
  if (!action) {
    reply(
      channel === 'reception'
        ? 'Você pode agendar, confirmar, cancelar ou remarcar.\nExemplos: Confirmar 23 · Cancelar 23 · Remarcar 23 para 07/10 às 10h · Agenda amanhã.'
        : 'Experimente: Agenda amanhã · Assumir 23 · Começar 23 · Finalizar 23.\nCada comando usa o número do agendamento.',
      'Como posso ajudar?',
    )
    return state
  }
  const [, verb, id, rest] = action
  const item = state.appointments.find((a) => a.id === Number(id))
  if (!item) {
    reply(
      `Não encontrei o agendamento #${id}. Consulte “Agenda amanhã” ou “Ver agenda”.`,
    )
    return state
  }
  if (verb !== 'remarcar' && rest) {
    reply(`Use apenas “${text.split(' ')[0]} ${id}”.`)
    return state
  }
  if (
    ['confirmar', 'cancelar', 'remarcar'].includes(verb) &&
    channel !== 'reception'
  ) {
    reply(context.live ? 'Somente a recepção pode confirmar, cancelar e remarcar.' : 'A recepção confirma, cancela e remarca. Use a primeira conversa.')
    return state
  }
  if (verb === 'confirmar') {
    if (item.status !== 'pending') {
      reply(
        `O agendamento #${id} já está ${STATUS_LABELS[item.status].toLowerCase()}. Não foi criado outro aviso.`,
      )
      return state
    }
    const conflict = state.appointments.find(
      (a) =>
        a.id !== item.id &&
        item.mechanic &&
        a.mechanic === item.mechanic &&
        a.date === item.date &&
        a.time === item.time &&
        ['scheduled', 'in_progress'].includes(a.status),
    )
    if (conflict) {
      reply(
        `${item.mechanic} já tem o serviço #${conflict.id} neste horário. Edite o agendamento antes de confirmar.`,
        'Horário ocupado',
      )
      return state
    }
    item.status = 'scheduled'
    reply(
      context.live
        ? 'Agendamento salvo. Os avisos para a equipe com notificações ativas foram colocados na fila de envio.'
        : 'A equipe recebeu o aviso nesta demonstração.\nVocê pode remarcar por aqui.',
      'Agendamento salvo',
      item.id,
    )
    notifyTeam(item, `Novo agendamento #${id}`)
    return state
  }
  if (verb === 'cancelar') {
    if (item.status === 'completed' || item.status === 'cancelled') {
      reply(`O serviço já está ${STATUS_LABELS[item.status].toLowerCase()}.`)
      return state
    }
    const wasPending = item.status === 'pending'
    item.status = 'cancelled'
    reply(
      `${item.vehicle} saiu da agenda. O histórico foi mantido.`,
      `Agendamento #${id} cancelado`,
    )
    if (!wasPending) notifyTeam(item, `Agendamento #${id} cancelado`)
    return state
  }
  if (verb === 'remarcar') {
    if (!['pending', 'scheduled'].includes(item.status)) {
      reply('Só é possível remarcar um serviço que ainda não começou.')
      return state
    }
    const match = rest?.match(
      /^(?:para\s+)?(.+?)\s+as?\s+(\d{1,2})(?:(?::|h)(\d{2})?)?$/,
    )
    const date = match ? parseDate(match[1], today) : null
    if (
      !match ||
      !date ||
      date < today ||
      Number(match[2]) > 23 ||
      Number(match[3] ?? '0') > 59
    ) {
      reply(
        `Use: Remarcar ${id} para amanhã às 10h. A data deve ser a partir de ${formatDate(today)}.`,
      )
      return state
    }
    const time = `${match[2].padStart(2, '0')}:${match[3] ?? '00'}`
    const conflict = state.appointments.find(
      (a) =>
        a.id !== item.id &&
        a.date === date &&
        a.time === time &&
        !['cancelled', 'completed'].includes(a.status) &&
        (normalize(a.vehicle) === normalize(item.vehicle) ||
          (item.mechanic && a.mechanic === item.mechanic)),
    )
    if (conflict) {
      reply(
        `O carro ou responsável já tem o agendamento #${conflict.id} neste horário. Escolha outro horário.`,
      )
      return state
    }
    item.date = date
    item.time = time
    reply(appointmentDetails(item), `Agendamento #${id} remarcado`, item.id)
    if (item.status === 'scheduled') notifyTeam(item, `Novo horário · #${id}`)
    return state
  }
  if (!actor) {
    reply(
      context.live ? 'Somente um mecânico cadastrado pode assumir ou atualizar o serviço.' : 'Selecione um mecânico na segunda conversa para assumir ou atualizar o serviço.',
    )
    return state
  }
  if (item.status === 'pending') {
    reply('A recepção ainda precisa confirmar este agendamento.')
    return state
  }
  if (item.status === 'cancelled' || item.status === 'completed') {
    reply(`Este serviço já está ${STATUS_LABELS[item.status].toLowerCase()}.`)
    return state
  }
  if (verb === 'assumir') {
    if (item.mechanic) {
      reply(
        item.mechanic === actor
          ? `O serviço #${id} já está com você.`
          : `${item.mechanic} já assumiu este serviço. Ele continua com esse responsável.`,
        'Responsável definido',
      )
      return state
    }
    const conflict = state.appointments.find(
      (a) =>
        a.id !== item.id &&
        a.mechanic === actor &&
        a.date === item.date &&
        a.time === item.time &&
        ['scheduled', 'in_progress'].includes(a.status),
    )
    if (conflict) {
      reply(
        `Você já tem o serviço #${conflict.id} neste horário. Peça à recepção para organizar os horários.`,
      )
      return state
    }
    item.mechanic = actor
    reply(
      `${actor}, ${item.vehicle} ficou com você.\nA agenda da equipe foi atualizada.`,
      'Serviço atribuído a você',
      item.id,
    )
    message(
      'reception',
      `${actor} assumiu ${item.vehicle}.`,
      `Responsável definido · #${id}`,
    )
    return state
  }
  if (item.mechanic !== actor) {
    reply(
      item.mechanic
        ? `Este serviço está com ${item.mechanic}. Só o responsável pode atualizá-lo.`
        : `Assuma o serviço primeiro: Assumir ${id}.`,
    )
    return state
  }
  if (verb === 'comecar') {
    if (item.status !== 'scheduled') {
      reply('Este serviço já está em atendimento.')
      return state
    }
    item.status = 'in_progress'
    reply(
      `Início registrado.\nResponsável: ${actor}.`,
      `${item.vehicle} em atendimento`,
      item.id,
    )
    message(
      'reception',
      `${actor} começou o serviço de ${item.vehicle}.`,
      `Em atendimento · #${id}`,
    )
  } else if (verb === 'finalizar') {
    if (item.status !== 'in_progress') {
      reply(`Registre o início antes de concluir: Começar ${id}.`)
      return state
    }
    item.status = 'completed'
    reply(
      `${item.vehicle} · ${item.service}\nFinalizado por ${actor}.\n${context.live ? 'Atualização registrada na agenda da recepção.' : 'A recepção recebeu a atualização.'}`,
      `Serviço #${id} concluído`,
      item.id,
    )
    message(
      'reception',
      `${actor} finalizou ${item.vehicle} · ${item.service}.`,
      `Serviço #${id} concluído`,
    )
  }
  return state
}

export function parseSavedState(raw: string): AgendaState | null {
  try {
    const data = JSON.parse(raw) as AgendaState
    if (
      !data ||
      data.version !== 1 ||
      !Array.isArray(data.appointments) ||
      !Array.isArray(data.messages) ||
      !Number.isSafeInteger(data.nextId) ||
      !Number.isSafeInteger(data.nextMessageId) ||
      data.nextId < 1 ||
      data.nextMessageId < 1
    )
      return null
    const validItems = data.appointments.every(
      (a) =>
        a &&
        Number.isSafeInteger(a.id) &&
        a.id > 0 &&
        a.id < data.nextId &&
        typeof a.vehicle === 'string' &&
        a.vehicle.length > 0 &&
        a.vehicle.length <= 60 &&
        typeof a.service === 'string' &&
        a.service.length > 0 &&
        a.service.length <= 180 &&
        typeof a.date === 'string' &&
        isValidDate(a.date) &&
        typeof a.time === 'string' &&
        /^([01]\d|2[0-3]):[0-5]\d$/.test(a.time) &&
        Object.hasOwn(STATUS_LABELS, a.status) &&
        (a.mechanic === null || MECHANICS.some((name) => name === a.mechanic)),
    )
    const channels: string[] = [
      'reception',
      'agenda',
      ...MECHANICS.flatMap((n) => [`team:${n}`, `updates:${n}`]),
    ]
    const validMessages =
      data.messages.length <= 300 &&
      data.messages.every(
        (m) =>
          m &&
          Number.isSafeInteger(m.id) &&
          m.id > 0 &&
          m.id < data.nextMessageId &&
          channels.includes(m.channel) &&
          ['user', 'assistant'].includes(m.sender) &&
          typeof m.text === 'string' &&
          typeof m.time === 'string' &&
          (m.title === undefined || typeof m.title === 'string') &&
          (m.appointmentId === undefined ||
            Number.isSafeInteger(m.appointmentId)),
      )
    if (
      !validItems ||
      !validMessages ||
      new Set(data.appointments.map((a) => a.id)).size !==
        data.appointments.length
    )
      return null
    return data
  } catch {
    return null
  }
}

import { normalize } from '../src/lib/agenda.ts'

export function loadConfig(env = process.env) {
  const required = ['WHATSAPP_ACCESS_TOKEN', 'WHATSAPP_APP_SECRET', 'WHATSAPP_VERIFY_TOKEN', 'WHATSAPP_PHONE_NUMBER_ID', 'WHATSAPP_GRAPH_VERSION', 'WHATSAPP_TEAM_JSON', 'DATABASE_PATH']
  for (const key of required) if (!env[key]?.trim()) throw new Error(`Configure ${key}.`)
  if (!/^\d+$/.test(env.WHATSAPP_PHONE_NUMBER_ID)) throw new Error('WHATSAPP_PHONE_NUMBER_ID inválido.')
  if (!/^v\d+\.0$/.test(env.WHATSAPP_GRAPH_VERSION)) throw new Error('WHATSAPP_GRAPH_VERSION inválida; use a versão indicada pela Meta.')
  if (env.WHATSAPP_VERIFY_TOKEN.length < 32) throw new Error('WHATSAPP_VERIFY_TOKEN deve ter pelo menos 32 caracteres aleatórios.')
  let team
  try { team = JSON.parse(env.WHATSAPP_TEAM_JSON) } catch { throw new Error('WHATSAPP_TEAM_JSON deve ser JSON válido.') }
  if (!Array.isArray(team) || team.length < 2 || team.length > 30 || team.some((p) =>
    !p || typeof p.name !== 'string' || !/^[\p{L}\p{N} ._-]{1,50}$/u.test(p.name) ||
    p.name !== p.name.trim() || !/^[1-9]\d{7,14}$/.test(p.phone) || typeof p.phone !== 'string' ||
    !['reception', 'mechanic'].includes(p.role)
  )) throw new Error('Cadastre 2 a 30 participantes: name, phone (DDD e país, somente dígitos) e role (reception ou mechanic).')
  if (new Set(team.map((p) => p.phone)).size !== team.length || new Set(team.map((p) => normalize(p.name))).size !== team.length)
    throw new Error('Cada participante precisa de telefone e nome únicos.')
  if (!team.some((p) => p.role === 'reception') || !team.some((p) => p.role === 'mechanic')) throw new Error('Cadastre pelo menos uma recepção e um mecânico.')
  const timeZone = env.WORKSHOP_TIMEZONE || 'America/Cuiaba'
  new Intl.DateTimeFormat('pt-BR', { timeZone }).format(new Date())
  const summaryTime = env.WORKSHOP_SUMMARY_TIME || '07:00'
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(summaryTime)) throw new Error('WORKSHOP_SUMMARY_TIME inválido.')
  const port = Number(env.PORT || 8080)
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT inválida.')
  const template = env.WHATSAPP_NOTICE_TEMPLATE || ''
  if (template && !/^[a-z0-9_]+$/.test(template)) throw new Error('WHATSAPP_NOTICE_TEMPLATE inválido.')
  const language = env.WHATSAPP_TEMPLATE_LANGUAGE || 'pt_BR'
  if (!/^[a-z]{2}(?:_[A-Z]{2})?$/.test(language)) throw new Error('WHATSAPP_TEMPLATE_LANGUAGE inválido.')
  return { token: env.WHATSAPP_ACCESS_TOKEN, appSecret: env.WHATSAPP_APP_SECRET, verifyToken: env.WHATSAPP_VERIFY_TOKEN,
    phoneNumberId: env.WHATSAPP_PHONE_NUMBER_ID, graphVersion: env.WHATSAPP_GRAPH_VERSION,
    team, timeZone, summaryTime, port, databasePath: env.DATABASE_PATH, template, language }
}

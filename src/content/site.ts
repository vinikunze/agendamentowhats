/**
 * ============================================================================
 * FONTE ÚNICA DE CONTEÚDO — BORMANN JR.
 * ============================================================================
 *
 * Tudo que o site exibe vem daqui. Edite este arquivo e o site inteiro muda.
 *
 * REGRA DO PROJETO: nada é inventado.
 *
 *   `confirmed`  → dados verificados em fontes públicas (bio do Instagram,
 *                  registro da empresa, canais oficiais). Pode publicar.
 *
 *   `pending`    → dados que AINDA PRECISAM SER FORNECIDOS pelo cliente.
 *                  Enquanto forem `null` ou `[]`, as seções que dependem
 *                  deles simplesmente NÃO SÃO RENDERIZADAS. O site continua
 *                  coerente, sem buracos e sem informação falsa.
 *
 *   `draftCopy`  → textos editoriais provisórios, escritos a partir do
 *                  posicionamento real (hair stylist · visagista · Wella
 *                  Expert Team · creative director). Não afirmam fatos não
 *                  verificados (anos de experiência, número de clientes,
 *                  prêmios). Devem ser revisados na voz do Bormann.
 *
 * Veja o README para o checklist do que falta.
 * ============================================================================
 */

/* -------------------------------------------------------------------------- */
/* 1. IDENTIDADE — CONFIRMADO                                                  */
/* -------------------------------------------------------------------------- */

export const person = {
  /** Confirmado — nome público usado nos canais. */
  name: 'Bormann Jr.',
  /** Confirmado — usado no logotipo/wordmark. */
  wordmark: 'BORMANN JR.',
  /** Confirmado — bio do Instagram @bormannjr: "Hair Stylist". */
  role: 'Hair Stylist',
  /** Confirmado — descritor usado nos canais oficiais (YouTube/Facebook). */
  discipline: 'Visagista',
  /** Confirmado — bio do Instagram: "EXPERT TEAM @wellaprobrasil". */
  credential: {
    label: 'Expert Team',
    brand: 'Wella Professionals Brasil',
    handle: 'wellaprobrasil',
    url: 'https://www.instagram.com/wellaprobrasil/',
  },
  /** Confirmado — bio do Instagram: "Creative Director - @bormannjrconcept". */
  title: 'Creative Director',
} as const

export const concept = {
  /** Confirmado — nome da marca. */
  name: 'Bormann Jr Concept',
  wordmark: 'BORMANN JR CONCEPT',
  /** Confirmado — registro da empresa em Sinop/MT. */
  city: 'Sinop',
  state: 'MT',
  stateFull: 'Mato Grosso',
  country: 'BR',
  /**
   * Confirmado — atividade registrada da empresa
   * (cabeleireiros, manicure e pedicure).
   * Mantido genérico de propósito: a lista real de serviços é `pending`.
   */
  activity: 'Cabeleireiros, manicure e pedicure',
} as const

export const social = {
  /** Confirmado. */
  personal: {
    handle: '@bormannjr',
    url: 'https://www.instagram.com/bormannjr/',
    label: 'Instagram pessoal',
  },
  /** Confirmado. */
  concept: {
    handle: '@bormannjrconcept',
    url: 'https://www.instagram.com/bormannjrconcept/',
    label: 'Instagram do Concept',
  },
} as const

/* -------------------------------------------------------------------------- */
/* 2. CONTATO — PENDENTE DE CONFIRMAÇÃO                                        */
/* -------------------------------------------------------------------------- */
/**
 * ATENÇÃO: existem números e endereços circulando em diretórios online
 * associados ao "Salão WSW" — uma marca RELACIONADA, porém DISTINTA do
 * Bormann Jr Concept. Nada disso foi confirmado pelo cliente, então nada
 * disso está aqui.
 *
 * Preencha e as seções de contato/agendamento aparecem automaticamente,
 * incluindo o Schema.org de negócio local.
 */

export type Contact = {
  /** Ex.: '5566999999999' (somente dígitos, com DDI 55). */
  whatsapp: string | null
  /** Ex.: '(66) 99999-9999' — exibição formatada. */
  phoneDisplay: string | null
  /** Link de plataforma de agendamento, se existir. */
  bookingUrl: string | null
  address: {
    street: string
    district: string
    city: string
    state: string
    postalCode: string
  } | null
  /** Ex.: [{ days: 'Terça a sexta', hours: '09h — 19h' }] */
  hours: { days: string; hours: string }[]
  email: string | null
  /** Link do Google Maps, se houver. */
  mapsUrl: string | null
}

export const contact: Contact = {
  whatsapp: null, // TODO cliente
  phoneDisplay: null, // TODO cliente
  bookingUrl: null, // TODO cliente
  address: null, // TODO cliente
  hours: [], // TODO cliente
  email: null, // TODO cliente
  mapsUrl: null, // TODO cliente
}

/* -------------------------------------------------------------------------- */
/* 3. SERVIÇOS — PENDENTE                                                      */
/* -------------------------------------------------------------------------- */
/**
 * Deixe vazio até o cliente confirmar. A seção some por completo.
 * Formato esperado:
 *   { name: 'Coloração', description: '…', image: '/images/concept/xx.jpg' }
 * `description` e `image` são opcionais.
 */

export type Service = {
  name: string
  description?: string
  image?: string
}

export const services: Service[] = [
  // TODO cliente — confirmar a lista real de serviços antes de publicar.
]

/* -------------------------------------------------------------------------- */
/* 4. PROVA SOCIAL — PENDENTE                                                  */
/* -------------------------------------------------------------------------- */
/** Sem depoimentos reais, a seção não existe. Nada é inventado. */

export type Testimonial = { quote: string; author: string; context?: string }

export const testimonials: Testimonial[] = [
  // TODO cliente — depoimentos reais e autorizados.
]

/* -------------------------------------------------------------------------- */
/* 5. COPY EDITORIAL — PROVISÓRIO, REVISAR NA VOZ DO BORMANN                   */
/* -------------------------------------------------------------------------- */
/**
 * Escrito a partir do posicionamento REAL e verificável.
 * Nenhuma frase afirma tempo de carreira, volume de clientes, prêmios,
 * formação ou superlativos de mercado.
 */

export const draftCopy = {
  hero: {
    eyebrow: `${concept.city} — ${concept.stateFull}`,
    /** Deriva de "visagista": o ofício de desenhar imagem a partir da pessoa. */
    headline: ['Cabelo', 'como forma', 'de identidade.'],
    standfirst:
      'Hair stylist e visagista. Cada corte, cada cor e cada acabamento nascem de uma leitura — traço, proporção, presença — antes de nascerem de uma técnica.',
    cta: 'Agendar horário',
    scrollHint: 'Rolar',
  },

  manifesto: {
    index: '01',
    label: 'Assinatura',
    /** Frase-manifesto. Grande, com muito espaço negativo ao redor. */
    statement: 'Não existe referência que sirva em todo mundo.',
    body: [
      'Visagismo é o oposto de tendência aplicada em série. É observar a pessoa antes de observar a foto: o formato do rosto, a linha do olhar, o jeito de andar, o que ela faz da vida e o que ela quer que o espelho devolva.',
      'O trabalho começa nessa conversa. A técnica entra depois — a serviço de uma decisão que já foi tomada em conjunto.',
    ],
    /** Credencial real, apresentada sem adjetivo. */
    credit: `${person.credential.label} · ${person.credential.brand}`,
  },

  work: {
    index: '02',
    label: 'Trabalho',
    title: 'Selecionados',
    intro:
      'Uma seleção de trabalhos. Cor, corte e construção de imagem — publicados em @bormannjr.',
  },

  concept: {
    index: '03',
    label: 'O espaço',
    title: ['Bormann Jr', 'Concept'],
    body: [
      `O Concept é onde esse método vira rotina. Um espaço em ${concept.city}, ${concept.state}, dirigido por Bormann Jr. como ${person.title.toLowerCase()} — a mesma leitura, a mesma exigência de acabamento, aplicadas todos os dias.`,
      'Não é um salão que também faz visagismo. É um salão desenhado a partir dele.',
    ],
  },

  instagram: {
    index: '04',
    label: 'Instagram',
    title: 'Acompanhe o trabalho',
    body: `O trabalho é publicado primeiro no Instagram. ${social.personal.handle} para os cortes e as cores; ${social.concept.handle} para o dia a dia do espaço.`,
  },

  finalCta: {
    index: '05',
    label: 'Contato',
    headline: ['Vamos', 'desenhar', 'a sua.'],
    body: 'Antes de qualquer técnica, uma conversa. Chame pelo Instagram e conte o que você tem em mente.',
    primary: 'Agendar horário',
    secondary: 'Instagram',
  },

  footer: {
    note: 'Site desenvolvido para Bormann Jr.',
  },
} as const

/* -------------------------------------------------------------------------- */
/* 6. NAVEGAÇÃO                                                                */
/* -------------------------------------------------------------------------- */

export const nav = [
  { label: 'Assinatura', href: '#assinatura' },
  { label: 'Trabalho', href: '#trabalho' },
  { label: 'Concept', href: '#concept' },
  { label: 'Contato', href: '#contato' },
] as const

/* -------------------------------------------------------------------------- */
/* 7. SEO                                                                      */
/* -------------------------------------------------------------------------- */

export const seo = {
  /** TODO cliente — trocar pelo domínio real antes do deploy. */
  siteUrl: 'https://bormannjr.com.br',
  title: `${person.name} — ${person.role} & ${person.discipline}`,
  titleTemplate: `%s — ${person.name}`,
  description: `${person.name}, hair stylist e visagista em ${concept.city} — ${concept.stateFull}. ${person.credential.label} ${person.credential.brand} e ${person.title.toLowerCase()} do ${concept.name}.`,
  locale: 'pt_BR',
  lang: 'pt-BR',
} as const

/* -------------------------------------------------------------------------- */
/* 8. HELPERS DERIVADOS                                                        */
/* -------------------------------------------------------------------------- */

/** Link de WhatsApp — só existe se o número for confirmado. */
export const whatsappUrl = contact.whatsapp
  ? `https://wa.me/${contact.whatsapp}`
  : null

/**
 * Destino do CTA primário, em ordem de preferência:
 * plataforma de agendamento → WhatsApp → Instagram (fallback sempre real).
 */
export const bookingHref =
  contact.bookingUrl ?? whatsappUrl ?? social.concept.url

/** O CTA leva para fora do site? (define target/rel) */
export const bookingIsExternal = true

/** Rótulo honesto para o CTA, conforme o canal disponível. */
export const bookingLabel = contact.bookingUrl
  ? 'Agendar horário'
  : whatsappUrl
    ? 'Agendar pelo WhatsApp'
    : 'Agendar pelo Instagram'

export const hasServices = services.length > 0
export const hasTestimonials = testimonials.length > 0
export const hasAddress = contact.address !== null
export const hasHours = contact.hours.length > 0

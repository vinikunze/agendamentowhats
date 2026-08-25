/**
 * ============================================================================
 * FONTE ÚNICA DE CONTEÚDO — BORMANN JR.
 * ============================================================================
 *
 * Tudo que o site exibe vem daqui. Edite este arquivo e o site inteiro muda.
 *
 * REGRA DO PROJETO: nada é inventado.
 *
 *   confirmado  → verificado nas bios oficiais do Instagram (@bormannjr e
 *                 @bormannjrconcept), na ficha do Google Business e no
 *                 registro da empresa. Pode publicar.
 *
 *   `pending`   → ainda não fornecido. Enquanto for `null` ou `[]`, as seções
 *                 que dependem do dado NÃO SÃO RENDERIZADAS. O site continua
 *                 coerente, sem buracos e sem informação falsa.
 *
 *   `draftCopy` → textos editoriais provisórios, escritos a partir do
 *                 posicionamento real. Não afirmam fatos não verificados
 *                 (anos de carreira, número de clientes, prêmios). Devem ser
 *                 revisados na voz do Bormann.
 *
 * Veja o README para o que ainda falta.
 * ============================================================================
 */

/* -------------------------------------------------------------------------- */
/* 1. IDENTIDADE — CONFIRMADO                                                  */
/* -------------------------------------------------------------------------- */

export const person = {
  /** Confirmado — nome público usado nos canais. */
  name: 'Bormann Jr.',
  wordmark: 'BORMANN JR.',
  /** Confirmado — bio de @bormannjr: "Hair Stylist". */
  role: 'Hair Stylist',
  /** Confirmado — nome do perfil: "BORMANNJR • CABELEIREIRO". */
  roleBr: 'Cabeleireiro',
  /**
   * Descritor usado nos canais oficiais de vídeo e no Facebook
   * ("Bormann Jr Cabeleireiro Visagista").
   *
   * TODO cliente: a bio atual do Instagram não repete o termo. Confirmar se
   * "visagista" continua fazendo parte do posicionamento. Se não, troque por
   * `null` — a seção Assinatura já está escrita para funcionar sem a palavra,
   * apoiada no "atendimento personalizado" que o Concept anuncia.
   */
  discipline: 'Visagista' as string | null,
  /** Confirmado — bio: "EXPERT TEAM @wellaprobrasil". */
  credential: {
    label: 'Expert Team',
    brand: 'Wella Professionals Brasil',
    handle: 'wellaprobrasil',
    url: 'https://www.instagram.com/wellaprobrasil/',
  },
  /** Confirmado — bio: "Diretor Criativo - @bormannjrconcept". */
  title: 'Diretor Criativo',
} as const

export const concept = {
  /** Confirmado — nome do perfil: "BORMANNJR CONCEPT". */
  name: 'Bormann Jr Concept',
  wordmark: 'BORMANN JR CONCEPT',
  /** Confirmado — assinatura do logotipo. */
  tagline: 'Concept Hair Expert',
  /** Confirmado — Google Business e registro da empresa. */
  city: 'Sinop',
  state: 'MT',
  stateFull: 'Mato Grosso',
  country: 'BR',
  /** Confirmado — bio do Concept: "✨ Atendimento personalizado!". */
  promise: 'Atendimento personalizado',
} as const

export const social = {
  /** Confirmado — 46,2 mil seguidores em agosto de 2026. */
  personal: {
    handle: '@bormannjr',
    url: 'https://www.instagram.com/bormannjr/',
    label: 'Instagram pessoal',
  },
  /** Confirmado — 10,6 mil seguidores em agosto de 2026. */
  concept: {
    handle: '@bormannjrconcept',
    url: 'https://www.instagram.com/bormannjrconcept/',
    label: 'Instagram do Concept',
  },
} as const

/* -------------------------------------------------------------------------- */
/* 1b. ARQUIVOS DE MARCA — PENDENTE                                            */
/* -------------------------------------------------------------------------- */
/**
 * O logotipo do Concept tem um monograma "JB" entrelaçado numa moldura.
 * Redesenhá-lo de olho dá algo *parecido* e errado — e logotipo quase certo
 * passa pior impressão do que logotipo nenhum. Por isso o site hoje usa só a
 * assinatura tipográfica (o nome na tipografia do projeto), que é fiel.
 *
 * PARA ATIVAR O LOGOTIPO REAL
 *   1. salve o arquivo em `public/images/brand/` — SVG de preferência, ou PNG
 *      com fundo transparente;
 *   2. preencha abaixo com o caminho e as dimensões reais.
 * Ele volta a aparecer no header e no rodapé automaticamente.
 */

export const brand = {
  /** Ex.: { src: '/images/brand/monograma.svg', width: 88, height: 112 } */
  monogram: null as { src: string; width: number; height: number } | null,
  /** Lockup horizontal completo, se houver uma versão pronta. */
  logo: null as { src: string; width: number; height: number } | null,
}

/* -------------------------------------------------------------------------- */
/* 2. CONTATO — CONFIRMADO                                                     */
/* -------------------------------------------------------------------------- */
/**
 * O mesmo número aparece como link de agendamento nas DUAS bios do Instagram
 * (wa.me/5566999021873) e como telefone na ficha do Google Business
 * ((66) 99902-1873). Duas fontes independentes, mesmo número.
 */

export type Contact = {
  /** Somente dígitos, com DDI 55. */
  whatsapp: string | null
  phoneDisplay: string | null
  /** Plataforma de agendamento própria, se um dia existir. */
  bookingUrl: string | null
  address: {
    street: string
    district: string
    city: string
    state: string
    postalCode: string
  } | null
  hours: { days: string; hours: string }[]
  email: string | null
  mapsUrl: string | null
}

export const contact: Contact = {
  /** Confirmado — link das bios de @bormannjr e @bormannjrconcept. */
  whatsapp: '5566999021873',
  /** Confirmado — Google Business. */
  phoneDisplay: '(66) 99902-1873',
  /** O agendamento é pelo WhatsApp; não há plataforma própria. */
  bookingUrl: null,
  /** Confirmado — Google Business. */
  address: {
    street: 'R. Tancredo Neves, 330',
    district: 'Jardim Itália',
    city: 'Sinop',
    state: 'MT',
    postalCode: '78555-324',
  },
  /**
   * Confirmado — bio do Concept: "✨ Terça à sábado - 09h às 18h".
   *
   * ⚠️ A ficha do Google mostra fechamento às 19h. Vale corrigir o Google
   * para bater com a bio, ou ajustar aqui se o horário real for outro.
   */
  hours: [{ days: 'Terça a sábado', hours: '09h às 18h' }],
  email: null, // TODO cliente
  mapsUrl: null, // TODO cliente — link curto do Google Maps
}

/* -------------------------------------------------------------------------- */
/* 3. SERVIÇOS — PENDENTE                                                      */
/* -------------------------------------------------------------------------- */
/**
 * As bios não listam serviços, e a atividade registrada da empresa
 * ("cabeleireiros, manicure e pedicure") é classificação fiscal, não cardápio.
 * Fica vazio: a seção some por completo até o cliente confirmar a lista real.
 *
 * Formato: { name: 'Coloração', description: '…', image: '/images/…' }
 */

export type Service = {
  name: string
  description?: string
  image?: string
}

export const services: Service[] = [
  // TODO cliente — confirmar a lista real de serviços.
]

/* -------------------------------------------------------------------------- */
/* 4. CURSOS — CONFIRMADO QUE EXISTEM                                          */
/* -------------------------------------------------------------------------- */
/**
 * Confirmado — bio de @bormannjr: "Cursos VIPs".
 * Formato, datas, conteúdo e preço não são divulgados publicamente, então o
 * site anuncia a existência e manda para o WhatsApp. Nada além disso.
 */

export const courses = {
  enabled: true,
  name: 'Cursos VIPs',
  // TODO cliente: se quiser detalhar formato, carga horária ou próximas
  // turmas, escreva aqui e a seção passa a exibir.
  detail: null as string | null,
}

/* -------------------------------------------------------------------------- */
/* 5. PROVA SOCIAL — PENDENTE                                                  */
/* -------------------------------------------------------------------------- */
/** Sem depoimentos reais, a seção não existe. Nada é inventado. */

export type Testimonial = { quote: string; author: string; context?: string }

export const testimonials: Testimonial[] = [
  // TODO cliente — depoimentos reais e autorizados.
]

/* -------------------------------------------------------------------------- */
/* 6. COPY EDITORIAL — PROVISÓRIO, REVISAR NA VOZ DO BORMANN                   */
/* -------------------------------------------------------------------------- */

export const draftCopy = {
  hero: {
    eyebrow: `${concept.city} — ${concept.stateFull}`,
    headline: ['Cabelo', 'como forma', 'de identidade.'],
    standfirst:
      'Hair stylist e Expert Team Wella Professionals. Cada corte, cada cor e cada acabamento nascem de uma leitura — traço, proporção, presença — antes de nascerem de uma técnica.',
    cta: 'Agendar horário',
    scrollHint: 'Rolar',
  },

  manifesto: {
    label: 'Assinatura',
    statement: 'Não existe referência que sirva em todo mundo.',
    body: [
      'Atendimento personalizado não é um serviço à parte: é o ponto de partida. Antes da foto de referência vem a pessoa — o formato do rosto, a linha do olhar, o jeito de andar, o que ela faz da vida e o que ela quer que o espelho devolva.',
      'O trabalho começa nessa conversa. A técnica entra depois — a serviço de uma decisão que já foi tomada em conjunto.',
    ],
    credit: `${person.credential.label} · ${person.credential.brand}`,
  },

  work: {
    label: 'Trabalho',
    title: 'Selecionados',
    intro:
      'Uma seleção de trabalhos. Cor, corte e construção de imagem — publicados em @bormannjr.',
  },

  concept: {
    label: 'O espaço',
    title: ['Bormann Jr', 'Concept'],
    body: [
      `O Concept é onde esse método vira rotina. Um espaço em ${concept.city}, ${concept.state}, dirigido por Bormann Jr. como ${person.title.toLowerCase()} — a mesma leitura, a mesma exigência de acabamento, aplicadas todos os dias.`,
      'Não é um salão que também atende sob medida. É um salão desenhado a partir disso.',
    ],
  },

  courses: {
    label: 'Formação',
    title: 'Cursos VIPs',
    body: 'Formação em turmas reduzidas, conduzida por Bormann Jr. Turmas, datas e conteúdo pelo WhatsApp.',
    cta: 'Falar sobre os cursos',
  },

  instagram: {
    label: 'Instagram',
    title: 'Acompanhe o trabalho',
    body: `O trabalho é publicado primeiro no Instagram. ${social.personal.handle} para os cortes e as cores; ${social.concept.handle} para o dia a dia do espaço.`,
  },

  finalCta: {
    label: 'Contato',
    headline: ['Vamos', 'desenhar', 'a sua.'],
    body: 'Antes de qualquer técnica, uma conversa. Chame no WhatsApp e conte o que você tem em mente.',
    primary: 'Agendar horário',
    secondary: 'Instagram',
  },

  footer: {
    note: 'Site desenvolvido para Bormann Jr.',
  },
} as const

/* -------------------------------------------------------------------------- */
/* 7. NAVEGAÇÃO                                                                */
/* -------------------------------------------------------------------------- */

export const nav = [
  { label: 'Assinatura', href: '#assinatura' },
  { label: 'Trabalho', href: '#trabalho' },
  { label: 'Concept', href: '#concept' },
  { label: 'Cursos', href: '#cursos' },
  { label: 'Contato', href: '#contato' },
] as const

/* -------------------------------------------------------------------------- */
/* 8. SEO                                                                      */
/* -------------------------------------------------------------------------- */

export const seo = {
  /**
   * De onde o site é servido. Define canonical, sitemap, robots e as URLs
   * absolutas do OpenGraph.
   *
   * Vem do ambiente para que a mesma base sirva a publicação de teste no
   * GitHub Pages e o domínio definitivo, sem editar código.
   *
   * TODO cliente — quando o domínio próprio existir, é só apontar
   * `NEXT_PUBLIC_SITE_URL` para ele (ou trocar o padrão abaixo).
   */
  siteUrl:
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ??
    'https://bormannjr.com.br',
  title: `${person.name} — ${person.role} em ${concept.city}`,
  titleTemplate: `%s — ${person.name}`,
  description: `${person.name}, hair stylist e Expert Team Wella Professionals Brasil. Diretor criativo do ${concept.name} — ${concept.tagline} em ${concept.city}, ${concept.stateFull}. Atendimento personalizado, terça a sábado.`,
  locale: 'pt_BR',
  lang: 'pt-BR',
} as const

/* -------------------------------------------------------------------------- */
/* 9. HELPERS DERIVADOS                                                        */
/* -------------------------------------------------------------------------- */

/** Link de WhatsApp — só existe se o número estiver preenchido. */
export const whatsappUrl = contact.whatsapp
  ? `https://wa.me/${contact.whatsapp}`
  : null

/** WhatsApp com mensagem pronta, para o CTA de cursos. */
export const whatsappCoursesUrl = contact.whatsapp
  ? `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(
      'Olá! Gostaria de saber mais sobre os Cursos VIPs.',
    )}`
  : null

/**
 * Destino do CTA primário, em ordem de preferência:
 * plataforma de agendamento → WhatsApp → Instagram (fallback sempre real).
 */
export const bookingHref =
  contact.bookingUrl ?? whatsappUrl ?? social.concept.url

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
export const hasCourses = courses.enabled && whatsappCoursesUrl !== null

/**
 * Numeração editorial das seções (01, 02, 03…), derivada do que está de fato
 * ativo. Assim, no dia em que os serviços ou os depoimentos forem preenchidos,
 * a sequência se reorganiza sozinha — sem número pulado e sem número repetido.
 */
export const sectionIndex: Record<string, string> = Object.fromEntries(
  [
    'assinatura',
    'trabalho',
    'concept',
    ...(hasServices ? ['servicos'] : []),
    ...(hasCourses ? ['cursos'] : []),
    ...(hasTestimonials ? ['depoimentos'] : []),
    'instagram',
    'contato',
  ].map((id, i) => [id, String(i + 1).padStart(2, '0')]),
)

import {
  concept,
  contact,
  courses,
  hasAddress,
  hasCourses,
  hasHours,
  person,
  seo,
  social,
  whatsappUrl,
} from '@/content/site'

/**
 * Dados estruturados montados EXCLUSIVAMENTE a partir de informação
 * confirmada. Cada campo opcional só entra no JSON se o dado existir —
 * nada de endereço, telefone, horário, preço ou avaliação inventados.
 *
 * Com o endereço e o telefone confirmados, o negócio é publicado como
 * `HairSalon`, que é o tipo certo para o Google entender a ficha local.
 */

/** Converte "Terça a sábado" no formato de dias que o Schema.org espera. */
const DIAS: Record<string, string[]> = {
  'terça a sábado': ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  'segunda a sexta': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  'segunda a sábado': [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ],
}

/** "09h às 18h" → { opens: '09:00', closes: '18:00' } */
function parseHoras(texto: string) {
  const encontrados = texto.match(/(\d{1,2})\s*h(?:\s*(\d{2}))?/gi)
  if (!encontrados || encontrados.length < 2) return null

  const paraHora = (t: string) => {
    const [, h, m] = t.match(/(\d{1,2})\s*h(?:\s*(\d{2}))?/i) ?? []
    return `${String(h).padStart(2, '0')}:${m ?? '00'}`
  }

  return { opens: paraHora(encontrados[0]), closes: paraHora(encontrados[1]) }
}

function horarios() {
  if (!hasHours) return undefined

  const specs = contact.hours
    .map((h) => {
      const dias = DIAS[h.days.trim().toLowerCase()]
      const horas = parseHoras(h.hours)
      if (!dias || !horas) return null

      return {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: dias,
        opens: horas.opens,
        closes: horas.closes,
      }
    })
    .filter(Boolean)

  return specs.length > 0 ? specs : undefined
}

export function buildSchema() {
  const address = hasAddress && contact.address
    ? {
        '@type': 'PostalAddress',
        streetAddress: contact.address.street,
        addressLocality: contact.address.city,
        addressRegion: contact.address.state,
        postalCode: contact.address.postalCode,
        addressCountry: concept.country,
      }
    : {
        // Localidade confirmada pelo registro da empresa, sem logradouro.
        '@type': 'PostalAddress',
        addressLocality: concept.city,
        addressRegion: concept.state,
        addressCountry: concept.country,
      }

  const business: Record<string, unknown> = {
    '@type': 'HairSalon',
    '@id': `${seo.siteUrl}/#concept`,
    name: concept.name,
    alternateName: `${concept.name} — ${concept.tagline}`,
    description: `${concept.promise} em ${concept.city}, ${concept.stateFull}. Direção criativa de ${person.name}.`,
    address,
    areaServed: { '@type': 'City', name: concept.city },
    sameAs: [social.concept.url],
    url: seo.siteUrl,
    image: `${seo.siteUrl}/og.jpg`,
    founder: { '@id': `${seo.siteUrl}/#bormann` },
    employee: { '@id': `${seo.siteUrl}/#bormann` },
  }

  if (contact.phoneDisplay) business.telephone = contact.phoneDisplay
  if (contact.email) business.email = contact.email
  if (contact.mapsUrl) business.hasMap = contact.mapsUrl

  const abre = horarios()
  if (abre) business.openingHoursSpecification = abre

  // O agendamento acontece pelo WhatsApp — é o canal real, então é o que
  // o Schema declara.
  if (whatsappUrl) {
    business.potentialAction = {
      '@type': 'ReserveAction',
      name: 'Agendar horário',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: whatsappUrl,
        inLanguage: seo.lang,
        actionPlatform: [
          'http://schema.org/DesktopWebPlatform',
          'http://schema.org/MobileWebPlatform',
        ],
      },
    }
  }

  const jobTitles = [person.role, person.roleBr, person.discipline].filter(
    (t): t is string => Boolean(t),
  )

  const individual: Record<string, unknown> = {
    '@type': 'Person',
    '@id': `${seo.siteUrl}/#bormann`,
    name: person.name,
    jobTitle: jobTitles,
    // Credencial verificada na bio pública do Instagram.
    affiliation: {
      '@type': 'Organization',
      name: person.credential.brand,
      url: person.credential.url,
    },
    worksFor: { '@id': `${seo.siteUrl}/#concept` },
    address,
    sameAs: [social.personal.url],
    url: seo.siteUrl,
  }

  const graph: Record<string, unknown>[] = [individual, business]

  // Os cursos existem e são anunciados publicamente; formato, datas e preço
  // não são. O Schema declara só a oferta e o canal de contato.
  if (hasCourses) {
    graph.push({
      '@type': 'Course',
      '@id': `${seo.siteUrl}/#cursos`,
      name: courses.name,
      description:
        courses.detail ??
        `Formação em cabelo conduzida por ${person.name}, ${person.credential.label} ${person.credential.brand}.`,
      provider: { '@id': `${seo.siteUrl}/#concept` },
      inLanguage: seo.lang,
      url: `${seo.siteUrl}/#cursos`,
    })
  }

  return { '@context': 'https://schema.org', '@graph': graph }
}

import {
  concept,
  contact,
  hasAddress,
  hasHours,
  person,
  seo,
  social,
} from '@/content/site'

/**
 * Dados estruturados montados EXCLUSIVAMENTE a partir de informação
 * confirmada. Cada campo opcional só entra no JSON se o dado existir —
 * nada de endereço, telefone, horário, preço ou avaliação inventados.
 */
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
    '@type': 'HealthAndBeautyBusiness',
    '@id': `${seo.siteUrl}/#concept`,
    name: concept.name,
    address,
    areaServed: { '@type': 'City', name: concept.city },
    sameAs: [social.concept.url],
    url: seo.siteUrl,
  }

  if (contact.phoneDisplay) business.telephone = contact.phoneDisplay
  if (contact.email) business.email = contact.email
  if (contact.bookingUrl) business.hasMap = undefined
  if (contact.mapsUrl) business.hasMap = contact.mapsUrl

  if (hasHours) {
    business.openingHours = contact.hours.map((h) => `${h.days} ${h.hours}`)
  }

  const individual = {
    '@type': 'Person',
    '@id': `${seo.siteUrl}/#bormann`,
    name: person.name,
    jobTitle: [person.role, person.discipline],
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

  return {
    '@context': 'https://schema.org',
    '@graph': [individual, business],
  }
}

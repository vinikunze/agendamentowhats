import type { MetadataRoute } from 'next'
import { seo } from '@/content/site'

/**
 * O export estático (GitHub Pages) exige que rotas de metadados sejam
 * declaradas estáticas. Inofensivo no build normal — este arquivo já não
 * dependia de requisição.
 */
export const dynamic = 'force-static'


/**
 * O site é uma página só. O sitemap reflete isso — sem inventar rotas
 * que não existem.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: seo.siteUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
  ]
}

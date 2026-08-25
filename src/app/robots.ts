import type { MetadataRoute } from 'next'
import { seo } from '@/content/site'

/**
 * O export estático (GitHub Pages) exige que rotas de metadados sejam
 * declaradas estáticas. Inofensivo no build normal — este arquivo já não
 * dependia de requisição.
 */
export const dynamic = 'force-static'


export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${seo.siteUrl}/sitemap.xml`,
    host: seo.siteUrl,
  }
}

// /llms.txt — přehled webu pro AI agenty (https://llmstxt.org).
// Generuje se při buildu ze Sanity, takže projekty a články jsou vždy aktuální.
import type { APIRoute } from 'astro'
import { client } from '../lib/sanity'
import { ALL_CASE_STUDIES_QUERY, ALL_BLOG_POSTS_QUERY } from '../lib/queries'

export const prerender = true

const SITE = 'https://slant.cz'
const clean = (s?: string) => (s ?? '').replace(/\s+/g, ' ').trim()
const SVC_EN: Record<string, string> = {
  'Grafický design': 'Graphic design', 'Obalový design': 'Packaging design',
  'Animace': 'Animation', 'Webdesign': 'Web design',
}

export const GET: APIRoute = async () => {
  const [projects, posts] = await Promise.all([
    client.fetch(ALL_CASE_STUDIES_QUERY),
    client.fetch(ALL_BLOG_POSTS_QUERY),
  ])

  const work = (projects ?? [])
    .filter((p: any) => p.slug)
    .map((p: any) => {
      const title = p.titleEn || p.title
      const desc = clean(p.taglineEn || p.tagline)
      const svc = (p.services ?? []).map((x: string) => SVC_EN[x] ?? x).join(', ')
      return `- [${title}](${SITE}/en/work/${p.slug})${desc ? `: ${desc}` : ''}${svc ? ` (${svc})` : ''}`
    })

  const blog = (posts ?? [])
    .filter((p: any) => p.slug)
    .map((p: any) => {
      const desc = clean(p.descriptionEn || p.description)
      return `- [${p.titleEn || p.title}](${SITE}/en/blog/${p.slug})${desc ? `: ${desc}` : ''}`
    })

  const body = `# Slant

> Independent branding & UX design studio based in Brno, Czech Republic. We create visual identities, naming, UX/UI and design systems for ambitious brands, in Czech and English.

Slant s.r.o., founded 2019. Zborovská 940/2a, 616 00 Brno, Czech Republic. Company ID (IČO): 092 50 239. We work with clients across Central Europe and remotely abroad.

Services: branding & visual identity, naming, graphic design, UX/UI design, design systems, interactive prototypes ready for developer handover, packaging and print. We design websites; development is done only by exception.

## Main pages

- [Homepage](${SITE}/en/): studio overview, services, FAQ, contact
- [Work](${SITE}/en/work): all case studies
- [Blog](${SITE}/en/blog): articles and insights
- [Homepage in Czech](${SITE}/): Czech version of the site
- [Terms and conditions](${SITE}/podminky/vseobecne-obchodni-podminky): general terms (Czech)

## Work

${work.join('\n')}

## Blog

${blog.join('\n')}

## Contact

- [Email hello@slant.cz](mailto:hello@slant.cz)
- [Instagram](https://instagram.com/slant.cz)
- [Behance](https://behance.net/weareslant)

## Optional

- [XML sitemap](${SITE}/sitemap-index.xml)
`

  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}

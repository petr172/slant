import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'

const env = readFileSync(new URL('../.env', import.meta.url), 'utf8')
const envVars = Object.fromEntries(
  env.split('\n').filter(l => l.trim() && !l.startsWith('#'))
    .map(l => l.split('=').map(s => s.trim()))
)

const client = createClient({
  projectId: envVars.PUBLIC_SANITY_PROJECT_ID ?? 'wgpoci6t',
  dataset: envVars.PUBLIC_SANITY_DATASET ?? 'production',
  apiVersion: '2024-01-01',
  token: envVars.SANITY_WRITE_TOKEN,
  useCdn: false,
})

const posts = [
  {
    _id: 'blog-post-1',
    _type: 'blogPost',
    title: 'Proč dobrý brand není jen logo',
    titleEn: 'Why a good brand is more than just a logo',
    slug: { _type: 'slug', current: 'proc-dobry-brand-neni-jen-logo' },
    description: 'Brand je celkový dojem, který zanecháváte v mysli svých zákazníků. Jak ho budovat systematicky a proč vizuální identita je jen začátek.',
    descriptionEn: 'A brand is the total impression you leave in the minds of your customers. How to build it systematically and why visual identity is just the beginning.',
    category: 'Branding',
    publishedAt: '2025-04-10T09:00:00Z',
    featured: true,
  },
  {
    _id: 'blog-post-2',
    _type: 'blogPost',
    title: 'UX audit: jak odhalit slabiny webu za odpoledne',
    titleEn: 'UX audit: how to find website weak spots in an afternoon',
    slug: { _type: 'slug', current: 'ux-audit-jak-odhalit-slabiny-webu' },
    description: 'Praktický průvodce heuristickým auditem, který zvládnete sami. Pět oblastí, na které se zaměřit jako první.',
    descriptionEn: 'A practical guide to heuristic audits you can do yourself. Five areas to focus on first.',
    category: 'UX Design',
    publishedAt: '2025-03-22T09:00:00Z',
    featured: true,
  },
  {
    _id: 'blog-post-3',
    _type: 'blogPost',
    title: 'Jak jsme redesignovali identitu Rostutu za 6 týdnů',
    titleEn: 'How we redesigned Rostutu\'s identity in 6 weeks',
    slug: { _type: 'slug', current: 'redesign-identity-rostutu' },
    description: 'Behind the scenes pohled na náš pracovní proces — od discovery workshopu přes moodboard až po finální brand manuál.',
    descriptionEn: 'A behind the scenes look at our process — from discovery workshop through moodboard to the final brand manual.',
    category: 'Behind the scenes',
    publishedAt: '2025-02-14T09:00:00Z',
    featured: true,
  },
  {
    _id: 'blog-post-4',
    _type: 'blogPost',
    title: 'Typografie jako nástroj emocí',
    titleEn: 'Typography as a tool for emotion',
    slug: { _type: 'slug', current: 'typografie-jako-nastroj-emoci' },
    description: 'Výběr písma není estetická preference — je to strategické rozhodnutí. Co říká váš font o vaší značce dříve, než si zákazník přečte jediné slovo.',
    descriptionEn: 'Choosing a typeface is not an aesthetic preference — it\'s a strategic decision. What your font says about your brand before a customer reads a single word.',
    category: 'Branding',
    publishedAt: '2025-01-30T09:00:00Z',
    featured: false,
  },
]

console.log('Seeding blog posts...')
for (const post of posts) {
  await client.createOrReplace(post)
  console.log(' ✓', post.title)
}
console.log('Done.')

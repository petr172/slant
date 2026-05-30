/**
 * Sanity seed script — vytvoří placeholder case studies
 * Použití:
 *   1. Přidej do .env: SANITY_WRITE_TOKEN=skXXX...
 *   2. node scripts/seed.mjs
 */

import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))

// Načti .env ručně (bez dotenv závislosti)
const envPath = resolve(__dir, '../.env')
const env = {}
try {
  readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=')
    if (k?.trim()) env[k.trim()] = v.join('=').trim()
  })
} catch {}

const token = env.SANITY_WRITE_TOKEN
if (!token) {
  console.error('❌  Chybí SANITY_WRITE_TOKEN v .env')
  console.error('   Získej ho na: https://sanity.io/manage → API → Tokens → Add API token (Editor)')
  process.exit(1)
}

const client = createClient({
  projectId: env.PUBLIC_SANITY_PROJECT_ID ?? 'wgpoci6t',
  dataset:   env.PUBLIC_SANITY_DATASET   ?? 'production',
  apiVersion: '2024-01-01',
  token,
  useCdn: false,
})

const caseStudies = [
  {
    _type: 'caseStudy',
    _id:   'caseStudy-jatvar',
    title: 'Jatvar',
    titleEn: 'Jatvar',
    slug:  { _type: 'slug', current: 'jatvar' },
    tagline: 'Identita pro moderní řeznictví s důrazem na řemeslo',
    taglineEn: 'Brand identity for a modern butcher shop with a focus on craft',
    year: 2025,
    services: ['Branding', 'Visual Identity', 'Packaging'],
    industry: 'Food & Beverage',
    featured: true,
    order: 10,
  },
  {
    _type: 'caseStudy',
    _id:   'caseStudy-autojeraby-malina',
    title: 'Autojeřáby Malina',
    titleEn: 'Malina Cranes',
    slug:  { _type: 'slug', current: 'autojeraby-malina' },
    tagline: 'Rebrand rodinné firmy s 30letou historií v těžkém průmyslu',
    taglineEn: 'Rebrand of a family business with 30 years in heavy industry',
    year: 2024,
    services: ['Branding', 'Web Design', 'Vehicle Wrap'],
    industry: 'Construction',
    featured: true,
    order: 20,
  },
  {
    _type: 'caseStudy',
    _id:   'caseStudy-data-jmk',
    title: 'Data JMK',
    titleEn: 'Data JMK',
    slug:  { _type: 'slug', current: 'data-jmk' },
    tagline: 'Datový portál Jihomoravského kraje — UX a vizuální systém',
    taglineEn: 'Data portal for South Moravian Region — UX and visual system',
    year: 2024,
    services: ['UX Design', 'UI Design', 'Design System'],
    industry: 'Public Sector',
    featured: true,
    order: 30,
  },
]

console.log(`🌱  Seeding ${caseStudies.length} case studies do Sanity...`)

for (const doc of caseStudies) {
  try {
    const result = await client.createOrReplace(doc)
    console.log(`✅  ${result.title} (${result._id})`)
  } catch (err) {
    console.error(`❌  ${doc.title}:`, err.message)
  }
}

console.log('\n✨  Hotovo! Refreshni https://localhost:4321')

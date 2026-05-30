import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'

const env = readFileSync(new URL('../.env', import.meta.url), 'utf8')
const envVars = Object.fromEntries(
  env.split('\n')
    .filter(l => l.trim() && !l.startsWith('#'))
    .map(l => l.split('=').map(s => s.trim()))
)

const client = createClient({
  projectId: envVars.PUBLIC_SANITY_PROJECT_ID ?? 'wgpoci6t',
  dataset: envVars.PUBLIC_SANITY_DATASET ?? 'production',
  apiVersion: '2024-01-01',
  token: envVars.SANITY_WRITE_TOKEN,
  useCdn: false,
})

const logos = [
  { name: 'AJM',                   logoUrl: '/AJM.svg' },
  { name: 'Artin',                 logoUrl: '/Artin.svg' },
  { name: 'Brno',                  logoUrl: '/Brno.svg' },
  { name: 'CBRE',                  logoUrl: '/CBRE.svg' },
  { name: 'Halmax',                logoUrl: '/Halmax.svg' },
  { name: 'Konopný Táta',          logoUrl: '/Konopny-Tata.svg' },
  { name: 'Moravskoslezský kraj',  logoUrl: '/Moravskoslezsky-kraj.svg' },
  { name: 'Rostutu',               logoUrl: '/Rostutu.svg' },
  { name: 'Sewio',                 logoUrl: '/Sewio.svg' },
]

const patch = client.patch('siteSettings').set({
  clientLogos: logos.map((l, i) => ({
    _type: 'clientLogo',
    _key: `logo-${i}`,
    ...l,
  }))
})

console.log('Seeding client logos...')
const result = await patch.commit()
console.log('Done:', result._id)

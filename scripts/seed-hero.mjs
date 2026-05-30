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

const doc = {
  _id: 'siteSettings',
  _type: 'siteSettings',
  heroMedia: [
    { _type: 'heroExternalImage', _key: 'slide-ajm',      url: '/slider-ajm.png',      alt: 'AJM' },
    { _type: 'heroExternalImage', _key: 'slide-parkshop', url: '/slider-parkshop.png', alt: 'Park & Shop' },
    { _type: 'heroExternalImage', _key: 'slide-rostutu',  url: '/slider-rostutu.png',  alt: 'Rostutu' },
    { _type: 'heroExternalImage', _key: 'slide-vokal',    url: '/slider-vokal.png',    alt: 'Vokal' },
  ],
}

console.log('Seeding hero slides...')
const result = await client.createOrReplace(doc)
console.log('Done:', result._id)

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

// Obrázky leží v public/ (zdroj: Assets/Slider/, zmenšené na 1920×1080 JPG)
const heroMedia = [
  { _type: 'heroExternalImage', _key: 'slide-parkshop', url: '/slider-parkshop.jpg', alt: 'Park & Shop' },
  { _type: 'heroExternalImage', _key: 'slide-rostutu',  url: '/slider-rostutu.jpg',  alt: 'Rostutu' },
  { _type: 'heroExternalImage', _key: 'slide-jatvar',   url: '/slider-jatvar.jpg',   alt: 'Jatvar' },
  { _type: 'heroExternalImage', _key: 'slide-halmax',   url: '/slider-halmax.jpg',   alt: 'Halmax' },
]

// Jen patch heroMedia — createOrReplace by smazal ostatní Site Settings (loga, chip preview…)
console.log('Seeding hero slides...')
const result = await client.patch('siteSettings').set({ heroMedia }).commit()
console.log('Done:', result._id)

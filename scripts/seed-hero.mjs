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
    {
      _type: 'heroVideo',
      _key: 'slide-video-1',
      url: 'https://videos.pexels.com/video-files/3571264/3571264-uhd_2560_1440_30fps.mp4',
    },
    {
      _type: 'heroExternalImage',
      _key: 'slide-img-1',
      url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1920&q=85&fit=crop',
      alt: 'Abstract design',
    },
    {
      _type: 'heroExternalImage',
      _key: 'slide-img-2',
      url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=85&fit=crop',
      alt: 'Creative workspace',
    },
    {
      _type: 'heroExternalImage',
      _key: 'slide-img-3',
      url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1920&q=85&fit=crop',
      alt: 'Branding design',
    },
    {
      _type: 'heroExternalImage',
      _key: 'slide-img-4',
      url: 'https://images.unsplash.com/photo-1634942537034-2531766767d1?w=1920&q=85&fit=crop',
      alt: 'Typography detail',
    },
  ],
}

console.log('Seeding siteSettings...')
const result = await client.createOrReplace(doc)
console.log('Done:', result._id)

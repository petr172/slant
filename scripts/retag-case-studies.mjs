import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'

const env = readFileSync(new URL('../.env', import.meta.url), 'utf8')
const envVars = Object.fromEntries(
  env.split('\n').filter(l => l.trim() && !l.startsWith('#'))
    .map(l => l.split('=').map(s => s.trim()))
)

const client = createClient({
  projectId: envVars.PUBLIC_SANITY_PROJECT_ID ?? 'wgpoci6t',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: envVars.SANITY_WRITE_TOKEN,
  useCdn: false,
})

// Mapping starých tagů → nové
const MAP = {
  'Brand Identity':  'Branding',
  'Logo Design':     'Branding',
  'Visual System':   'Grafický design',
  'Visual Identity': 'Grafický design',
  'Packaging':       'Obalový design',
  'Packaging Design':'Obalový design',
  'Web Design':      'Webdesign',
  'UX/UI':           'Webdesign',
  'UX Design':       'Webdesign',
  'UI Design':       'Webdesign',
  'Design System':   'Grafický design',
  'Motion Design':   'Animace',
  'Trademark':       'Branding',
  'Consultation':    'Branding',
  'Vehicle Wrap':    'Grafický design',
  // already correct — pass through
  'Branding':        'Branding',
  'Webdesign':       'Webdesign',
  'Obalový design':  'Obalový design',
  'Grafický design': 'Grafický design',
  'Animace':         'Animace',
  'Naming':          'Naming',
}

const VALID = new Set(['Branding', 'Webdesign', 'Obalový design', 'Grafický design', 'Animace', 'Naming'])

const all = await client.fetch('*[_type == "caseStudy"]{ _id, title, services }')

console.log(`Found ${all.length} case studies\n`)

for (const cs of all) {
  const remapped = [...new Set((cs.services ?? []).map(s => MAP[s]).filter(Boolean))]
  const unknown  = (cs.services ?? []).filter(s => !MAP[s])

  if (unknown.length) console.warn(`  ⚠ Unknown tags in "${cs.title}":`, unknown)

  console.log(`"${cs.title}": ${JSON.stringify(cs.services)} → ${JSON.stringify(remapped)}`)
  await client.patch(cs._id).set({ services: remapped }).commit()
  console.log('  ✓ updated')
}

console.log('\nDone.')

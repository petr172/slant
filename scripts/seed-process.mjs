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

const steps = [
  {
    _key: 'step-1',
    _type: 'processStep',
    title: 'Discovery',
    titleEn: 'Discovery',
    description: 'Začínáme workshopem, kde se dozvídáme vše o vaší značce, konkurenci a cílové skupině. Čím lépe vás pochopíme, tím přesnější bude výsledek.',
    descriptionEn: 'We start with a workshop where we learn everything about your brand, competition and target audience. The better we understand you, the more precise the outcome.',
  },
  {
    _key: 'step-2',
    _type: 'processStep',
    title: 'Strategie',
    titleEn: 'Strategy',
    description: 'Z poznatků z discovery vytváříme strategický základ — positioning, tone of voice a vizuální direction, který je konzistentní a rozlišitelný.',
    descriptionEn: 'From discovery insights we build the strategic foundation — positioning, tone of voice and visual direction that is consistent and distinctive.',
  },
  {
    _key: 'step-3',
    _type: 'processStep',
    title: 'Design',
    titleEn: 'Design',
    description: 'Navrhujeme vizuální systém iterativně — od hrubých konceptů po finální podobu. Každé rozhodnutí je odůvodněné, nic není jen estetika.',
    descriptionEn: 'We design the visual system iteratively — from rough concepts to the final form. Every decision is justified, nothing is purely aesthetic.',
  },
  {
    _key: 'step-4',
    _type: 'processStep',
    title: 'Předání',
    titleEn: 'Delivery',
    description: 'Výsledky předáváme kompletně — brand manuál, zdrojové soubory, a pokud je potřeba, asistujeme s implementací nebo předáním developerům.',
    descriptionEn: 'We deliver everything completely — brand guidelines, source files, and if needed we assist with implementation or developer handoff.',
  },
]

console.log('Seeding process steps into siteSettings...')
await client
  .patch('siteSettings')
  .setIfMissing({ processSteps: [] })
  .set({ processSteps: steps })
  .commit()
console.log('Done.')

/**
 * Copy audit EN (11/2026) — anglické texty case studies.
 * Zapisuje do DRAFTŮ (drafts.<id>) → na webu nic, dokud je ve Studiu nepublikuješ
 * (navazuje na scripts/copy-audit-drafts.mjs, CS texty v draftech zůstávají).
 * Navíc oprava anglického kroku procesu v Site Settings (publikovaně).
 *
 * Použití: node scripts/copy-audit-en.mjs
 * Vyžaduje SANITY_WRITE_TOKEN v .env
 */

import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))
const env = {}
try {
  readFileSync(resolve(__dir, '../.env'), 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=')
    if (k?.trim()) env[k.trim()] = v.join('=').trim()
  })
} catch {}

const client = createClient({
  projectId: env.PUBLIC_SANITY_PROJECT_ID ?? 'wgpoci6t',
  dataset:   env.PUBLIC_SANITY_DATASET   ?? 'production',
  apiVersion: '2024-01-01',
  token: env.SANITY_WRITE_TOKEN,
  useCdn: false,
})

const patches = {
  'd294565d-0d7b-4fc4-99f9-8fcf4977bc8a': {
    titleEn: 'Halmax',
    taglineEn: 'A complete brand for a Czech supplier of modular fabric halls',
    briefEn: 'Halmax supplies modular fabric halls for farmers and businesses. It needed a name and a brand that would come across as clear, reliable and professional among technical suppliers.',
    vysledekEn: 'We created the Halmax name and a complete visual identity — logo, colour system and graphics for print and hall signage. The brand is simple, legible from a distance and works as well in the field as it does in the catalogue.',
    seoDescriptionEn: 'Naming and branding for Halmax, a Czech supplier of modular fabric halls. Name, logo, colour system and graphics.',
  },
  'caseStudy-jatvar': {
    taglineEn: 'Identity for a family stonemason with a tradition dating back to 1965',
    briefEn: 'Jatvar is a family stonemason with a tradition dating back to 1965. What it lacked was a brand that carried that precision outward — from the logo and sample books to vehicle livery and the website.',
    seoDescriptionEn: 'Branding for Jatvar, a family stonemason since 1965. Monogram, print, sample book, vehicle livery and website.',
  },
  'caseStudy-autojeraby-malina': {
    titleEn: 'Autojeřáby Malina',   // vlastní jméno firmy se nepřekládá
    taglineEn: 'Rebrand of a family crane company with 30 years of history',
    briefEn: 'Autojeřáby Malina is a family business that has provided crane services for more than 30 years. Its old visual style no longer matched the scale, equipment and professionalism the company offers today.',
    vysledekEn: 'We delivered a rebrand from the logo to the company website. The new identity is robust and bold, legible on machinery and in digital alike, and the website presents the company’s services clearly.',
    seoDescriptionEn: 'Rebrand of Autojeřáby Malina, a family crane company with 30 years of history — new logo, visual identity, graphics and website.',
  },
  '266ebc30-501a-4a44-aba6-e25599de37d1': {
    titleEn: 'Konopný Táta',
    taglineEn: 'Natural hemp cosmetics from the Beskydy Mountains',
    briefEn: 'Konopný Táta makes natural hemp cosmetics in the Beskydy Mountains. It was looking for a brand and packaging that would instantly convey honesty, natural origin and local production.',
    vysledekEn: 'We designed a visual identity and a packaging system for the whole product range. The labels share one friendly look, while each product is still easy to tell apart on the shelf.',
    seoDescriptionEn: 'Branding and packaging design for Konopný Táta — natural hemp cosmetics from the Beskydy Mountains.',
  },
  '3a956aa9-3ee4-49f5-a86d-ec68975c4c36': {
    titleEn: 'Data MSK',
    taglineEn: 'Open data portal of the Moravian-Silesian Region',
    briefEn: 'The Moravian-Silesian Region publishes open data about the region. It needed a portal where even non-experts can find their way around — clear, visual and with a distinct identity.',
    vysledekEn: 'We designed the identity and the data.msk.cz portal. Interactive visualisations, animation and a clear structure help people explore data and trends about the region.',
    seoDescriptionEn: 'Identity and web design for data.msk.cz, the open data portal of the Moravian-Silesian Region — visualisations, animation and UX.',
  },
  'a105784d-c199-416e-a86a-25a21649e02d': {
    titleEn: 'Velký Špalíček',
    taglineEn: 'Rebranding a Brno landmark',
    briefEn: 'Velký Špalíček is a shopping and entertainment centre in the historic heart of Brno. Its manager CBRE wanted a new face that would connect the exceptional location with contemporary city life.',
    vysledekEn: 'We created a new identity built on a bold logotype and a graphic system for signage, campaigns and the centre’s communication. Špalíček now speaks with one voice, from the façade to social media.',
    seoDescriptionEn: 'Rebranding of Velký Špalíček shopping centre in Brno for CBRE — new logotype, visual identity and graphic system.',
  },
}

for (const [id, fields] of Object.entries(patches)) {
  const draftId = `drafts.${id}`
  const draft = await client.getDocument(draftId)
  if (draft) {
    await client.patch(draftId).set(fields).commit()
    console.log(`✏️  ${draft.title}: EN doplněno do draftu`)
  } else {
    const published = await client.getDocument(id)
    if (!published) { console.warn(`⚠️  ${id} neexistuje, přeskočeno`); continue }
    const { _rev, _updatedAt, _createdAt, ...rest } = published
    await client.createOrReplace({ ...rest, ...fields, _id: draftId })
    console.log(`📝 ${published.title}: vytvořen draft s EN`)
  }
}

// Site Settings → anglické kroky procesu: podmět u rešerše + „brand guidelines“
const settings = await client.getDocument('siteSettings')
const steps = settings?.processSteps ?? []
const set = {}
steps.forEach((s, i) => {
  if (s.titleEn === 'Research and naming')
    set[`processSteps[${i}].descriptionEn`] = 'We study your competition so we know how to set you apart and make you memorable. If you need a name, we find one that fits — available, unique and clear.'
  if (s.titleEn === 'Brand manual and handover') {
    set[`processSteps[${i}].titleEn`] = 'Brand guidelines and handover'
    set[`processSteps[${i}].descriptionEn`] = 'We deliver complete brand guidelines and all exported assets — logos, fonts, colours — ready to use right away. The brand is yours.'
  }
})
if (Object.keys(set).length) {
  await client.patch('siteSettings').set(set).commit()
  console.log('✏️  Site Settings: opraveny anglické kroky procesu')
}

/**
 * Copy audit — finální texty case studies (CS + EN) podle faktů od Petra
 * (co přesně pro klienta vzniklo), úklid prázdných/placeholder sekcí.
 * Zapisuje do DRAFTŮ. S přepínačem --publish drafty rovnou publikuje
 * (draft → publikovaný dokument, draft se smaže).
 *
 * Použití: node scripts/copy-audit-finalize.mjs [--publish]
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

const IDS = {
  halmax:   'd294565d-0d7b-4fc4-99f9-8fcf4977bc8a',
  jatvar:   'caseStudy-jatvar',
  malina:   'caseStudy-autojeraby-malina',
  konopny:  '266ebc30-501a-4a44-aba6-e25599de37d1',
  datamsk:  '3a956aa9-3ee4-49f5-a86d-ec68975c4c36',
  spalicek: 'a105784d-c199-416e-a86a-25a21649e02d',
}

const set = {
  // Halmax — název je od nás; texty z předchozího auditu sedí
  [IDS.halmax]: {},

  // Jatvar — logo + monogram, tiskoviny + vzorník, polep vozů, web
  [IDS.jatvar]: {
    vysledek: 'Postavili jsme ucelenou identitu na sytě zelené a kameni. Monogram „J“, tiskoviny, vzorník, polep vozů i responzivní web dnes Jatvaru dávají jednotný, sebevědomý výraz napříč všemi dotykovými body.',
    vysledekEn: 'We built a cohesive identity rooted in deep green and stone. The “J” monogram, print materials, a sample book, vehicle livery and a responsive website now give Jatvar one confident look across every touchpoint.',
  },

  // Autojeřáby Malina — logo + identita, web, polepy techniky, tiskoviny
  [IDS.malina]: {
    client: 'Autojeřáby Malina',
    vysledek: 'Připravili jsme rebrand od loga a vizuální identity přes tiskoviny a polepy jeřábů a vozidel až po firemní web. Nová identita je robustní a výrazná, dobře čitelná na technice i v digitálu.',
    vysledekEn: 'We delivered a rebrand spanning the logo and visual identity, print materials, crane and vehicle livery, and the company website. The new identity is robust and bold, legible on machinery and in digital alike.',
    seoDescription: 'Rebrand rodinné firmy Autojeřáby Malina s 30letou historií — logo, vizuální identita, tiskoviny, polepy techniky a firemní web.',
    seoDescriptionEn: 'Rebrand of Autojeřáby Malina, a family crane company with 30 years of history — logo, visual identity, print, vehicle livery and website.',
  },

  // Konopný Táta — logo + identita, etikety celé řady
  [IDS.konopny]: {
    vysledek: 'Navrhli jsme logo, vizuální identitu a systém etiket pro celou produktovou řadu. Etikety drží jednotný, přívětivý výraz a jednotlivé produkty v regálu přitom snadno rozlišíte.',
    vysledekEn: 'We designed the logo, visual identity and a label system for the whole product range. The labels share one friendly look, while each product is still easy to tell apart on the shelf.',
  },

  // Data MSK — identita portálu, UX + webdesign, animace (bez datových vizualizací), 2025
  [IDS.datamsk]: {
    year: 2025,
    vysledek: 'Navrhli jsme identitu portálu, jeho strukturu i webdesign data.msk.cz. Srozumitelné rozhraní a animace pomáhají objevovat data a trendy o kraji i lidem, kteří s daty běžně nepracují.',
    vysledekEn: 'We designed the portal’s identity, structure and the data.msk.cz web design. A clear interface and animation help people explore data and trends about the region — even those who don’t work with data every day.',
    seoDescription: 'Identita, UX a webdesign portálu otevřených dat Moravskoslezského kraje data.msk.cz.',
    seoDescriptionEn: 'Identity, UX and web design for data.msk.cz, the open data portal of the Moravian-Silesian Region.',
  },

  // Velký Špalíček — logotyp + identita, značení v centru, kampaně, sociální sítě
  [IDS.spalicek]: {
    vysledek: 'Vytvořili jsme nový logotyp a vizuální identitu, orientační značení v centru, kampaně i grafiku pro sociální sítě. Špalíček tak mluví jedním hlasem od fasády po sociální sítě.',
    vysledekEn: 'We created a new logotype and visual identity, in-centre signage, campaigns and social media graphics. Špalíček now speaks with one voice, from the façade to social media.',
    seoDescription: 'Rebranding brněnského nákupního centra Velký Špalíček pro CBRE — logotyp, identita, orientační značení, kampaně a sociální sítě.',
    seoDescriptionEn: 'Rebranding of Velký Špalíček shopping centre in Brno for CBRE — logotype, identity, signage, campaigns and social media.',
    // sekce „Challenge“ obsahovala jen opakovaný placeholder text
    sections: [],
  },
}

for (const [id, fields] of Object.entries(set)) {
  const draftId = `drafts.${id}`
  let draft = await client.getDocument(draftId)
  if (!draft) {
    const published = await client.getDocument(id)
    if (!published) { console.warn(`⚠️  ${id} neexistuje`); continue }
    const { _rev, _updatedAt, _createdAt, ...rest } = published
    draft = await client.createOrReplace({ ...rest, _id: draftId })
  }
  let p = client.patch(draftId)
  if (Object.keys(fields).length) p = p.set(fields)
  // prázdné sekce obsahu (bez nadpisu, textu i obrázků) jen dělají mezery
  const empty = (draft.sections ?? []).filter((s) => !s.heading && !s.headingEn && !s.body?.length && !s.bodyEn?.length && !s.images?.length)
  if (empty.length && !('sections' in fields)) p = p.unset(empty.map((s) => `sections[_key=="${s._key}"]`))
  await p.commit()
  console.log(`✏️  ${draft.title}: texty doladěny${empty.length && !('sections' in fields) ? `, odstraněno ${empty.length} prázdných sekcí` : ''}`)
}

if (process.argv.includes('--publish')) {
  for (const id of Object.values(IDS)) {
    const draft = await client.getDocument(`drafts.${id}`)
    if (!draft) continue
    const { _rev, _updatedAt, _createdAt, ...rest } = draft
    await client.transaction()
      .createOrReplace({ ...rest, _id: id })
      .delete(`drafts.${id}`)
      .commit()
    console.log(`🚀 ${draft.title}: publikováno`)
  }
}

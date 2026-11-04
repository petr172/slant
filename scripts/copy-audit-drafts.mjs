/**
 * Copy audit (11/2026) — doplnění a oprava textů case studies.
 * Zapisuje jako DRAFTY (drafts.<id>) → na webu se nic nezmění, dokud změny
 * ve Studiu nezkontroluješ a nepublikuješ. Existující draft se jen patchne.
 * Navíc drobná jazyková oprava kroku procesu v Site Settings (publikovaně).
 *
 * Použití: node scripts/copy-audit-drafts.mjs
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
  // Halmax — v briefu/výsledku byly placeholdery „ssad“ / „asdasd“
  'd294565d-0d7b-4fc4-99f9-8fcf4977bc8a': {
    brief: 'Halmax dodává montované plachtové haly pro zemědělce i firmy. Potřeboval jméno a značku, která v oboru technických dodavatelů působí srozumitelně, spolehlivě a profesionálně.',
    vysledek: 'Navrhli jsme název Halmax a kompletní vizuální identitu — logo, barevný systém a grafiku pro tiskoviny i značení hal. Značka je jednoduchá, čitelná na dálku a funguje v terénu stejně dobře jako v katalogu.',
    seoDescription: 'Naming a branding pro Halmax, českého dodavatele montovaných plachtových hal. Název, logo, barevný systém a grafika.',
  },
  // Jatvar — tagline mluvil o řeznictví, jde o kamenictví; odvětví opraveno
  'caseStudy-jatvar': {
    tagline: 'Identita pro rodinné kamenictví s tradicí od roku 1965',
    industry: 'Kamenictví',
    brief: 'Jatvar je rodinné kamenictví s tradicí od roku 1965. Chyběla mu ale značka, která by jeho preciznost ukázala i navenek — od loga přes vzorníky až po polep vozů a web.',
    vysledek: 'Postavili jsme ucelenou identitu na sytě zelené a kameni. Monogram „J“, systém tiskovin, vzorník i responzivní web dnes Jatvaru dávají jednotný, sebevědomý výraz napříč všemi dotykovými body.',
    seoDescription: 'Branding pro Jatvar, rodinné kamenictví s tradicí od roku 1965. Monogram, tiskoviny, vzorník, polep vozů a web.',
  },
  'caseStudy-autojeraby-malina': {
    industry: 'Stavebnictví',
    brief: 'Autojeřáby Malina jsou rodinná firma, která přes 30 let zajišťuje jeřábnické práce. Původní vizuální styl ale neodpovídal velikosti, technice ani profesionalitě, kterou firma dnes nabízí.',
    vysledek: 'Připravili jsme rebrand od loga po firemní web. Nová identita je robustní a výrazná, dobře čitelná na technice i v digitálu, a web přehledně představuje služby a možnosti firmy.',
    seoDescription: 'Rebrand rodinné firmy Autojeřáby Malina s 30letou historií — nové logo, vizuální identita, grafika a firemní web.',
  },
  '266ebc30-501a-4a44-aba6-e25599de37d1': {
    industry: 'Kosmetika',
    brief: 'Konopný Táta vyrábí přírodní konopnou kosmetiku v Beskydech. Hledal značku a obaly, které na první pohled sdělí poctivost, přírodní původ a lokální výrobu.',
    vysledek: 'Navrhli jsme vizuální identitu a obalový systém pro celou produktovou řadu. Etikety drží jednotný, přívětivý výraz a jednotlivé produkty v regálu přitom snadno rozlišíte.',
    seoDescription: 'Branding a obalový design pro Konopného Tátu — přírodní konopnou kosmetiku z Beskyd.',
  },
  '3a956aa9-3ee4-49f5-a86d-ec68975c4c36': {
    tagline: 'Portál otevřených dat Moravskoslezského kraje',
    client: 'Moravskoslezský kraj',
    industry: 'Veřejná správa',
    brief: 'Moravskoslezský kraj zveřejňuje otevřená data o regionu. Potřeboval portál, ve kterém se v nich vyzná i laik — přehledně, vizuálně a s jasnou identitou.',
    vysledek: 'Navrhli jsme identitu i webový portál data.msk.cz. Interaktivní vizualizace, animace a srozumitelná struktura pomáhají objevovat data a trendy o kraji.',
    seoDescription: 'Identita a webdesign portálu otevřených dat Moravskoslezského kraje data.msk.cz — vizualizace, animace a UX.',
  },
  'a105784d-c199-416e-a86a-25a21649e02d': {
    brief: 'Velký Špalíček je nákupní a zábavní centrum v historickém srdci Brna. Jeho správce CBRE hledal novou tvář, která propojí výjimečnou polohu se současným městským životem.',
    vysledek: 'Vytvořili jsme novou identitu postavenou na výrazném logotypu a grafický systém pro značení, kampaně i komunikaci centra. Špalíček tak mluví jedním hlasem od fasády po sociální sítě.',
    seoDescription: 'Rebranding brněnského nákupního centra Velký Špalíček pro CBRE — nový logotyp, vizuální identita a grafický systém.',
  },
}

for (const [id, fields] of Object.entries(patches)) {
  const draftId = `drafts.${id}`
  const draft = await client.getDocument(draftId)
  if (draft) {
    await client.patch(draftId).set(fields).commit()
    console.log(`✏️  ${draft.title}: patch existujícího draftu`)
  } else {
    const published = await client.getDocument(id)
    if (!published) { console.warn(`⚠️  ${id} neexistuje, přeskočeno`); continue }
    const { _rev, _updatedAt, _createdAt, ...rest } = published
    await client.createOrReplace({ ...rest, ...fields, _id: draftId })
    console.log(`📝 ${published.title}: vytvořen draft`)
  }
}

// Site Settings → krok procesu „Rešerše a naming“: podmět („abychom se odlišili“ = my)
const settings = await client.getDocument('siteSettings')
const steps = settings?.processSteps ?? []
const idx = steps.findIndex((s) => s.title === 'Rešerše a naming')
if (idx >= 0) {
  await client
    .patch('siteSettings')
    .set({ [`processSteps[${idx}].description`]: 'Projdeme vaši konkurenci, abychom věděli, jak se od ní odlišit a zůstat v paměti. Když je potřeba jméno, najdeme takové, které sedí — dostupné, unikátní a srozumitelné.' })
    .commit()
  console.log('✏️  Site Settings: opraven krok „Rešerše a naming“')
}

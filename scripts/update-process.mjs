// Přepíše proces ("Jak to děláme") v siteSettings na 6 zhuštěných kroků.
// Spuštění: node scripts/update-process.mjs
import { createClient } from '@sanity/client'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const env = Object.fromEntries(
  readFileSync(resolve('.env'), 'utf8').split('\n')
    .filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
)
const token = process.env.SANITY_WRITE_TOKEN || env.SANITY_WRITE_TOKEN
if (!token) { console.error('Chybí SANITY_WRITE_TOKEN'); process.exit(1) }
const client = createClient({ projectId: 'wgpoci6t', dataset: 'production', apiVersion: '2024-01-01', token, useCdn: false })

const steps = [
  {
    title: 'Úvodní schůzka',
    titleEn: 'Kick-off meeting',
    description: 'Sejdeme se osobně nebo online a zjistíme co nejvíc o vašem podnikání — vizi, cíle, trh i zákazníky. Čím líp vás poznáme, tím přesněji vás vystihneme.',
    descriptionEn: 'We meet in person or online and learn as much as we can about your business — your vision, goals, market and customers. The better we know you, the more accurately we capture you.',
  },
  {
    title: 'Nabídka a dohoda',
    titleEn: 'Proposal and agreement',
    description: 'Připravíme cenovou nabídku na míru (platí 30 dní, takže se v klidu rozhodnete). Když si plácneme, vyřídíme smlouvu a zálohu — a jdeme na to.',
    descriptionEn: 'We prepare a tailored quote (valid for 30 days, so you can decide calmly). Once we shake on it, we sort the contract and deposit — and off we go.',
  },
  {
    title: 'Rešerše a naming',
    titleEn: 'Research and naming',
    description: 'Projdeme vaši konkurenci, abychom se odlišili a byli zapamatovatelní. Když je potřeba jméno, najdeme takové, které sedí — dostupné, unikátní a srozumitelné.',
    descriptionEn: 'We study your competition so we can stand out and stay memorable. If you need a name, we find one that fits — available, unique and clear.',
  },
  {
    title: 'Moodboard',
    titleEn: 'Moodboard',
    description: 'Poskládáme vizuální směr a sejdeme se nad ním. Chceme mít jistotu, že jsme s vámi na jedné vlně, ještě než se pustíme do návrhu.',
    descriptionEn: 'We put together a visual direction and meet over it. We want to be sure we’re on the same wavelength before we start designing.',
  },
  {
    title: 'Stylescape',
    titleEn: 'Stylescape',
    description: 'Ukážeme návrh loga, typografie, barev a celého vizuálního stylu v reálných aplikacích. Společně ho doladíme podle vaší zpětné vazby.',
    descriptionEn: 'We present the logo, typography, colours and the whole visual style in real applications. We fine-tune it together based on your feedback.',
  },
  {
    title: 'Brand manuál a předání',
    titleEn: 'Brand manual and handover',
    description: 'Dodáme kompletní brand manuál i všechna exportovaná data — loga, písma, barvy — připravená k okamžitému použití. Značka je vaše.',
    descriptionEn: 'We deliver a complete brand manual and all exported assets — logos, fonts, colours — ready to use right away. The brand is yours.',
  },
].map((s, i) => ({ _type: 'processStep', _key: `step${i + 1}`, ...s }))

async function main() {
  // Najdi singleton dokument siteSettings
  const docs = await client.fetch('*[_type == "siteSettings"]{_id}')
  if (!docs.length) { console.error('siteSettings dokument nenalezen'); process.exit(1) }
  for (const { _id } of docs) {
    await client.patch(_id).set({ processSteps: steps }).commit()
    console.log(`  ✓ patched ${_id}`)
  }
  console.log('✅ Proces aktualizován na 6 kroků.')
}
main().catch(e => { console.error(e); process.exit(1) })

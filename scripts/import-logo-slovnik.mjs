// One-off import: vytvoří/aktualizuje blogový článek "Logo slovník" v Sanity
// včetně nahrání obrázků. Spuštění:  node scripts/import-logo-slovnik.mjs
import { createClient } from '@sanity/client'
import { readFileSync, createReadStream } from 'node:fs'
import { resolve } from 'node:path'

// --- načti SANITY_WRITE_TOKEN z .env ---
const env = Object.fromEntries(
  readFileSync(resolve('.env'), 'utf8')
    .split('\n')
    .filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
)
const token = process.env.SANITY_WRITE_TOKEN || env.SANITY_WRITE_TOKEN
if (!token) { console.error('Chybí SANITY_WRITE_TOKEN'); process.exit(1) }

const client = createClient({
  projectId: 'wgpoci6t',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token,
  useCdn: false,
})

const IMG_DIR = '/Users/petermojzisek/Library/CloudStorage/GoogleDrive-petr@slant.cz/.shortcut-targets-by-id/1UIS9vwywxHUb9ExofUnJPZdsRoqr0oEK/slant/marketing/web_NEW/Blog/01-Logo slovnik/Obrazky/https_/slant.cz/blog/logo-slovnik/_preview_id=18190&preview_nonce=ddecd38a5c&preview=true&_thumbnail_id=18461 - slant_cz_blog_logo-slovnik_preview_id_18190_preview_nonce_ddecd38a5c_preview_true_thumbnail_id_18461_1440w_default.h2d by html.to.design ❤️ FREE version - 31/05'

async function upload(file, label) {
  const asset = await client.assets.upload('image', createReadStream(resolve(IMG_DIR, file)), { filename: file })
  console.log(`  ✓ ${label} → ${asset._id}`)
  return asset._id
}

let k = 0
const key = () => `b${k++}`
const para = (text) => ({ _type: 'block', _key: key(), style: 'normal', markDefs: [], children: [{ _type: 'span', _key: key(), text, marks: [] }] })
const h2   = (text) => ({ _type: 'block', _key: key(), style: 'h2',     markDefs: [], children: [{ _type: 'span', _key: key(), text, marks: [] }] })
const img  = (assetId, alt, caption) => ({ _type: 'image', _key: key(), asset: { _type: 'reference', _ref: assetId }, alt, caption })

const sections = [
  { n: '1. Abstraktní symbol', file: 'abstrakt.png.png',
    text: 'Symbol bez typografie, kterému se říká také logomark. Nemá konkrétní reálnou předlohu — funguje spíš jako emotivní, čistě vizuální vyjádření značky.',
    ex: 'Nike, Mitsubishi, Pepsi, National Geographic' },
  { n: '2. Piktogram', file: 'piktogram.png.png',
    text: 'Na rozdíl od abstraktního symbolu je piktogram jasně rozeznatelný. Má předlohu v reálném světě a většinou odkazuje přímo k názvu nebo podstatě značky.',
    ex: 'Apple, Shell, Twitter, Air Jordan' },
  { n: '3. Písmeno', file: 'pismeno.png.png',
    text: 'Grafické zpracování prvního písmene názvu může být skvělým logem — pokud je dostatečně originální a zapamatovatelné. Letterform se díky jednoduchosti hodí i do malých formátů a ikon.',
    ex: 'Netflix, Facebook, McDonald’s, Motorola' },
  { n: '4. Typografické logo', file: 'typo-1.png.png',
    text: 'Logotype neboli wordmark je grafické zpracování celého názvu značky bez dalších symbolů. Buď font tvořený na míru, nebo profesionální písmo doladěné do detailu.',
    ex: 'Coca-Cola, Vans, Tesla, Lego' },
  { n: '5. Monogram', file: 'monogram.png.png',
    text: 'Lettermark vychází ze zkratky delšího názvu. Hodí se značkám, které jsou pod svou zkratkou zažitější než pod plným jménem.',
    ex: 'IBM, NASA, HBO, NY' },
  { n: '6. Kombinovaný symbol', file: 'kombinacesymbol.png.png',
    text: 'Spojení symbolu (logomark) a názvu (logotype nebo lettermark). Combination mark obsahuje obojí — značku tak poznáte podle symbolu i podle jména.',
    ex: 'Red Bull, Škoda, Instagram, adidas' },
  { n: '7. Maskot', file: 'maskot.png.png',
    text: 'Maskot je dnes spíš historické řešení — kvůli členitosti se firmy uchylují k jednodušším formám. Pořád ale žije, hlavně v potravinářství, na obalech a u fast foodů.',
    ex: 'Michelin, Pringles, KFC, Monopoly' },
  { n: '8. Emblém', file: 'emblemlog.png.png',
    text: 'Emblém vyzdvihuje historii a tradici značky. Erb a jeho detailnost ale naráží na malé velikosti, takže pro digitál bývá nepraktický.',
    ex: 'Starbucks, NFL, Harley-Davidson, Warner Bros.' },
]

async function main() {
  console.log('Nahrávám obrázky…')
  const coverId   = await upload('Figure → logo_slovnik.jpg.png', 'cover')
  const gridId    = await upload('logovariants.png.png', 'logovariants')
  const sectionIds = {}
  for (const s of sections) sectionIds[s.file] = await upload(s.file, s.n)

  console.log('Skládám obsah…')
  const body = [
    para('V designovém světě se pořád dokola potkáváme s tím, že každý mluví o tom samém — jen jinými slovy. Pojmenování log je přitom snadné, když víte, na co se díváte. Pojďme si projít osm základních typů a dát jim správná jména.'),
    img(gridId, 'Přehled osmi typů log na známých značkách', 'Osm nejčastějších typů log na známých značkách'),
    h2('Druhy loga'),
    para('Logo je nejdůležitější a nejpoužívanější vizuální zkratka značky. Pozor ale — logo není brand. Je to spíš tvář značky: reprezentuje ji a ladí s jejím celkovým vzhledem i chováním.'),
  ]
  for (const s of sections) {
    body.push(h2(s.n))
    body.push(para(s.text))
    body.push(para(`Příklady: ${s.ex}.`))
    body.push(img(sectionIds[s.file], s.n, s.ex))
  }

  const doc = {
    _id: 'blog-post-logo-slovnik',
    _type: 'blogPost',
    title: 'Logo slovník',
    slug: { _type: 'slug', current: 'logo-slovnik' },
    description: 'Sepsali jsme jednoduchý logo slovník pro všechny, kdo tápou, jak nazvat symboly pravými jmény. Projděte si s námi 8 základních typů log.',
    category: 'Branding',
    publishedAt: '2021-03-15T16:00:00.000Z',
    coverImage: { _type: 'image', asset: { _type: 'reference', _ref: coverId }, alt: 'Logo slovník — kniha s typy log' },
    body,
    featured: false,
  }

  console.log('Zapisuji dokument…')
  await client.createOrReplace(doc)
  console.log('✅ Hotovo: /blog/logo-slovnik')
}

main().catch(e => { console.error(e); process.exit(1) })

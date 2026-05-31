// One-off import: blogový článek "Knihy pro designéry".
// Spuštění:  node scripts/import-knihy-pro-designery.mjs
import { createClient } from '@sanity/client'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const env = Object.fromEntries(
  readFileSync(resolve('.env'), 'utf8')
    .split('\n')
    .filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
)
const token = process.env.SANITY_WRITE_TOKEN || env.SANITY_WRITE_TOKEN
if (!token) { console.error('Chybí SANITY_WRITE_TOKEN'); process.exit(1) }

const client = createClient({ projectId: 'wgpoci6t', dataset: 'production', apiVersion: '2024-01-01', token, useCdn: false })

let k = 0
const key = () => `b${k++}`
const para = (text) => ({ _type: 'block', _key: key(), style: 'normal', markDefs: [], children: [{ _type: 'span', _key: key(), text, marks: [] }] })
const h2   = (text) => ({ _type: 'block', _key: key(), style: 'h2',     markDefs: [], children: [{ _type: 'span', _key: key(), text, marks: [] }] })
// kniha: tučný název + zbytek
const book = (title, rest) => ({
  _type: 'block', _key: key(), style: 'normal', markDefs: [],
  children: [
    { _type: 'span', _key: key(), text: title, marks: ['strong'] },
    { _type: 'span', _key: key(), text: rest, marks: [] },
  ],
})

const groups = [
  { h: 'Základy a principy', books: [
    ['The Non-Designer’s Design Book — Robin Williams', '. Ideální start do designu pro nováčky a zároveň skvělé opáčko pro pokročilé.'],
    ['Grid Systems in Graphic Design — Josef Müller-Brockmann', '. Příručka práce s mřížkami — základ každého čistého layoutu.'],
    ['The Vignelli Canon — Massimo Vignelli', '. Svět a principy designu očima slavného italského designéra.'],
  ]},
  { h: 'Typografie', books: [
    ['Thinking with Type — Ellen Lupton', '. Typografická bible pro každého, kdo má rád písmo.'],
    ['Eseje o typografii — František Štorm', '. Pro začátečníky i pokročilé, od nejslavnějšího českého typografa.'],
    ['Knihy a typografie — Martin Pecina', '. Uvolněná publikace o celém procesu tvorby knih.'],
    ['Helvetica — Lars Müller', '. Knižní ukázka toho, jak jedno písmo změnilo moderní svět.'],
  ]},
  { h: 'Branding, strategie a kreativita', books: [
    ['The Brand Gap — Marty Neumeier', '. O teorii budování brandu a o tom, proč spolu strategie a kreativa musí hrát.'],
    ['Pocket Full of Do — Chris Do', '. Rady, tipy a filozofie zakladatele vzdělávací platformy The Futur.'],
    ['Book of Ideas — Radim Malinic', '. Přesně to, co slibuje — nápady od kreativního ředitele londýnské Brand Nu.'],
    ['Ogilvy o reklamě — David Ogilvy', '. Klasika od „otce reklamy“ a zakladatele jedné z nejúspěšnějších agentur.'],
    ['Start your own f*cking brand — Maria Erixon', '. Příběh budování švédské značky Nudie Jeans přímo od její zakladatelky.'],
  ]},
  { h: 'Loga, data a infografika', books: [
    ['Logo Modernism — Jens Müller & R. Roger Remington', '. 6 000 moderních log v té nejryzejší podobě.'],
    ['Designing News — Francesco Franchi', '. Pohled na budoucnost médií a informační grafiky.'],
    ['Information Graphics — Julius Wiedemann, Sandra Rendgen', '. Kniha plná skvělé infografiky pro datové nerdy.'],
    ['National Geographic Infographics — Julius Wiedemann', '. Ty nejlepší infografiky z Nat Geo na jednom místě.'],
    ['AIGA Graphic Design USA — kolektiv autorů', '. Ročenka vydávaná Americkou institucí grafického designu.'],
  ]},
]

const body = [
  para('V našem studiu jsme rozjeli knižní klub pro všechny, koho baví design — a sešla se pěkná řádka tipů. Vybrali jsme knihy, které nám samotným změnily pohled na řemeslo nebo nám pomohly přímo v práci. Některé možná máte doma, jiné vás snad inspirují.'),
  para('Tentokrát žádné odkazy na obchody — kde nakoupíte, necháme čistě na vás. Pojďme na to, rozdělili jsme tipy do několika okruhů.'),
]
for (const g of groups) {
  body.push(h2(g.h))
  for (const [title, rest] of g.books) body.push(book(title, rest))
}
body.push(h2('Tip pro uživatele Affinity'))
body.push(book('Workbook Designer / Photo / Publisher — kolektiv autorů', '. Skvělá příručka nejen pro samotný program, ale i pro práci s grafikou v digitálním světě.'))
body.push(h2('Bonus'))
body.push(para('Pro milovníky krásné sazby — a jako zdroj tipů na dárek pro designéra — rozhodně mrkněte na standardsmanual.com.'))
body.push(para('To je od nás pro tentokrát vše. Designu zdar!'))

const doc = {
  _id: 'blog-post-knihy-pro-designery',
  _type: 'blogPost',
  title: 'Knihy pro designéry',
  slug: { _type: 'slug', current: 'knihy-pro-designery' },
  description: 'Pár skvělých tipů na knížky, které nám změnily pohled na design. Některé možná máte doma, jiné vás třeba inspirují. Projděte si náš seznam knih pro designéry.',
  category: 'Studio',
  publishedAt: '2025-01-15T08:00:00.000Z',
  body,
  featured: false,
}

client.createOrReplace(doc)
  .then(() => console.log('✅ Hotovo: /blog/knihy-pro-designery'))
  .catch(e => { console.error(e); process.exit(1) })

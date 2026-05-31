// One-off import: blogový článek "6 důvodů, proč potřebujete branding".
// Spuštění:  node scripts/import-proc-branding.mjs
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

const body = [
  para('Dokážete si přesvědčivě odpovědět na tři základní otázky? Kdo jste? Co děláte? Proč je to důležité? Pokud u některé zaváháte, je nejvyšší čas zapracovat na značce. Tady je šest důvodů, proč branding není luxus, ale základ.'),

  h2('1. Dáte značce pevné základy'),
  para('Branding vám pomůže vytyčit základní atributy a poslání značky. Zní to jako klišé? Zkuste si odpovědět sami:'),
  para('Kdo jste? My jsme Slant, brandingové studio. Co děláte? Pomáháme firmám a podnikatelům budovat jejich značky. Proč je to důležité? Protože tím zúročíme jejich investici do brandingu a přidáme hodnotu jejich produktu i službě.'),
  para('Zvládnete odpovědět stejně přesvědčivě?'),

  h2('2. Zvýšíte důvěru ve značku'),
  para('Silnější značka znamená vyšší důvěru — a ta zkracuje zákazníkovo rozhodování o nákupu nebo spolupráci. Vybudovaná důvěra zároveň posílí vaši pozici na trhu a dá vám náskok před konkurencí.'),

  h2('3. Odlišíte se a budete zapamatovatelní'),
  para('Vhodným pozicováním, názvem, vizuálem — čímkoli, co dává smysl a ladí s vaší brand strategií — se odlišíte od ostatních. Budete rozpoznatelní a hlavně zapamatovatelní.'),

  h2('4. Sjednotíte vizuální styl a podnítíte emoce'),
  para('Brandmanuál sjednotí váš vizuální styl, takže působíte profesionálně. Zákazníci vám lépe rozumí a odmění vás větší důvěrou.'),
  para('Komunikační strategie pak dává jasno: kterou akci podpořit, s jakým partnerem spolupracovat, jakými kanály komunikovat a jaký obsah by zákazníci rádi viděli. Tím si budujete pevnou pozici na trhu.'),

  h2('5. Zvýšíte hodnotu své značky'),
  para('Čím silnější je vaše značka, tím vyšší marži si můžete dovolit. Zůstanete konkurenceschopní a postupně vybudujete základnu loajálních zákazníků.'),

  h2('6. Posílíte firemní kulturu'),
  para('Pro lovebrand chce pracovat každý. Přitáhnete kvalitnější lidi z oboru, kteří budou hrdí, že mohou pracovat právě pro vás — a vaše HR nebude stíhat příval nových uchazečů.'),

  h2('Dává vám to smysl?'),
  para('A jak jste na tom se svou značkou vy? Jestli začínáte, snad se nám podařilo ukázat, jaké výhody branding přináší a jak je pro vás důležitý. Jestli už podnikáte — jste si jistí, že o značku pečujete správně?'),
  para('Na změnu není nikdy pozdě. Branding je vhodné svěřit do rukou odborníků; zuby si přece taky nevrtáte sami. A věřte, že se investice do budování značky brzy vrátí. Podnikání, které dělá radost vašim zákazníkům, bude dělat radost i vám.'),
  para('Potřebujete poradit nebo máte otázky? Velmi rádi vám je zodpovíme.'),
]

const doc = {
  _id: 'blog-post-proc-potrebujete-branding',
  _type: 'blogPost',
  title: '6 důvodů, proč potřebujete branding',
  slug: { _type: 'slug', current: 'proc-potrebujete-branding' },
  description: 'Dokážete si přesvědčivě odpovědět na tři otázky? Kdo jste? Co děláte? Proč je to důležité? Přečtěte si 6 důvodů, proč potřebujete branding.',
  category: 'Branding',
  publishedAt: '2025-02-15T10:00:00.000Z',
  body,
  featured: false,
}

client.createOrReplace(doc)
  .then(() => console.log('✅ Hotovo: /blog/proc-potrebujete-branding'))
  .catch(e => { console.error(e); process.exit(1) })

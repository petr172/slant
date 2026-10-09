// Kurátorský zásah do blogu:
//  1) smaže zastaralé/off-topic a prázdné články
//  2) dopíše „Typografie jako nástroj emocí“
//  3) vytvoří nové: „Rebranding: kdy a jak“ a „Jak vzniká název značky“
//  4) doplní cover obrázky u článků, kde chyběly
// Spuštění:  node scripts/curate-blog.mjs
import { createClient } from '@sanity/client'
import { readFileSync, createReadStream, existsSync } from 'node:fs'
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

const COVERS = '/private/tmp/claude-501/-Users-petermojzisek-Library-CloudStorage-GoogleDrive-petr-slant-cz--shortcut-targets-by-id-1UIS9vwywxHUb9ExofUnJPZdsRoqr0oEK-slant-marketing-slant-web/de6f1860-c619-4c0f-b167-79af32f46880/scratchpad/covers_final'

// ─── Portable Text helpers ──────────────────────────────────────────────
let k = 0
const key = () => `b${k++}`
function children(parts) {
  const arr = Array.isArray(parts) ? parts : [parts]
  const markDefs = []
  const kids = arr.map(p => {
    if (typeof p === 'string') return { _type: 'span', _key: key(), text: p, marks: [] }
    const marks = []
    if (p.strong) marks.push('strong')
    if (p.em) marks.push('em')
    if (p.href) { const mkk = key(); markDefs.push({ _type: 'link', _key: mkk, href: p.href }); marks.push(mkk) }
    return { _type: 'span', _key: key(), text: p.t, marks }
  })
  return { kids, markDefs }
}
function mk(style, parts, extra = {}) {
  const { kids, markDefs } = children(parts)
  return { _type: 'block', _key: key(), style, markDefs, children: kids, ...extra }
}
const para = (parts) => mk('normal', parts)
const h2 = (text) => mk('h2', text)
const quote = (parts) => mk('blockquote', parts)
const li = (parts) => mk('normal', parts, { listItem: 'bullet', level: 1 })

async function upload(file, alt) {
  const path = resolve(COVERS, file)
  if (!existsSync(path)) { console.warn(`  ⚠ cover chybí: ${file}`); return null }
  const asset = await client.assets.upload('image', createReadStream(path), { filename: file })
  return { _type: 'image', asset: { _type: 'reference', _ref: asset._id }, alt }
}

// ─── 1) Smazat ──────────────────────────────────────────────────────────
const toDelete = [
  'blog-post-2',  // UX audit (prázdné)
  'blog-post-3',  // Rostutu (prázdné)
  'blog-post-graficke-nastroje-v-roce-2021',
  'blog-post-cms-nastroje-je-wordpress-budoucnost-nebo-uz-minulost',
  'blog-post-produktivita-v-designu',
  'blog-post-online-utility-pro-designery',
]

// ─── Těla článků ────────────────────────────────────────────────────────
const typografieBody = () => [
  para('Ještě než si přečtete první větu, písmo vám už něco pošeptalo. Tvar liter, jejich šířka, patky, mezery — to všechno ve vás vyvolá pocit dřív, než vůbec rozklíčujete význam slov. Typografie je proto jeden z nejsilnějších, a zároveň nejvíc podceňovaných nástrojů brandingu.'),
  para('Dva totožné texty v jiném písmu řeknou dvě různé věci. Jeden může působit draze a sebejistě, druhý lacině a nejistě. A přesně v tom je její síla.'),
  h2('Písmo má osobnost'),
  para('Na každé písmo se dá dívat jako na člověka — má svůj charakter, náladu a způsob, jakým mluví. Hrubě se dají rozdělit do několika rodin a každá nese jinou osobnost:'),
  li([{ t: 'Patková (serif)', strong: true }, ' — tradice, důvěryhodnost, autorita. Noviny, luxusní značky, advokáti.']),
  li([{ t: 'Bezpatková (sans-serif)', strong: true }, ' — čistota, modernost, přímočarost. Technologie, startupy, návody.']),
  li([{ t: 'Skript a rukopis', strong: true }, ' — osobní, emotivní, řemeslné. Svatby, cukrárny, drobní výrobci.']),
  li([{ t: 'Displejová písma', strong: true }, ' — výraz, hravost, odvaha. Nadpisy, plakáty, silné kampaně.']),
  para('Nejde o to, že by jedna rodina byla lepší než druhá. Jde o to vybrat tu, která odpovídá tomu, kdo jste a co chcete, aby o vás lidé cítili.'),
  h2('Jak písmo vyvolává emoce'),
  para('Vnímání písma je z velké části podvědomé. Zaoblené tvary nám přijdou přátelské a měkké, ostré a geometrické zase sebejisté a chladné. Tenké řezy nesou eleganci a křehkost, tučné sílu a jistotu. Velké mezery mezi písmeny působí vzdušně a draze, stěsnaná sazba naléhavě a úsporně.'),
  para('Luxusní značka proto málokdy sáhne po tučném zaobleném písmu — rozbilo by pocit exkluzivity. A dětská značka zase nepoužije strohý technický grotesk, protože by působila odtažitě. Písmo musí ladit s příběhem, který značka vypráví.'),
  quote([{ t: 'Typografie není o tom text jen zobrazit. Je o tom dát mu tón hlasu.', em: true }]),
  h2('Síla je v páru'),
  para('Většina značek vystačí s dvojicí písem — jedním pro nadpisy a jedním pro běžný text. Nadpisové nese charakter a emoci, textové musí být především dobře čitelné. Dobrý pár si vzájemně nekonkuruje, ale doplňuje se: kombinujte písma, která mají dost odlišný charakter, aby byl mezi nimi jasný kontrast, ale sdílí podobnou „náladu“.'),
  para('Méně je přitom skoro vždycky víc. Tři a více písem už nadělá spíš zmatek než dojem.'),
  h2('Čitelnost na prvním místě'),
  para('I to nejkrásnější písmo je k ničemu, když se špatně čte. Dřív než budete řešit emoce, ověřte si základy: dostatečnou velikost, pohodlné řádkování, rozumnou délku řádku a dost kontrastu vůči pozadí. Emoce přijdou až potom — na pevném základu čitelnosti.'),
  h2('Závěr'),
  para('Typografie je tichý vypravěč vaší značky. Pracuje nepřetržitě, i když si toho nikdo vědomě nevšimne — na webu, na vizitce, na obalu i v e-mailu. Vybrat písmo proto není kosmetika, ale strategické rozhodnutí.'),
  para('Nejste si jistí, jestli vaše písmo říká to, co chcete? Rádi se na to s vámi podíváme.'),
]

const rebrandingBody = () => [
  para('Rebranding zní velkolepě — a taky trochu děsivě. Pravda je někde mezi. Není to rozmar ani kosmetická operace, ale strategický krok, který má smysl ve chvíli, kdy vám značka přestala sloužit. Pojďme si říct, kdy ten čas nastává a jak celý proces probíhá, aby z toho nebyl skok do neznáma.'),
  h2('Kdy je čas na rebranding'),
  para('Málokdy jde o jediný důvod. Spíš se sejde několik signálů najednou. Zpozorněte, pokud na sebe kývnete u některého z těchto bodů:'),
  li([{ t: 'Přerostli jste svou značku. ', strong: true }, 'Začínali jste jako jeden člověk a dnes jste tým nebo míříte na jiný, náročnější trh. Značka ale zůstala tam, kde jste byli na začátku.']),
  li([{ t: 'Působíte zastarale. ', strong: true }, 'Logo i web vypadají, jako by zamrzly v čase, a vedle konkurence ztrácíte.']),
  li([{ t: 'Nejste konzistentní. ', strong: true }, 'Každý materiál vypadá jinak, protože vznikal postupně a bez pravidel. Značka se rozpadá na kousky.']),
  li([{ t: 'Změnili jste se. ', strong: true }, 'Rozšířili jste nabídku, změnili cílovku nebo se spojili s někým dalším — a identita už neodpovídá tomu, kým jste.']),
  li([{ t: 'Stydíte se značku ukázat. ', strong: true }, 'Když se vám nechce posílat vlastní web nebo vizitku, něco je špatně.']),
  h2('Rebrand, nebo jen refresh?'),
  para('Ne každá změna musí být revoluce. Rozlišujeme dva přístupy a je dobré vědět, který potřebujete:'),
  li([{ t: 'Refresh', strong: true }, ' — evoluce. Zůstává jádro značky, ladí se detaily: modernizace loga, úprava palety, srovnání typografie. Zákazník vás pozná, jen vypadáte lépe.']),
  li([{ t: 'Rebrand', strong: true }, ' — revoluce. Mění se strategie, pozicování, často i jméno. Dává smysl při zásadním posunu firmy nebo špatné pověsti, kterou je potřeba nechat za sebou.']),
  para('Většina firem ve skutečnosti potřebuje refresh, ne kompletní rebrand. A to je dobrá zpráva — je to levnější, rychlejší a méně riskantní.'),
  h2('Jak rebranding probíhá'),
  para('Dobrý rebranding nikdy nezačíná u loga. Začíná u otázek. Takhle to vedeme my:'),
  li([{ t: 'Analýza a audit. ', strong: true }, 'Zmapujeme, kde značka stojí dnes, co funguje, co ne, a co si o vás myslí zákazníci i trh.']),
  li([{ t: 'Strategie. ', strong: true }, 'Vyjasníme pozici na trhu, hodnoty, tón komunikace a to, čím se chcete lišit. Tohle je základ, na kterém stojí všechno ostatní.']),
  li([{ t: 'Vizuální identita. ', strong: true }, 'Teprve teď přichází logo, barvy, písmo a celý vizuální systém — jako výsledek strategie, ne náhodný vkus.']),
  li([{ t: 'Zavedení. ', strong: true }, 'Brandmanuál, šablony a nasazení napříč všemi body dotyku, aby značka působila jednotně od webu po fakturu.']),
  h2('Na co si dát pozor'),
  para('Nejčastější chyba je měnit vzhled a nechat strategii být — to je jako přemalovat dům, který má popraskané základy. Druhá past je měnit značku moc často nebo moc radikálně; důvěru budujete roky a dá se o ni snadno přijít. A do třetice: rebranding bez plánu zavedení skončí tím, že nová identita žije jen na pár místech a zbytek zůstane postaru.'),
  h2('Závěr'),
  para('Rebranding není o tom, že se vám omrzelo staré logo. Je to nástroj, jak srovnat to, jak vás lidé vnímají, s tím, kým doopravdy jste. Když ho uděláte ve správný čas a ze správných důvodů, vrátí se vám mnohonásobně.'),
  para('Přemýšlíte, jestli je čas na změnu? Ozvěte se — rádi vám pomůžeme zhodnotit, jestli potřebujete refresh, rebrand, nebo zatím vůbec nic.'),
]

const namingBody = () => [
  para('Název je první slovo, které o vaší značce někdo vysloví. Opakuje se v každém hovoru, e-mailu i doporučení. A přitom vzniká často na poslední chvíli a od stolu. Dobrý název je přitom jedna z nejtěžších — a nejtrvalejších — věcí, které v brandingu tvoříme.'),
  h2('Co dělá název dobrým'),
  para('Neexistuje jediný správný recept, ale dobré jméno obvykle splňuje několik věcí najednou:'),
  li([{ t: 'Zapamatovatelnost. ', strong: true }, 'Snadno se vysloví, napíše a udrží v hlavě.']),
  li([{ t: 'Odlišnost. ', strong: true }, 'Nezaniká mezi konkurencí a nepleteme si ho s někým jiným.']),
  li([{ t: 'Dostupnost. ', strong: true }, 'Je volná doména i ochranná známka — bez toho je i skvělý název k ničemu.']),
  li([{ t: 'Nosnost. ', strong: true }, 'Unese růst. Název navázaný na jeden produkt nebo město vás může za pár let brzdit.']),
  li([{ t: 'Zvuk. ', strong: true }, 'Dobře zní nahlas. Jméno značky slýcháte častěji, než si myslíte.']),
  h2('Typy názvů'),
  para('Když víte, jaké má jméno možnosti, snáz se v nich vyznáte. Zjednodušeně se dají rozdělit do několika skupin:'),
  li([{ t: 'Popisné', strong: true }, ' — říkají rovnou, co děláte (Letenky.cz). Jasné, ale těžko se chrání a odlišují.']),
  li([{ t: 'Asociativní', strong: true }, ' — pracují s obrazem nebo pocitem (Nike, Amazon). Silné na budování příběhu.']),
  li([{ t: 'Vymyšlená', strong: true }, ' — nová slova bez významu (Kodak, Spotify). Skvěle se chrání, ale musíte je naplnit obsahem.']),
  li([{ t: 'Zkratky', strong: true }, ' — IBM, ČEZ. Praktické, ale neosobní a hůř zapamatovatelné.']),
  li([{ t: 'Podle zakladatele', strong: true }, ' — Baťa, Mall. Osobní a autentické, hůř se ale prodávají dál.']),
  h2('Jak naming probíhá'),
  para('Dobrý název není záblesk geniality nad kávou, ale výsledek poctivé práce. Náš postup vypadá takhle:'),
  li([{ t: 'Brief. ', strong: true }, 'Vyjasníme si, komu značka mluví, čím se liší a jaký má mít charakter.']),
  li([{ t: 'Generování. ', strong: true }, 'Tvoříme desítky až stovky variant napříč všemi typy názvů. V téhle fázi není špatný nápad.']),
  li([{ t: 'Výběr. ', strong: true }, 'Přes jasná kritéria zúžíme seznam na hrstku nejsilnějších kandidátů.']),
  li([{ t: 'Rešerše. ', strong: true }, 'Ověříme ochranné známky, domény, jazykové konotace a to, jestli jméno už někdo nepoužívá.']),
  li([{ t: 'Test. ', strong: true }, 'Vyslovíme ho nahlas, napíšeme do věty, představíme si ho na obalu i v patičce e-mailu.']),
  h2('Na co si dát pozor'),
  para('Klasická past je zamilovat se do jména, které je už obsazené nebo nejde ochránit. Druhá je jazyk — co zní skvěle česky, může v jiné řeči znamenat nesmysl nebo něco trapného. A do třetice: nevybírejte jméno sami podle vlastního vkusu. Má sloužit zákazníkům, ne potěšit zakladatele.'),
  h2('Závěr'),
  para('Název si s sebou ponesete roky, možná desetiletí. Vyplatí se mu dát čas a udělat ho pořádně — ideálně dřív, než vytisknete první vizitky. Je to levnější než ho měnit později.'),
  para('Rozjíždíte něco nového nebo přemýšlíte o změně jména? Pomůžeme vám najít takové, které vydrží.'),
]

// ─── Dokumenty k zápisu ─────────────────────────────────────────────────
const upserts = [
  {
    _id: 'blog-post-4',
    title: 'Typografie jako nástroj emocí',
    slug: 'typografie-jako-nastroj-emoci',
    category: 'Branding',
    publishedAt: '2026-10-06T09:00:00.000Z',
    description: 'Písmo ve vás vyvolá pocit dřív, než přečtete první slovo. Přečtěte si, jak typografie nese osobnost značky, jak vyvolává emoce a proč výběr písma není kosmetika, ale strategické rozhodnutí.',
    cover: 'typografie-jako-nastroj-emoci.webp',
    coverAlt: 'Tiskařské litery — typografie',
    body: typografieBody,
  },
  {
    _id: 'blog-post-rebranding-kdy-a-jak',
    title: 'Rebranding: kdy je čas a jak probíhá',
    slug: 'rebranding-kdy-a-jak',
    category: 'Branding',
    publishedAt: '2026-10-07T09:00:00.000Z',
    description: 'Jak poznáte, že vaše značka potřebuje rebranding? A jaký je rozdíl mezi refreshem a kompletní změnou? Projděte si signály, celý proces krok za krokem i nejčastější chyby.',
    cover: 'rebranding-kdy-a-jak.jpg',
    coverAlt: 'Neonový nápis Open',
    body: rebrandingBody,
  },
  {
    _id: 'blog-post-jak-vznika-nazev-znacky',
    title: 'Jak vzniká název značky',
    slug: 'jak-vznika-nazev-znacky',
    category: 'Branding',
    publishedAt: '2026-10-08T09:00:00.000Z',
    description: 'Název je první slovo, které o vaší značce někdo vysloví. Co dělá jméno dobrým, jaké typy názvů existují a jak celý naming probíhá — od briefu po rešerši ochranných známek.',
    cover: 'jak-vznika-nazev-znacky.webp',
    coverAlt: 'Barevné post-it lístky s nápady',
    body: namingBody,
  },
]

// jen doplnění cover obrázku (bez zásahu do těla)
const coverOnly = [
  { _id: 'blog-post-1', cover: 'proc-dobry-brand-neni-jen-logo.jpg', alt: 'Ledovec — logo je jen špička' },
  { _id: 'blog-post-proc-potrebujete-branding', cover: 'proc-potrebujete-branding.jpg', alt: 'Šachové figurky — strategie' },
  { _id: 'blog-post-knihy-pro-designery', cover: 'knihy-pro-designery.jpg', alt: 'Knihy v antikvariátu' },
]

async function run() {
  console.log('— Mazání —')
  for (const id of toDelete) {
    await client.delete(id).then(() => console.log('  🗑  ' + id)).catch(e => console.warn('  ⚠ ' + id + ': ' + e.message))
  }

  console.log('\n— Nové / dopsané články —')
  for (const a of upserts) {
    k = 0
    const cover = await upload(a.cover, a.coverAlt)
    await client.createOrReplace({
      _id: a._id, _type: 'blogPost',
      title: a.title, slug: { _type: 'slug', current: a.slug },
      description: a.description, category: a.category, publishedAt: a.publishedAt,
      ...(cover ? { coverImage: cover } : {}),
      body: a.body(), featured: false,
    })
    console.log('  ✅ /blog/' + a.slug + (cover ? ' (+cover)' : ''))
  }

  console.log('\n— Doplnění cover obrázků —')
  for (const c of coverOnly) {
    const cover = await upload(c.cover, c.alt)
    if (cover) { await client.patch(c._id).set({ coverImage: cover }).commit(); console.log('  🖼  ' + c._id) }
  }

  console.log('\n🎉 Hotovo.')
}
run().catch(e => { console.error(e); process.exit(1) })

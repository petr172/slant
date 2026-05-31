// Doplní EN verze (titleEn, descriptionEn, bodyEn) k migrovaným článkům.
// Spuštění:  node scripts/translate-blog-en.mjs
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

let k = 0
const key = () => `e${k++}`
const para = (t) => ({ _type: 'block', _key: key(), style: 'normal', markDefs: [], children: [{ _type: 'span', _key: key(), text: t, marks: [] }] })
const h2   = (t) => ({ _type: 'block', _key: key(), style: 'h2',     markDefs: [], children: [{ _type: 'span', _key: key(), text: t, marks: [] }] })
const book = (title, rest) => ({ _type: 'block', _key: key(), style: 'normal', markDefs: [], children: [
  { _type: 'span', _key: key(), text: title, marks: ['strong'] },
  { _type: 'span', _key: key(), text: rest, marks: [] },
] })
const img = (ref, alt, caption) => ({ _type: 'image', _key: key(), asset: { _type: 'reference', _ref: ref }, alt, caption })

async function main() {
  // ── Logo glossary (reuse existing images) ──────────────────────────────
  const logo = await client.getDocument('blog-post-logo-slovnik')
  const imgs = (logo?.body ?? []).filter(b => b._type === 'image')
  const gridRef = imgs[0]?.asset?._ref
  const secRefs = imgs.slice(1).map(b => b.asset?._ref)

  const sections = [
    ['1. Abstract mark', 'A symbol without typography, also called a logomark. It has no concrete real-world reference — it works more as an emotive, purely visual expression of the brand.', 'Nike, Mitsubishi, Pepsi, National Geographic'],
    ['2. Pictogram', 'Unlike an abstract mark, a pictogram is clearly recognisable. It has a real-world reference and usually points directly to the brand’s name or essence.', 'Apple, Shell, Twitter, Air Jordan'],
    ['3. Letter mark', 'A graphic treatment of the first letter of your brand name can make a great logo — as long as it’s original and recognisable enough. Thanks to its simplicity, a letterform works well even at small sizes and as an icon.', 'Netflix, Facebook, McDonald’s, Motorola'],
    ['4. Wordmark', 'A logotype or wordmark is a graphic treatment of the brand’s full name with no other symbols. Either a bespoke typeface or a professional font fine-tuned to the last detail.', 'Coca-Cola, Vans, Tesla, Lego'],
    ['5. Monogram', 'A lettermark is based on an abbreviation of a longer name. It suits brands that are better known by their initials than by their full name.', 'IBM, NASA, HBO, NY'],
    ['6. Combination mark', 'A combination of a symbol (logomark) and the name (logotype or lettermark). It contains both — so you recognise the brand by the symbol as well as the name.', 'Red Bull, Škoda, Instagram, adidas'],
    ['7. Mascot', 'A mascot is more of a historical solution today — because of its complexity, companies tend to opt for simpler forms. But it still lives on, mainly in food, on packaging and with fast-food chains.', 'Michelin, Pringles, KFC, Monopoly'],
    ['8. Emblem', 'An emblem highlights a brand’s history and tradition. But the crest and its detail run into trouble at small sizes, so it’s often impractical for digital.', 'Starbucks, NFL, Harley-Davidson, Warner Bros.'],
  ]
  const logoBodyEn = [
    para('In the design world we keep bumping into the same thing — everyone talks about the same idea, just with different words. Naming logos is actually easy once you know what you’re looking at. Let’s go through the eight basic types and give them their proper names.'),
    ...(gridRef ? [img(gridRef, 'Overview of eight logo types on well-known brands', 'Eight of the most common logo types on well-known brands')] : []),
    h2('Types of logos'),
    para('A logo is a brand’s most important and most-used visual shorthand. But careful — a logo isn’t a brand. It’s more like its face: it represents the brand and works in harmony with its overall look and behaviour.'),
  ]
  sections.forEach((s, i) => {
    logoBodyEn.push(h2(s[0]))
    logoBodyEn.push(para(s[1]))
    logoBodyEn.push(para(`Examples: ${s[2]}.`))
    if (secRefs[i]) logoBodyEn.push(img(secRefs[i], s[0], s[2]))
  })

  // ── Books for designers ────────────────────────────────────────────────
  const groups = [
    ['Fundamentals & principles', [
      ['The Non-Designer’s Design Book — Robin Williams', '. A perfect start for newcomers and a great refresher for the experienced.'],
      ['Grid Systems in Graphic Design — Josef Müller-Brockmann', '. A handbook on grids — the foundation of every clean layout.'],
      ['The Vignelli Canon — Massimo Vignelli', '. The world and principles of design through the eyes of the famous Italian designer.'],
    ]],
    ['Typography', [
      ['Thinking with Type — Ellen Lupton', '. A typographic bible for anyone who loves type.'],
      ['Eseje o typografii — František Štorm', '. For beginners and pros alike, from the most celebrated Czech type designer.'],
      ['Knihy a typografie — Martin Pecina', '. A relaxed read about the whole process of making books.'],
      ['Helvetica — Lars Müller', '. A book showing how a single typeface changed the modern world.'],
    ]],
    ['Branding, strategy & creativity', [
      ['The Brand Gap — Marty Neumeier', '. On brand-building theory and why strategy and creativity must play together.'],
      ['Pocket Full of Do — Chris Do', '. Advice, tips and the philosophy of the founder of The Futur.'],
      ['Book of Ideas — Radim Malinic', '. Exactly what it promises — ideas from the creative director of London’s Brand Nu.'],
      ['Ogilvy on Advertising — David Ogilvy', '. A classic from the “father of advertising”.'],
      ['Start Your Own F*cking Brand — Maria Erixon', '. The story of building Swedish brand Nudie Jeans, straight from its founder.'],
    ]],
    ['Logos, data & infographics', [
      ['Logo Modernism — Jens Müller & R. Roger Remington', '. 6,000 modernist logos in their purest form.'],
      ['Designing News — Francesco Franchi', '. A look at the future of media and information design.'],
      ['Information Graphics — Julius Wiedemann, Sandra Rendgen', '. A book full of great infographics for data nerds.'],
      ['National Geographic Infographics — Julius Wiedemann', '. The best Nat Geo infographics in one place.'],
      ['AIGA Graphic Design USA — collective', '. The yearbook published by the American Institute of Graphic Arts.'],
    ]],
  ]
  const booksBodyEn = [
    para('At our studio we started a book club for everyone who loves design — and a fine pile of tips came up. We picked books that changed how we see the craft, or that helped us directly in our work. You might own some already; others may inspire you.'),
    para('No shop links this time — where you buy is entirely up to you. Let’s dive in; we’ve sorted the tips into a few areas.'),
  ]
  for (const [h, list] of groups) {
    booksBodyEn.push(h2(h))
    for (const [t, r] of list) booksBodyEn.push(book(t, r))
  }
  booksBodyEn.push(h2('A tip for Affinity users'))
  booksBodyEn.push(book('Workbook Designer / Photo / Publisher — collective', '. A great handbook not just for the software itself, but for working with graphics in the digital world.'))
  booksBodyEn.push(h2('Bonus'))
  booksBodyEn.push(para('For lovers of beautiful typesetting — and as a source of gift ideas for a designer — be sure to check out standardsmanual.com.'))
  booksBodyEn.push(para('That’s all from us for now. Long live design!'))

  // ── 6 reasons why you need branding ─────────────────────────────────────
  const brandBodyEn = [
    para('Can you confidently answer three basic questions? Who are you? What do you do? Why does it matter? If you hesitate on any of them, it’s high time to work on your brand. Here are six reasons why branding isn’t a luxury, but a foundation.'),
    h2('1. You give your brand solid foundations'),
    para('Branding helps you define your brand’s core attributes and mission. Sounds like a cliché? Try answering for yourself:'),
    para('Who are you? We’re Slant, a branding studio. What do you do? We help companies and entrepreneurs build their brands. Why does it matter? Because we make their branding investment pay off and add value to their product or service.'),
    para('Can you answer just as convincingly?'),
    h2('2. You build trust in your brand'),
    para('A stronger brand means higher trust — and trust shortens the customer’s decision to buy or work with you. The trust you build also strengthens your market position and gives you an edge over the competition.'),
    h2('3. You stand out and become memorable'),
    para('Through the right positioning, name, visuals — anything that makes sense and fits your brand strategy — you set yourself apart. You become recognisable and, above all, memorable.'),
    h2('4. You unify your visual style and spark emotion'),
    para('A brand manual unifies your visual style, so you come across as professional. Customers understand you better and reward you with greater trust.'),
    para('A communication strategy then makes things clear: which campaign to back, which partner to work with, which channels to use and what content your customers would like to see. That’s how you build a firm market position.'),
    h2('5. You increase your brand’s value'),
    para('The stronger your brand, the higher the margin you can afford. You stay competitive and gradually build a base of loyal customers.'),
    h2('6. You strengthen company culture'),
    para('Everyone wants to work for a lovebrand. You’ll attract better people in the field who are proud to work for you — and your HR won’t keep up with the flood of new applicants.'),
    h2('Does it make sense?'),
    para('So how’s your brand doing? If you’re just starting out, we hope we’ve shown what branding brings and how important it is for you. If you’re already in business — are you sure you’re caring for your brand the right way?'),
    para('It’s never too late for a change. Branding is best left to the experts; you don’t drill your own teeth either. And trust us, the investment in building a brand pays off soon. A business that delights your customers will delight you, too.'),
    para('Need advice or have questions? We’ll be glad to answer them.'),
  ]

  console.log('Patchuji EN verze…')
  await client.patch('blog-post-logo-slovnik').set({
    titleEn: 'Logo glossary',
    descriptionEn: 'We put together a simple logo glossary for everyone who’s unsure what to call which symbol. Walk through the 8 basic logo types with us.',
    bodyEn: logoBodyEn,
  }).commit()
  await client.patch('blog-post-knihy-pro-designery').set({
    titleEn: 'Books for designers',
    descriptionEn: 'A few great book tips that changed how we see design. You might own some already; others may inspire you. Browse our reading list for designers.',
    bodyEn: booksBodyEn,
  }).commit()
  await client.patch('blog-post-proc-potrebujete-branding').set({
    titleEn: '6 reasons why you need branding',
    descriptionEn: 'Can you confidently answer three questions? Who are you? What do you do? Why does it matter? Read 6 reasons why you need branding.',
    bodyEn: brandBodyEn,
  }).commit()
  console.log('✅ EN verze doplněny.')
}

main().catch(e => { console.error(e); process.exit(1) })

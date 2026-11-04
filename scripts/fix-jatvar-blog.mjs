/**
 * Oprava faktické chyby v blogu: Jatvar je rodinné kamenictví (od 1965),
 * ne „moderní řeznictví“ s obaly v chladicím pultu. Přepisuje dotčené
 * odstavce (CS + EN) v publikovaných článcích i v jejich draftech.
 *
 * Použití: node scripts/fix-jatvar-blog.mjs
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

// spans: [text, marks?] — první „Jatvar“ v článku o typografii je tučně
const S = (...parts) => parts.map(([text, marks = []], i) => ({ _type: 'span', _key: `s${i}`, text, marks }))

const fixes = {
  'blog-post-4': {
    body: {
      '3qmkcbpf4g4l': S(['Jatvar', ['strong']], [' (2025) je identita pro rodinné kamenictví s tradicí od roku 1965. Takové zadání svádí ke zdobnému, „náhrobnímu“ písmu, jenže to by značku zavřelo do minulosti. Hledali jsme proto výraz, který drží řemeslnou preciznost a zároveň působí současně — a který obstojí všude, kde Jatvar potkávají zákazníci: ve vzorníku kamenů, na polepu vozů i na webu.']),
    },
    bodyEn: {
      en53: S(['Jatvar', ['strong']], [' (2025) is an identity for a family stonemason with a tradition dating back to 1965. A brief like that invites an ornate, “headstone” lettering, but that would lock the brand in the past. So we looked for an expression that keeps the craft’s precision and still feels current — and that holds up everywhere customers meet Jatvar: in the stone sample book, on the vehicle livery and on the website.']),
    },
  },
  'blog-post-brandmanual-nutnost-nebo-prezitek': {
    body: {
      '9pa5whck8oyz': S(['U značek, jejichž hlavním nosičem je obal, přidáváme ještě jednu vrstvu: pravidla pro celou obalovou řadu včetně materiálů. U Konopného Táty je etiketa hlavní plochou značky, takže manuál musí řešit nejen logo na etiketě, ale především to, jak se řada chová, když přibude nový produkt.']),
    },
    bodyEn: {
      kkacg6sx11gl: S(['For brands whose main carrier is packaging, we add one more layer: rules for the entire packaging range, materials included. At Konopný Táta the label is the main surface of the brand, so the guidelines have to cover not just the logo on the label but above all how the range behaves when a new product joins it.']),
    },
  },
  'blog-post-co-je-branding-proc-ho-potrebuji': {
    body: {
      o1qv5e9p50ft: S(['Aplikace. Aplikace jsou konkrétní nosiče, na kterých značka žije: web, obaly, tiskoviny, prodejna, vozový park, oblečení, prezentace a nabídky. Značka se rozhoduje právě tady, protože zákazník nikdy nevidí brand manuál, vidí obal na regále nebo auto na silnici. U přírodní kosmetiky Konopný Táta z roku 2025 byla klíčovou aplikací obalová linie, u rodinného kamenictví Jatvar vzorník, polep vozů a web, u firmy Autojeřáby Malina z roku 2024 web a provozní grafika, protože poptávka v těžkém průmyslu začíná online.']),
    },
    bodyEn: {
      en24: S(['Applications. Applications are the specific carriers a brand lives on: the website, packaging, print, the store, vehicles, workwear, presentations, and proposals. This is where the brand is decided, because a customer never sees your brand guidelines, they see the pack on the shelf or the van on the road. For the natural cosmetics brand Konopný Táta in 2025, packaging was the key application; for the family stonemason Jatvar it was the sample book, vehicle livery and website; and for Autojeřáby Malina (a family run mobile crane company) in 2024 it was the website and operational graphics, because in heavy industry the inquiry starts online.']),
    },
  },
  'blog-post-proc-brandingova-agentura': {
    body: {
      wnq6zogr7815: S(['Obaly přišly s projektem Konopný Táta z roku 2025 — přírodní kosmetikou, u které jsme vedle brandingu řešili i materiál a potisk etiket celé řady. Obal je nejtvrdší zkouška identity, protože zákazník se rozhoduje během několika vteřin a má ji přitom v ruce.']),
    },
    bodyEn: {
      enb22: S(['Packaging came with Konopný Táta in 2025 — natural cosmetics, where we worked on the material and the printing of the labels across the whole range alongside the branding. Packaging is the hardest test an identity can face, because the customer decides in a few seconds and is holding the thing while they do it.']),
    },
  },
  // ── jen v draftech (nepublikované články) ──
  'blog-post-1': {
    body: {
      '3a9uzceas03v': S(['Tam, kde se zákazník se značkou potkává nejdřív na obalu, se identita rozhoduje právě na obalu. U kosmetiky Konopný Táta (2025) jsme identitu dotahovali společně se systémem etiket pro celou řadu. Obal má jiná omezení než web: materiál, počet barev a čitelnost na malé ploše ovlivní i to, jak vypadá zbytek systému.']),
    },
    bodyEn: {
      en20: S(['Where customers meet the brand on the shelf first, the identity is decided on the packaging. With the cosmetics brand Konopný Táta in 2025, we finished the identity alongside a label system for the whole range. Packaging works under different constraints than a website: the material, the number of printable colors, and legibility at small sizes all shape how the rest of the system looks.']),
    },
  },
  'blog-post-logo-slovnik': {
    body: {
      x160: S(['Řemeslná poloha byla tématem i u Jatvaru, rodinného kamenictví s tradicí od roku 1965, pro které jsme dělali identitu s monogramem „J“. Čím víc značka staví na řemesle, tím důležitější je, aby znak vydržel i ve vzorníku, na polepu vozů a v tisku, ne jen na obrazovce.']),
    },
    bodyEn: {
      en160: S(['That craft angle was also the theme for Jatvar, a family stonemason with a tradition dating back to 1965, where we created an identity built on a “J” monogram. The more a brand leans on craft, the more important it is that the mark holds up in a sample book, on vehicle livery and in print, not just on a screen.']),
    },
  },
  'blog-post-proc-potrebujete-branding': {
    body: {
      b08: S(['Nejzřetelnější je to tam, kde značka nese řemeslné pozicování. Pro rodinné kamenictví Jatvar (2025) jsme stavěli identitu, která jeho preciznost ukáže na vzorníku, polepu vozů i webu. Značka je v takovém případě argument, proč zákazník zvolí poctivou řemeslnou práci místo anonymní levnější nabídky.']),
    },
    bodyEn: {
      en08: S(['It is clearest where the brand carries a craft positioning. For the family stonemason Jatvar (2025) we built an identity that shows its precision on the sample book, the vehicle livery and the website. In that case, the brand is the argument for choosing honest craftsmanship over an anonymous cheaper offer.']),
    },
  },
}

for (const [id, fields] of Object.entries(fixes)) {
  for (const docId of [id, `drafts.${id}`]) {
    const doc = await client.getDocument(docId)
    if (!doc) continue
    const set = {}
    for (const [field, blocks] of Object.entries(fields)) {
      for (const [key, children] of Object.entries(blocks)) {
        if ((doc[field] ?? []).some((b) => b._key === key)) {
          set[`${field}[_key=="${key}"].children`] = children
          set[`${field}[_key=="${key}"].markDefs`] = []
        }
      }
    }
    if (Object.keys(set).length) {
      await client.patch(docId).set(set).commit()
      console.log(`✏️  ${docId}: opraveno ${Object.keys(set).length / 2} odstavců`)
    } else {
      console.log(`·  ${docId}: odstavce nenalezeny (draft s jiným obsahem?)`)
    }
  }
}

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

const block = (text) => ({
  _type: 'block', _key: Math.random().toString(36).slice(2),
  style: 'normal', markDefs: [],
  children: [{ _type: 'span', _key: 'a', text, marks: [] }],
})

const h2 = (text) => ({
  _type: 'block', _key: Math.random().toString(36).slice(2),
  style: 'h2', markDefs: [],
  children: [{ _type: 'span', _key: 'a', text, marks: [] }],
})

const doc = {
  _type: 'legalPage',
  _id:   'legalPage-vop',
  title: 'Všeobecné obchodní podmínky',
  titleEn: 'Terms and Conditions',
  slug:  { _type: 'slug', current: 'vseobecne-obchodni-podminky' },
  body: [
    h2('1. Úvodní ustanovení'),
    block('Tyto Všeobecné obchodní podmínky (dále jen „VOP") upravují vztahy mezi společností Slant s.r.o., IČO: 092 50 239, se sídlem Zborovská 940/2a, 616 00 Brno (dále jen „Poskytovatel") a klientem (dále jen „Klient").'),
    h2('2. Předmět smlouvy'),
    block('Poskytovatel se zavazuje poskytovat Klientovi služby v oblasti brandingu, UX/UI designu, vizuální identity a digitálního designu dle individuálně dohodnuté specifikace.'),
    h2('3. Cena a platební podmínky'),
    block('Cena za poskytnuté služby je stanovena individuálně na základě rozsahu projektu a je specifikována v projektové smlouvě nebo nabídce. Faktury jsou splatné do 14 dnů od data vystavení, pokud není dohodnuto jinak.'),
    h2('4. Autorská práva'),
    block('Veškerá autorská práva k vytvořeným dílům přecházejí na Klienta po úplném zaplacení sjednané ceny. Do té doby si Poskytovatel vyhrazuje veškerá práva k vytvořeným materiálům.'),
    h2('5. Mlčenlivost'),
    block('Obě strany se zavazují zachovávat mlčenlivost o důvěrných informacích získaných v průběhu spolupráce.'),
    h2('6. Odpovědnost za škodu'),
    block('Poskytovatel neodpovídá za škody vzniklé v důsledku nesprávného použití dodaných materiálů Klientem nebo třetí stranou.'),
    h2('7. Závěrečná ustanovení'),
    block('Tyto VOP nabývají účinnosti dnem jejich zveřejnění. Poskytovatel si vyhrazuje právo VOP měnit. Aktuální znění VOP je vždy dostupné na webových stránkách Poskytovatele.'),
    block('V Brně, 1. 1. 2024'),
  ],
  bodyEn: [
    h2('1. Introduction'),
    block('These Terms and Conditions govern the relationship between Slant s.r.o., ID: 092 50 239, registered at Zborovská 940/2a, 616 00 Brno, Czech Republic (the "Provider") and the client (the "Client").'),
    h2('2. Scope of Services'),
    block('The Provider agrees to deliver services in the areas of branding, UX/UI design, visual identity, and digital design as individually agreed upon.'),
    h2('3. Pricing and Payment'),
    block('Pricing is determined individually based on project scope and is specified in the project agreement or proposal. Invoices are due within 14 days of issuance unless otherwise agreed.'),
    h2('4. Intellectual Property'),
    block('All intellectual property rights transfer to the Client upon full payment of the agreed fee. Until then, the Provider retains all rights to the created materials.'),
    h2('5. Confidentiality'),
    block('Both parties agree to maintain confidentiality regarding sensitive information obtained during the collaboration.'),
    h2('6. Liability'),
    block('The Provider is not liable for damages arising from improper use of delivered materials by the Client or any third party.'),
    h2('7. Final Provisions'),
    block('These Terms and Conditions take effect upon publication. The Provider reserves the right to amend them. The current version is always available on the Provider\'s website.'),
    block('Brno, January 1, 2024'),
  ],
}

console.log('🌱  Creating legal page...')
const result = await client.createOrReplace(doc)
console.log('✅ ', result.title)

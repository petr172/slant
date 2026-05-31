// Překlopí hardcoded Jatvar obsah do Sanity (cover, hero/card video, brief,
// výsledek, galerie). Spuštění: node scripts/migrate-jatvar.mjs
import { createClient } from '@sanity/client'
import { readFileSync, createReadStream } from 'node:fs'
import { resolve } from 'node:path'

const env = Object.fromEntries(
  readFileSync(resolve('.env'), 'utf8').split('\n')
    .filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
)
const token = process.env.SANITY_WRITE_TOKEN || env.SANITY_WRITE_TOKEN
if (!token) { console.error('Chybí SANITY_WRITE_TOKEN'); process.exit(1) }
const client = createClient({ projectId: 'wgpoci6t', dataset: 'production', apiVersion: '2024-01-01', token, useCdn: false })

const PUB = 'public/work/jatvar'
let k = 0
const key = () => `g${k++}`
const imgRef = (ref) => ({ _type: 'image', asset: { _type: 'reference', _ref: ref } })

async function up(file) {
  const a = await client.assets.upload('image', createReadStream(resolve(PUB, file)), { filename: file })
  console.log(`  ✓ ${file} → ${a._id}`)
  return a._id
}

async function main() {
  console.log('Nahrávám obrázky do Sanity…')
  const cover    = await up('hero-poster.jpg')
  const david    = await up('david.webp')
  const kuchyne  = await up('kuchyne.webp')
  const van      = await up('van.webp')
  const koupelna = await up('koupelna.webp')
  const wordmark = await up('wordmark.webp')

  const gallery = [
    { _type: 'galleryItem', _key: key(), image: imgRef(david),    alt: 'Jatvar — vizuální identita na tričku' },
    { _type: 'galleryItem', _key: key(), videoUrl: '/work/jatvar/krabicka.mp4', alt: 'Jatvar — obalový vzorník' },
    { _type: 'galleryItem', _key: key(), image: imgRef(kuchyne),  alt: 'Jatvar — tiskovina Kámen v kuchyni' },
    { _type: 'galleryItem', _key: key(), videoUrl: '/work/jatvar/web.mp4', alt: 'Jatvar — webová prezentace' },
    { _type: 'galleryItem', _key: key(), image: imgRef(van),      alt: 'Jatvar — polep vozů' },
    { _type: 'galleryItem', _key: key(), image: imgRef(koupelna), alt: 'Jatvar — tiskovina' },
    { _type: 'galleryItem', _key: key(), image: imgRef(wordmark), alt: 'Jatvar — logo' },
  ]

  const fields = {
    client: 'Jatvar',
    coverImage: { ...imgRef(cover), alt: 'Jatvar — vizuální identita' },
    heroVideo: '/work/jatvar-hero.mp4',
    cardVideo: '/work/jatvar-hero.mp4',
    brief: 'Jatvar je rodinné kamenictví s řemeslem od roku 1965. Chyběla mu ale značka, která by jeho preciznost ukázala i navenek — od loga přes vzorníky až po polep vozů a web.',
    vysledek: 'Postavili jsme uzavřenou identitu na sytě zelené a kameni. Monogram „J“, systém tiskovin, obalový vzorník i responzivní web dnes Jatvaru dávají jednotný, sebevědomý výraz napříč všemi dotykovými body.',
    briefEn: 'Jatvar is a family stone workshop with craft dating back to 1965. What it lacked was a brand that carried that precision outward — from the logo to sample boxes, vehicle livery and the website.',
    vysledekEn: 'We built a cohesive identity rooted in deep green and stone. The “J” monogram, a print system, packaging sampler and a responsive website now give Jatvar one confident voice across every touchpoint.',
    gallery,
  }

  // Patchni published i případný draft, ať se to projeví všude
  const ids = ['caseStudy-jatvar', 'drafts.caseStudy-jatvar']
  for (const id of ids) {
    const exists = await client.getDocument(id).catch(() => null)
    if (!exists) continue
    await client.patch(id).set(fields).commit()
    console.log(`  ✓ patched ${id}`)
  }
  console.log('✅ Hotovo. Nezapomeň článek/projekt v Studiu Publishnout.')
}

main().catch(e => { console.error(e); process.exit(1) })

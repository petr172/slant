/**
 * Migrace galerie: ploché bloky (galleryItem/galleryLottie se `size`) → řádkový
 * model (galleryRow s presetem layoutu + mediaImage/mediaLottie uvnitř).
 *
 * Spouštěj přes:  MIGRATE_SLUG=jatvar DRY=1 npx sanity exec scripts/migrate-gallery-rows.mjs --with-user-token
 *   DRY=1 → jen vypíše, co by udělal (nic nezapisuje)
 *   DRY=0 (nebo nenastaveno) → zapíše změny (published i draft verzi)
 *   MIGRATE_SLUG=all → všechny case studies
 *
 * Idempotentní: existující galleryRow / galleryText bloky nechá být.
 */
import { getCliClient } from 'sanity/cli'
import crypto from 'node:crypto'

const client = getCliClient({ apiVersion: '2024-01-01' })
const DRY = process.env.DRY !== '0'
const SLUG = process.env.MIGRATE_SLUG || 'jatvar'

const key = () => crypto.randomBytes(6).toString('hex')

const isEmpty = (g) => {
  if (g._type === 'galleryLottie') return !g.file && !g.url
  if (g._type === 'galleryItem') return !(g.image && g.image.asset) && !g.videoUrl
  return false
}

const toMediaItem = (g) => {
  if (g._type === 'galleryLottie') {
    return {
      _type: 'mediaLottie', _key: key(),
      ...(g.file ? { file: g.file } : {}),
      ...(g.url ? { url: g.url } : {}),
      ...(g.ratio ? { ratio: g.ratio } : {}),
      ...(g.loop !== undefined ? { loop: g.loop } : {}),
      ...(g.autoplay !== undefined ? { autoplay: g.autoplay } : {}),
      ...(g.bg ? { bg: g.bg } : {}),
      ...(g.alt ? { alt: g.alt } : {}),
    }
  }
  return {
    _type: 'mediaImage', _key: key(),
    ...(g.image ? { image: g.image } : {}),
    ...(g.videoUrl ? { videoUrl: g.videoUrl } : {}),
    ...(g.alt ? { alt: g.alt } : {}),
    ...(g.caption ? { caption: g.caption } : {}),
  }
}

const migrate = (gallery) => {
  const out = []
  let half = []
  const flush = () => {
    while (half.length) {
      if (half.length >= 2) { out.push({ _type: 'galleryRow', _key: key(), layout: 'two', items: [half[0], half[1]] }); half = half.slice(2) }
      else { out.push({ _type: 'galleryRow', _key: key(), layout: 'single', items: [half[0]] }); half = half.slice(1) }
    }
  }
  for (const g of gallery || []) {
    if (g._type === 'galleryRow' || g._type === 'galleryText') { flush(); out.push(g); continue }
    if (isEmpty(g)) continue // zahoď prázdné bloky
    const size = ['full', 'wide', 'half'].includes(g.size) ? g.size : 'wide'
    const item = toMediaItem(g)
    if (size === 'half') half.push(item)
    else { flush(); out.push({ _type: 'galleryRow', _key: key(), layout: size === 'full' ? 'full' : 'single', items: [item] }) }
  }
  flush()
  return out
}

const summarize = (gallery) => (gallery || []).map((g) => {
  if (g._type === 'galleryRow') return `řádek:${g.layout}(${(g.items || []).length})`
  if (g._type === 'galleryText') return 'text'
  return `${g._type.replace('gallery', '').toLowerCase()}:${g.size || '-'}`
}).join('  ')

const run = async () => {
  const filter = SLUG === 'all' ? '_type == "caseStudy"' : '_type == "caseStudy" && slug.current == $slug'
  const pubIds = await client.fetch(`*[${filter}]._id`, { slug: SLUG })
  // zahrň i draft verze
  const allIds = new Set()
  for (const id of pubIds) { allIds.add(id); allIds.add(`drafts.${id.replace(/^drafts\./, '')}`) }

  let touched = 0
  for (const id of allIds) {
    const doc = await client.getDocument(id)
    if (!doc) continue
    const before = doc.gallery || []
    if (!before.length) continue
    const needs = before.some((g) => g._type === 'galleryItem' || g._type === 'galleryLottie')
    if (!needs) { console.log(`• ${id} — už řádkové, přeskakuji`); continue }
    const after = migrate(before)
    console.log(`\n■ ${id}`)
    console.log(`   PŘED:  ${summarize(before)}`)
    console.log(`   PO:    ${summarize(after)}`)
    if (!DRY) {
      await client.patch(id).set({ gallery: after }).commit()
      console.log('   ✔ zapsáno')
    }
    touched++
  }
  console.log(`\n${DRY ? '[DRY RUN] ' : ''}Hotovo — dotčeno dokumentů: ${touched}`)
}

run().catch((e) => { console.error(e); process.exit(1) })

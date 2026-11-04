// Hero chip hover náhledy: max 3 malé čtverce na kategorii.
// Obrázky se při buildu stáhnou ze Sanity CDN a servírují z naší domény
// (/chip-preview/<file>.webp, viz src/pages/chip-preview/[file].ts) —
// WebGL potřebuje same-origin/CORS obrázky a Sanity CDN CORS hlídá podle originu.
import { client } from './sanity'
import { urlFor } from './imageUrl'
import { ALL_CASE_STUDIES_QUERY, SITE_SETTINGS_QUERY } from './queries'

export const CHIP_PREVIEW_MAX = 3
const SIZE = 240                         // px — vykresluje se ~96 CSS px, 2× pro retinu

export type ChipPreview = { file: string; remote: string }

const hash = (s: string) => {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0
  return h.toString(36)
}

const toPreview = (img: any): ChipPreview | null => {
  if (!img?.asset) return null
  const remote = urlFor(img).width(SIZE).height(SIZE).fit('crop').format('webp').quality(80).url()
  return { file: `${hash(remote)}.webp`, remote }
}

export function buildChipPreviews(siteSettings: any, allProjects: any[]): Record<string, ChipPreview[]> {
  const out: Record<string, ChipPreview[]> = {}
  const add = (tag: string, img: any) => {
    const p = toPreview(img)
    if (!p) return
    const list = (out[tag] ??= [])
    if (list.length < CHIP_PREVIEW_MAX && !list.some((x) => x.file === p.file)) list.push(p)
  }

  // 1) Kurátorská kolekce ze Sanity (siteSettings.chipPreviews)
  const curated = new Set<string>()
  for (const cp of (siteSettings?.chipPreviews ?? []) as any[]) {
    if (!cp?.category || !cp.images?.length) continue
    curated.add(cp.category)
    for (const im of cp.images) add(cp.category, im)
  }

  // 2) Fallback: covery projektů dané kategorie, pak obrázky z jejich galerií
  for (const cs of allProjects ?? []) for (const svc of (cs.services ?? []))
    if (!curated.has(svc)) add(svc, cs.coverImage)
  for (const cs of allProjects ?? []) for (const svc of (cs.services ?? []))
    if (!curated.has(svc)) for (const im of (cs.previewImages ?? [])) add(svc, im)

  return out
}

export async function getChipPreviews() {
  const [siteSettings, allProjects] = await Promise.all([
    client.fetch(SITE_SETTINGS_QUERY),
    client.fetch(ALL_CASE_STUDIES_QUERY),
  ])
  return buildChipPreviews(siteSettings, allProjects)
}

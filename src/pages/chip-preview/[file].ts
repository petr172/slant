// Statické kopie náhledů pro hero chipy (stejná doména → použitelné ve WebGL).
// Při buildu se vygeneruje /chip-preview/<file>.webp pro každý náhled.
import type { APIRoute, GetStaticPaths } from 'astro'
import { getChipPreviews } from '../../lib/chipPreviews'

export const prerender = true

export const getStaticPaths: GetStaticPaths = async () => {
  const byTag = await getChipPreviews()
  const seen = new Map<string, string>()
  for (const list of Object.values(byTag)) for (const p of list) seen.set(p.file, p.remote)
  return [...seen].map(([file, remote]) => ({ params: { file }, props: { remote } }))
}

export const GET: APIRoute = async ({ props }) => {
  const res = await fetch(props.remote as string)
  if (!res.ok) return new Response(null, { status: 404 })
  return new Response(await res.arrayBuffer(), {
    headers: { 'Content-Type': 'image/webp' },
  })
}

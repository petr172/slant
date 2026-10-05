import type { APIRoute } from 'astro'

// On-demand — proxy pro Lottie soubory (cdn.sanity.io nevrací CORS hlavičky,
// takže je servírujeme same-origin). Allowlist hostů brání otevřenému proxy.
export const prerender = false

const ALLOW = [
  /^https:\/\/cdn\.sanity\.io\/files\//,
  /^https:\/\/[a-z0-9-]+\.lottiefiles\.com\//,
  /^https:\/\/lottie\.host\//,
]

export const GET: APIRoute = async ({ url }) => {
  const u = url.searchParams.get('u') || ''
  if (!ALLOW.some((re) => re.test(u))) {
    return new Response('Forbidden', { status: 403 })
  }
  try {
    const upstream = await fetch(u)
    if (!upstream.ok) return new Response('Upstream error', { status: 502 })
    const ct = upstream.headers.get('content-type')
      || (u.endsWith('.lottie') ? 'application/zip' : 'application/json')
    return new Response(upstream.body, {
      status: 200,
      headers: {
        'Content-Type': ct,
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch {
    return new Response('Fetch failed', { status: 502 })
  }
}

import { createClient } from '@sanity/client'

// Sanity project ID i dataset jsou veřejné (vidět v každé CDN URL) → bezpečný
// fallback, aby build nezávisel na env proměnné v CI prostředí (Cloudflare).
const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID || 'wgpoci6t'
const dataset   = import.meta.env.PUBLIC_SANITY_DATASET || 'production'

export const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  useCdn: true,
})

export const previewClient = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  useCdn: false,
  stega: {
    enabled: true,
    studioUrl: 'http://localhost:3333',
  },
})

// Vrátí správný klient podle kontextu
export function getClient(preview = false) {
  return preview ? previewClient : client
}

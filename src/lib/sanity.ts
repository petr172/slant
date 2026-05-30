import { createClient } from '@sanity/client'

const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID
const dataset   = import.meta.env.PUBLIC_SANITY_DATASET ?? 'production'

if (!projectId) {
  throw new Error('PUBLIC_SANITY_PROJECT_ID chybí v .env — zkopíruj .env.example a doplň hodnoty.')
}

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

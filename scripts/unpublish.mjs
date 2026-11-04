/**
 * Unpublish dokumentu v Sanity — obsah zůstane jako draft ve Studiu,
 * z webu (published perspektiva) zmizí. Zpět: ve Studiu „Publish".
 * Použití: node scripts/unpublish.mjs <documentId>
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

const id = process.argv[2]
if (!id || id.startsWith('drafts.')) {
  console.error('Použití: node scripts/unpublish.mjs <publishedDocumentId>')
  process.exit(1)
}

const published = await client.getDocument(id)
if (!published) {
  console.error(`Publikovaný dokument ${id} neexistuje.`)
  process.exit(1)
}

const draftId = `drafts.${id}`
const existingDraft = await client.getDocument(draftId)

// Existující draft (rozpracované změny) nepřepisujeme — jen smažeme publikovanou verzi
const tx = client.transaction()
if (!existingDraft) {
  const { _rev, _updatedAt, _createdAt, ...rest } = published
  tx.create({ ...rest, _id: draftId })
}
tx.delete(id)
await tx.commit()

console.log(`✅ ${published.title ?? id}: unpublished${existingDraft ? ' (ponechán existující draft)' : ', obsah uložen jako draft'}`)

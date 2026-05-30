import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { presentationTool } from 'sanity/presentation'
import { schemaTypes } from './schemas'

const projectId = 'wgpoci6t'
const dataset = 'production'

const PREVIEW_URL =
  typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? 'https://slant.cz'
    : 'http://localhost:4321'

export default defineConfig({
  name: 'slant-studio',
  title: 'Slant Studio',
  projectId,
  dataset,

  plugins: [
    // ─── Desk structure — přehledná navigace ────────────────────────────
    structureTool({
      structure: (S) =>
        S.list()
          .title('Slant Studio')
          .items([
            S.listItem()
              .title('Case Studies')
              .icon(() => '🗂')
              .schemaType('caseStudy')
              .child(
                S.documentList()
                  .title('Case Studies')
                  .filter('_type == "caseStudy"')
                  .defaultOrdering([
                    { field: 'order', direction: 'asc' },
                    { field: 'year',  direction: 'desc' },
                  ])
              ),

            S.divider(),

            S.listItem()
              .title('Site Settings')
              .icon(() => '⚙️')
              .id('siteSettings')
              .child(
                S.document()
                  .schemaType('siteSettings')
                  .documentId('siteSettings')
              ),

            S.divider(),

            S.listItem()
              .title('Homepage featured')
              .icon(() => '⭐')
              .schemaType('caseStudy')
              .child(
                S.documentList()
                  .title('Zobrazené na homepage')
                  .filter('_type == "caseStudy" && featured == true')
                  .defaultOrdering([{ field: 'order', direction: 'asc' }])
              ),
          ]),
    }),

    // ─── Presentation — live preview v iframe ────────────────────────────
    presentationTool({
      name: 'preview',
      title: 'Live preview',
      previewUrl: {
        origin: PREVIEW_URL,
        preview: '/',
      },
    }),

    // ─── Vision — GROQ playground ────────────────────────────────────────
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
})

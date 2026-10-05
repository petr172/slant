import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { presentationTool, defineLocations } from 'sanity/presentation'
import { schemaTypes } from './schemas'

const projectId = 'wgpoci6t'
const dataset = 'production'

// Nasazený web (má na sobě běžící @sanity/visual-editing comlink).
// Po DNS cutoveru na Cloudflare změnit na 'https://slant.cz'.
const PREVIEW_URL =
  typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? 'https://slant-4od.pages.dev'
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
              .title('Blog')
              .icon(() => '✍️')
              .schemaType('blogPost')
              .child(
                S.documentList()
                  .title('Blog posts')
                  .filter('_type == "blogPost"')
                  .defaultOrdering([{ field: 'publishedAt', direction: 'desc' }])
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
      // Z dokumentu → živá URL a zpět (panel „Documents on this page")
      resolve: {
        locations: {
          caseStudy: defineLocations({
            select: { title: 'title', slug: 'slug.current' },
            resolve: (doc) => ({
              locations: [
                { title: doc?.title || 'Projekt', href: `/work/${doc?.slug}` },
                { title: 'Všechny práce', href: '/work' },
              ],
            }),
          }),
          blogPost: defineLocations({
            select: { title: 'title', slug: 'slug.current' },
            resolve: (doc) => ({
              locations: [
                { title: doc?.title || 'Článek', href: `/blog/${doc?.slug}` },
                { title: 'Blog', href: '/blog' },
              ],
            }),
          }),
          siteSettings: defineLocations({
            select: { title: 'title' },
            resolve: () => ({ locations: [{ title: 'Domů', href: '/' }] }),
          }),
        },
      },
    }),

    // ─── Vision — GROQ playground ────────────────────────────────────────
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
})

import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './schemas'

// TODO: Nahraď 'your-project-id' svým Sanity project ID
// Najdeš ho na: https://sanity.io/manage
const projectId = 'wgpoci6t'
const dataset = 'production'

export default defineConfig({
  name: 'slant-studio',
  title: 'Slant Studio',
  projectId,
  dataset,
  plugins: [
    structureTool(),
    visionTool(), // GROQ playground pro testování dotazů
  ],
  schema: {
    types: schemaTypes,
  },
})

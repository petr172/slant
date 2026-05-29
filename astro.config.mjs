import { defineConfig } from 'astro/config'

// https://astro.build/config
export default defineConfig({
  // Změň na svoji doménu
  site: 'https://slant.cz',
  // Výstup: static = čisté statické stránky, ideální pro Cloudflare Pages
  output: 'static',
})

import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'
import compress from 'astro-compress'
import cloudflare from '@astrojs/cloudflare'

export default defineConfig({
  site: 'https://slant.cz',
  output: 'static',
  adapter: cloudflare({ imageService: 'passthrough' }),

  // Prefetch všech interních odkazů při hover
  prefetch: {
    prefetchAll: false,
    defaultStrategy: 'hover',
  },

  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'cs',
        locales: { cs: 'cs-CZ', en: 'en-US' },
      },
    }),
    compress({
      CSS: true,
      HTML: true,
      JavaScript: true,
      Image: false, // Sanity CDN řeší optimalizaci obrázků
      SVG: true,
    }),
  ],

  i18n: {
    defaultLocale: 'cs',
    locales: ['cs', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },

  image: {
    remotePatterns: [{ protocol: 'https', hostname: 'cdn.sanity.io' }],
  },

  vite: {
    plugins: [tailwindcss()],
    build: {
      // Rozděl velké vendor chunky
      rollupOptions: {
        output: {
          manualChunks: {
            gsap: ['gsap'],
          },
        },
      },
    },
  },
})
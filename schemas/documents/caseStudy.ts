import { defineField, defineType } from 'sanity'

const SERVICES = [
  'Branding',
  'Webdesign',
  'Obalový design',
  'Grafický design',
  'Animace',
  'Naming',
]

export const caseStudy = defineType({
  name: 'caseStudy',
  title: 'Case Study',
  type: 'document',

  groups: [
    { name: 'identity', title: '📋 Projekt' },
    { name: 'media',    title: '🖼 Média' },
    { name: 'content',  title: '✍️ Obsah' },
    { name: 'translations', title: '🌐 English' },
    { name: 'seo',      title: '🔍 SEO' },
  ],

  fields: [
    // ─── PROJEKT ───────────────────────────────────────────────────────────────
    defineField({
      name: 'title',
      title: 'Název projektu',
      type: 'string',
      group: 'identity',
      validation: (r) => r.required().min(2).max(80),
    }),
    defineField({
      name: 'slug',
      title: 'URL slug',
      type: 'slug',
      group: 'identity',
      options: { source: 'title', maxLength: 96 },
      validation: (r) => r.required(),
      description: 'Generuje se automaticky z názvu — nebo uprav ručně',
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      group: 'identity',
      description: 'Podtitulek pod názvem — jedna výstižná věta',
      validation: (r) => r.max(120),
    }),
    defineField({
      name: 'client',
      title: 'Klient',
      type: 'string',
      group: 'identity',
    }),
    defineField({
      name: 'year',
      title: 'Rok',
      type: 'number',
      group: 'identity',
    }),
    defineField({
      name: 'industry',
      title: 'Odvětví',
      type: 'string',
      group: 'identity',
      description: 'Např. Fintech, Gastro, Healthcare, E-commerce…',
    }),
    defineField({
      name: 'services',
      title: 'Služby',
      type: 'array',
      group: 'identity',
      of: [{ type: 'string' }],
      options: {
        list: SERVICES.map((s) => ({ title: s, value: s })),
      },
    }),
    defineField({
      name: 'liveUrl',
      title: 'Live web',
      type: 'url',
      group: 'identity',
    }),
    defineField({
      name: 'featured',
      title: 'Zobrazit na homepage',
      type: 'boolean',
      group: 'identity',
      initialValue: false,
    }),
    defineField({
      name: 'order',
      title: 'Pořadí v listingu',
      type: 'number',
      group: 'identity',
      description: 'Nižší číslo = výše. Nepovinné.',
    }),

    // ─── MÉDIA ─────────────────────────────────────────────────────────────────
    defineField({
      name: 'coverImage',
      title: 'Cover obrázek',
      type: 'image',
      group: 'media',
      options: { hotspot: true },
      description: 'Hlavní obrázek pro listing a OG image pro sdílení',
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alt text',
        }),
      ],
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'heroVideo',
      title: 'Hero video',
      type: 'string',
      group: 'media',
      description: 'Cesta nebo URL k .mp4 (např. /work/jatvar-hero.mp4 nebo https://…). Pokud prázdné, použije se cover obrázek.',
    }),
    defineField({
      name: 'cardVideo',
      title: 'Card video (hover)',
      type: 'string',
      group: 'media',
      description: 'Volitelné video, které se přehraje při najetí na kartu v listingu. Cesta nebo URL k .mp4.',
    }),
    defineField({
      name: 'gallery',
      title: 'Galerie',
      type: 'array',
      group: 'media',
      description: 'Obrázky a videa zobrazená pod úvodem; klik otevře lightbox.',
      of: [
        {
          type: 'object',
          name: 'galleryItem',
          title: 'Položka',
          fields: [
            defineField({ name: 'image', title: 'Obrázek', type: 'image', options: { hotspot: true } }),
            defineField({ name: 'videoUrl', title: 'Video (cesta/URL k .mp4)', type: 'string', description: 'Vyplň pro video. Obrázek výše pak slouží jako poster.' }),
            defineField({ name: 'alt', title: 'Alt text', type: 'string' }),
            defineField({ name: 'caption', title: 'Popisek', type: 'string' }),
          ],
          preview: {
            select: { media: 'image', alt: 'alt', videoUrl: 'videoUrl' },
            prepare({ media, alt, videoUrl }) {
              return { title: alt || (videoUrl ? 'Video' : 'Obrázek'), subtitle: videoUrl ? '🎬 video' : '🖼 obrázek', media }
            },
          },
        },
      ],
    }),

    // ─── OBSAH ─────────────────────────────────────────────────────────────────
    defineField({
      name: 'brief',
      title: 'Brief',
      type: 'text',
      group: 'content',
      rows: 3,
      description: 'Krátký odstavec (cca 40 slov) — zadání / výchozí situace. Zobrazí se v úvodu vedle Výsledku.',
    }),
    defineField({
      name: 'vysledek',
      title: 'Výsledek',
      type: 'text',
      group: 'content',
      rows: 3,
      description: 'Krátký odstavec (cca 40 slov) — co vzniklo. Zobrazí se v úvodu vedle Briefu.',
    }),
    defineField({
      name: 'sections',
      title: 'Sekce obsahu',
      type: 'array',
      group: 'content',
      of: [{ type: 'contentSection' }],
      description: 'Přidávej sekce libovolně: Challenge, Strategy, Brand, Outcome…',
    }),
    defineField({
      name: 'credits',
      title: 'Poděkování / tým',
      type: 'text',
      group: 'content',
      rows: 2,
    }),

    // ─── ANGLICKÉ PŘEKLADY ─────────────────────────────────────────────────────
    defineField({
      name: 'titleEn',
      title: 'Project name (EN)',
      type: 'string',
      group: 'translations',
      description: 'English version of the project name. Leave empty to use Czech.',
      validation: (r) => r.max(80),
    }),
    defineField({
      name: 'taglineEn',
      title: 'Tagline (EN)',
      type: 'string',
      group: 'translations',
      validation: (r) => r.max(120),
    }),
    defineField({
      name: 'briefEn',
      title: 'Brief (EN)',
      type: 'text',
      group: 'translations',
      rows: 3,
    }),
    defineField({
      name: 'vysledekEn',
      title: 'Result (EN)',
      type: 'text',
      group: 'translations',
      rows: 3,
    }),
    defineField({
      name: 'creditsEn',
      title: 'Credits / team (EN)',
      type: 'text',
      group: 'translations',
      rows: 2,
    }),
    defineField({
      name: 'seoDescriptionEn',
      title: 'SEO description (EN)',
      type: 'text',
      group: 'translations',
      rows: 3,
      validation: (r) => r.max(160),
      description: 'Max 160 chars — shown in search results for English version',
    }),

    // ─── SEO ───────────────────────────────────────────────────────────────────
    defineField({
      name: 'seoDescription',
      title: 'SEO popis (CS)',
      type: 'text',
      group: 'seo',
      rows: 3,
      validation: (r) => r.max(160),
      description: 'Max 160 znaků — zobrazí se ve výsledcích vyhledávání',
    }),
  ],

  preview: {
    select: {
      title: 'title',
      subtitle: 'tagline',
      media: 'coverImage',
      year: 'year',
    },
    prepare({ title, subtitle, media, year }) {
      return {
        title: title || 'Bez názvu',
        subtitle: [year, subtitle].filter(Boolean).join(' — '),
        media,
      }
    },
  },

  orderings: [
    {
      title: 'Ručně (order)',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
    {
      title: 'Rok (nové první)',
      name: 'yearDesc',
      by: [{ field: 'year', direction: 'desc' }],
    },
  ],
})

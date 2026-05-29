import { defineField, defineType } from 'sanity'

// Upravitelný seznam služeb — přidej/odeber dle svého portfolia
const SERVICES = [
  'Brand Identity',
  'Logo Design',
  'Naming',
  'Visual System',
  'Packaging Design',
  'UX/UI',
  'Web Design',
  'Trademark',
  'Motion Design',
  'Consultation',
]

export const caseStudy = defineType({
  name: 'caseStudy',
  title: 'Case Study',
  type: 'document',

  // Záložky v Sanity Studiu pro přehlednost
  groups: [
    { name: 'identity', title: '📋 Projekt' },
    { name: 'media',    title: '🖼 Média' },
    { name: 'content',  title: '✍️ Obsah' },
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
      title: 'Hero video URL',
      type: 'url',
      group: 'media',
      description: 'Přímý odkaz na .mp4 (Vimeo CDN, BunnyNet, vlastní CDN). Pokud prázdné, použije se cover obrázek.',
    }),

    // ─── OBSAH ─────────────────────────────────────────────────────────────────
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

    // ─── SEO ───────────────────────────────────────────────────────────────────
    defineField({
      name: 'seoDescription',
      title: 'SEO popis',
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

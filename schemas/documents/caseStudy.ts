import { defineField, defineType } from 'sanity'
import { LottieInput } from '../components/LottieInput'

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
      description: 'Skládá se z „řádků" — u každého vybereš rozložení a nasypeš do něj obrázky/videa/Lottie. Klik na obrázek otevře lightbox.',
      of: [
        // ─── ŘÁDEK s presetem rozložení (primární způsob) ──────────────────────
        {
          type: 'object',
          name: 'galleryRow',
          title: 'Řádek',
          fields: [
            defineField({
              name: 'layout',
              title: 'Rozložení řádku',
              type: 'string',
              description: 'Počet položek níže by měl odpovídat rozložení (1 / 2 / 3).',
              options: {
                list: [
                  { title: '▭  1 celá (šířka obsahu)', value: 'single' },
                  { title: '◼︎  1 full-bleed (přes celé okno)', value: 'full' },
                  { title: '◧  2 vedle sebe', value: 'two' },
                  { title: '◫  3 vedle sebe', value: 'three' },
                  { title: '◰  1 velká vlevo + 2 malé', value: 'big-left' },
                  { title: '◳  2 malé + 1 velká vpravo', value: 'big-right' },
                ],
                layout: 'radio',
              },
              initialValue: 'two',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'items',
              title: 'Obsah řádku',
              type: 'array',
              validation: (Rule) => Rule.min(1).max(3),
              of: [
                {
                  type: 'object',
                  name: 'mediaImage',
                  title: 'Obrázek / video',
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
                {
                  type: 'object',
                  name: 'mediaLottie',
                  title: 'Lottie animace',
                  components: { input: LottieInput },
                  fields: [
                    defineField({ name: 'file', title: 'Soubor (.lottie / .json)', type: 'file', options: { accept: '.lottie,.json,application/json' }, description: 'Nahraj Lottie animaci. Nebo níže vlož URL.' }),
                    defineField({ name: 'url', title: 'Nebo URL (.lottie / .json)', type: 'url' }),
                    defineField({ name: 'ratio', title: 'Poměr stran (např. 16:9)', type: 'string', description: 'Rezervuje výšku. Výchozí 16:9.', initialValue: '16:9' }),
                    defineField({ name: 'loop', title: 'Smyčka', type: 'boolean', initialValue: true }),
                    defineField({ name: 'autoplay', title: 'Přehrát automaticky', type: 'boolean', initialValue: true }),
                    defineField({ name: 'bg', title: 'Barva pozadí (např. #0c0c0b nebo transparent)', type: 'string', initialValue: 'transparent' }),
                    defineField({ name: 'alt', title: 'Popis', type: 'string' }),
                  ],
                  preview: {
                    select: { alt: 'alt' },
                    prepare({ alt }) {
                      return { title: alt || 'Lottie animace', subtitle: '✨ lottie' }
                    },
                  },
                },
              ],
            }),
          ],
          preview: {
            select: { layout: 'layout', items: 'items', media: 'items.0.image' },
            prepare({ layout, items, media }) {
              const map: Record<string, string> = {
                single: '▭ 1 celá', full: '◼︎ full-bleed', two: '◧ 2 vedle sebe',
                three: '◫ 3 vedle sebe', 'big-left': '◰ velká + 2 malé', 'big-right': '◳ 2 malé + velká',
              }
              const n = (items ?? []).length
              const unit = n === 1 ? 'položka' : n >= 2 && n <= 4 ? 'položky' : 'položek'
              return { title: map[layout] || 'Řádek', subtitle: `${n} ${unit}`, media }
            },
          },
        },
        // ─── LEGACY: ploché položky (ze starých projektů) ──────────────────────
        {
          type: 'object',
          name: 'galleryItem',
          title: 'Obrázek (starý)',
          fields: [
            defineField({ name: 'image', title: 'Obrázek', type: 'image', options: { hotspot: true } }),
            defineField({ name: 'videoUrl', title: 'Video (cesta/URL k .mp4)', type: 'string', description: 'Vyplň pro video. Obrázek výše pak slouží jako poster.' }),
            defineField({
              name: 'size',
              title: 'Velikost v galerii',
              type: 'string',
              description: 'Jak velký blok obrázek zabере. „Půlka" se skládá po dvou vedle sebe.',
              options: {
                list: [
                  { title: '◼︎ Full-bleed (přes celou šířku okna)', value: 'full' },
                  { title: '▭ Široký (šířka obsahu)', value: 'wide' },
                  { title: '◧ Půlka (dva vedle sebe)', value: 'half' },
                ],
                layout: 'radio',
              },
              initialValue: 'wide',
            }),
            defineField({ name: 'alt', title: 'Alt text', type: 'string' }),
            defineField({ name: 'caption', title: 'Popisek', type: 'string' }),
          ],
          preview: {
            select: { media: 'image', alt: 'alt', videoUrl: 'videoUrl', size: 'size' },
            prepare({ media, alt, videoUrl, size }) {
              const sz = size === 'full' ? '◼︎ full' : size === 'half' ? '◧ půlka' : '▭ široký'
              return { title: alt || (videoUrl ? 'Video' : 'Obrázek'), subtitle: `${videoUrl ? '🎬' : '🖼'} · ${sz}`, media }
            },
          },
        },
        {
          type: 'object',
          name: 'galleryText',
          title: 'Text',
          fields: [
            defineField({
              name: 'body', title: 'Text (CZ)', type: 'array',
              of: [{
                type: 'block',
                styles: [
                  { title: 'Odstavec', value: 'normal' },
                  { title: 'Velké prohlášení', value: 'h3' },
                ],
                lists: [],
                marks: {
                  decorators: [{ title: 'Tučně', value: 'strong' }, { title: 'Kurzíva', value: 'em' }],
                  annotations: [{ name: 'link', type: 'object', title: 'Odkaz', fields: [{ name: 'href', type: 'url', title: 'URL' }] }],
                },
              }],
            }),
            defineField({
              name: 'bodyEn', title: 'Text (EN)', type: 'array',
              of: [{
                type: 'block',
                styles: [
                  { title: 'Paragraph', value: 'normal' },
                  { title: 'Big statement', value: 'h3' },
                ],
                lists: [],
                marks: {
                  decorators: [{ title: 'Bold', value: 'strong' }, { title: 'Italic', value: 'em' }],
                  annotations: [{ name: 'link', type: 'object', title: 'Link', fields: [{ name: 'href', type: 'url', title: 'URL' }] }],
                },
              }],
            }),
            defineField({
              name: 'size', title: 'Šířka bloku', type: 'string',
              options: { list: [{ title: '▭ Široký (šířka obsahu)', value: 'wide' }, { title: '◼︎ Full (širší, vycentrovaný)', value: 'full' }], layout: 'radio' },
              initialValue: 'wide',
            }),
          ],
          preview: {
            select: { body: 'body' },
            prepare({ body }) {
              const txt = (body ?? []).map((b: any) => (b.children ?? []).map((c: any) => c.text).join('')).join(' ')
              return { title: txt || 'Text', subtitle: '📝 text' }
            },
          },
        },
        {
          type: 'object',
          name: 'galleryLottie',
          title: 'Lottie (starý)',
          components: { input: LottieInput },
          fields: [
            defineField({ name: 'file', title: 'Soubor (.lottie / .json)', type: 'file', options: { accept: '.lottie,.json,application/json' }, description: 'Nahraj Lottie animaci. Nebo níže vlož URL.' }),
            defineField({ name: 'url', title: 'Nebo URL (.lottie / .json)', type: 'url' }),
            defineField({
              name: 'size', title: 'Velikost v galerii', type: 'string',
              options: { list: [{ title: '◼︎ Full-bleed', value: 'full' }, { title: '▭ Široký', value: 'wide' }, { title: '◧ Půlka', value: 'half' }], layout: 'radio' },
              initialValue: 'wide',
            }),
            defineField({ name: 'ratio', title: 'Poměr stran (např. 16:9)', type: 'string', description: 'Rezervuje výšku. Výchozí 16:9.', initialValue: '16:9' }),
            defineField({ name: 'loop', title: 'Smyčka', type: 'boolean', initialValue: true }),
            defineField({ name: 'autoplay', title: 'Přehrát automaticky', type: 'boolean', initialValue: true }),
            defineField({ name: 'bg', title: 'Barva pozadí (např. #0c0c0b nebo transparent)', type: 'string', initialValue: 'transparent' }),
            defineField({ name: 'alt', title: 'Popis', type: 'string' }),
          ],
          preview: {
            select: { alt: 'alt', size: 'size' },
            prepare({ alt, size }) {
              const sz = size === 'full' ? '◼︎ full' : size === 'half' ? '◧ půlka' : '▭ široký'
              return { title: alt || 'Lottie animace', subtitle: `✨ lottie · ${sz}` }
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

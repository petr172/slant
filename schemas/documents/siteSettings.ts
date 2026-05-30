import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'heroMedia',
      title: 'Hero Media',
      description: 'Obrázky a videa v hero slideshow. Střídají se automaticky každých 5 s.',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'heroImage',
          title: 'Obrázek',
          fields: [
            defineField({
              name: 'image',
              title: 'Obrázek',
              type: 'image',
              options: { hotspot: true },
              validation: (R) => R.required(),
            }),
            defineField({
              name: 'alt',
              title: 'Alt text',
              type: 'string',
            }),
          ],
          preview: {
            select: { media: 'image', title: 'alt' },
            prepare({ media, title }) {
              return { title: title ?? 'Hero image', media }
            },
          },
        },
        {
          type: 'object',
          name: 'heroExternalImage',
          title: 'Externí obrázek (URL)',
          fields: [
            defineField({ name: 'url', title: 'URL obrázku', type: 'url', validation: (R) => R.required() }),
            defineField({ name: 'alt', title: 'Alt text', type: 'string' }),
          ],
          preview: {
            select: { title: 'url' },
            prepare({ title }) { return { title: title ?? 'External image' } },
          },
        },
        {
          type: 'object',
          name: 'heroVideo',
          title: 'Video',
          fields: [
            defineField({
              name: 'url',
              title: 'Video URL (MP4)',
              type: 'url',
              validation: (R) => R.required(),
            }),
          ],
          preview: {
            select: { title: 'url' },
            prepare({ title }) {
              return { title: title ?? 'Hero video' }
            },
          },
        },
      ],
    }),
    defineField({
      name: 'processSteps',
      title: 'Proces — kroky',
      description: 'Kroky v sekci "Jak to děláme" na homepage.',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'processStep',
          fields: [
            defineField({ name: 'title',         title: 'Název (CS)',    type: 'string', validation: (R) => R.required() }),
            defineField({ name: 'titleEn',        title: 'Název (EN)',    type: 'string' }),
            defineField({ name: 'description',    title: 'Popis (CS)',    type: 'text',   rows: 3 }),
            defineField({ name: 'descriptionEn',  title: 'Popis (EN)',    type: 'text',   rows: 3 }),
          ],
          preview: {
            select: { title: 'title' },
            prepare({ title }) { return { title: title ?? 'Step' } },
          },
        },
      ],
    }),
    defineField({
      name: 'clientLogos',
      title: 'Client Logos',
      description: 'Loga klientů zobrazená v trust wall pod hero sekcí.',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'clientLogo',
          fields: [
            defineField({ name: 'name', title: 'Název klienta', type: 'string', validation: (R) => R.required() }),
            defineField({ name: 'logoUrl', title: 'Logo URL (SVG/PNG)', type: 'string', validation: (R) => R.required() }),
            defineField({ name: 'url', title: 'Web klienta (volitelné)', type: 'url' }),
          ],
          preview: {
            select: { title: 'name' },
            prepare({ title }) { return { title: title ?? 'Client logo' } },
          },
        },
      ],
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Site Settings' }
    },
  },
})

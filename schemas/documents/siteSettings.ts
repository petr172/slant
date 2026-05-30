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
  ],
  preview: {
    prepare() {
      return { title: 'Site Settings' }
    },
  },
})

import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'legalPage',
  title: 'Legal Pages',
  type: 'document',
  fields: [
    defineField({ name: 'title',   title: 'Název (CS)', type: 'string' }),
    defineField({ name: 'titleEn', title: 'Title (EN)', type: 'string' }),
    defineField({ name: 'slug',    title: 'Slug', type: 'slug', options: { source: 'title' } }),
    defineField({
      name: 'body', title: 'Obsah (CS)', type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'bodyEn', title: 'Content (EN)', type: 'array',
      of: [{ type: 'block' }],
    }),
  ],
  preview: { select: { title: 'title' } },
})

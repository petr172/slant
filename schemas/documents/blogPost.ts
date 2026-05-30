import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'blogPost',
  title: 'Blog Post',
  type: 'document',
  fields: [
    defineField({ name: 'title',       title: 'Nadpis (CS)',       type: 'string', validation: R => R.required() }),
    defineField({ name: 'titleEn',     title: 'Nadpis (EN)',       type: 'string' }),
    defineField({ name: 'slug',        title: 'Slug',              type: 'slug', options: { source: 'title' }, validation: R => R.required() }),
    defineField({ name: 'description', title: 'Perex (CS)',        type: 'text', rows: 3 }),
    defineField({ name: 'descriptionEn', title: 'Perex (EN)',      type: 'text', rows: 3 }),
    defineField({ name: 'coverImage',  title: 'Náhledový obrázek', type: 'image', options: { hotspot: true }, fields: [
      defineField({ name: 'alt', title: 'Alt text', type: 'string' }),
    ]}),
    defineField({ name: 'publishedAt', title: 'Datum vydání',      type: 'datetime' }),
    defineField({ name: 'category',    title: 'Kategorie',         type: 'string', options: { list: ['Branding', 'UX Design', 'Strategy', 'Behind the scenes', 'Studio'] } }),
    defineField({ name: 'featured',   title: 'Zobrazit na homepage', type: 'boolean', initialValue: false }),
  ],
  preview: {
    select: { title: 'title', media: 'coverImage', subtitle: 'category' },
  },
  orderings: [{ title: 'Nejnovější', name: 'publishedAtDesc', by: [{ field: 'publishedAt', direction: 'desc' }] }],
})

import { defineField, defineType } from 'sanity'

export const contentSection = defineType({
  name: 'contentSection',
  title: 'Sekce',
  type: 'object',
  groups: [
    { name: 'cs', title: '🇨🇿 Czech' },
    { name: 'en', title: '🇬🇧 English' },
  ],
  fields: [
    defineField({
      name: 'heading',
      title: 'Nadpis sekce',
      type: 'string',
      group: 'cs',
      description: 'Např. Challenge, Strategy, Brand, Outcome — nebo nech prázdné',
    }),
    defineField({
      name: 'body',
      title: 'Text',
      type: 'array',
      group: 'cs',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Odstavec', value: 'normal' },
            { title: 'H3', value: 'h3' },
          ],
          marks: {
            decorators: [
              { title: 'Tučné', value: 'strong' },
              { title: 'Kurzíva', value: 'em' },
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Odkaz',
                fields: [{ name: 'href', type: 'url', title: 'URL' }],
              },
            ],
          },
        },
      ],
    }),
    defineField({
      name: 'headingEn',
      title: 'Section heading (EN)',
      type: 'string',
      group: 'en',
      description: 'English heading — leave empty to use Czech or no heading',
    }),
    defineField({
      name: 'bodyEn',
      title: 'Text (EN)',
      type: 'array',
      group: 'en',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Paragraph', value: 'normal' },
            { title: 'H3', value: 'h3' },
          ],
          marks: {
            decorators: [
              { title: 'Bold', value: 'strong' },
              { title: 'Italic', value: 'em' },
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [{ name: 'href', type: 'url', title: 'URL' }],
              },
            ],
          },
        },
      ],
    }),
    defineField({
      name: 'images',
      title: 'Obrázky',
      type: 'array',
      description: '1 obrázek = full width | 2 = 2 sloupce | 3–4 = grid',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            { name: 'alt', type: 'string', title: 'Alt text (popis pro screen readery)' },
            { name: 'caption', type: 'string', title: 'Popisek pod obrázkem' },
          ],
        },
      ],
    }),
  ],
  preview: {
    select: { title: 'heading' },
    prepare({ title }) {
      return { title: title || '— sekce bez nadpisu —' }
    },
  },
})

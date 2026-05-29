import { defineField, defineType } from 'sanity'

/**
 * ContentSection — opakující se blok na stránce case study
 * Každá sekce má volitelný nadpis, rich text a pole obrázků.
 * Počet obrázků určuje layout (1 = full width, 2 = 2 sloupce, 3–4 = grid).
 */
export const contentSection = defineType({
  name: 'contentSection',
  title: 'Sekce',
  type: 'object',
  fields: [
    defineField({
      name: 'heading',
      title: 'Nadpis sekce',
      type: 'string',
      description: 'Např. Challenge, Strategy, Brand, Outcome — nebo nech prázdné',
    }),
    defineField({
      name: 'body',
      title: 'Text',
      type: 'array',
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
                fields: [
                  {
                    name: 'href',
                    type: 'url',
                    title: 'URL',
                  },
                ],
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
            {
              name: 'alt',
              type: 'string',
              title: 'Alt text (popis pro screen readery)',
            },
            {
              name: 'caption',
              type: 'string',
              title: 'Popisek pod obrázkem',
            },
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

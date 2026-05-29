import imageUrlBuilder from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'
import { client } from './sanity'

const builder = imageUrlBuilder(client)

/**
 * Vytváří optimalizované URL pro Sanity obrázky.
 *
 * Použití:
 *   urlFor(image).width(1200).format('webp').quality(85).url()
 *   urlFor(image).width(400).height(300).fit('crop').url()
 */
export function urlFor(source: SanityImageSource) {
  return builder.image(source)
}

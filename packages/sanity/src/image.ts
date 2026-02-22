import createImageUrlBuilder from '@sanity/image-url'
import { client } from './client'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'

const builder = createImageUrlBuilder(client)

export function urlForImage(source: SanityImageSource | null | undefined) {
  if (!source) {
    return undefined
  }

  return builder.image(source).auto('format').fit('max')
}

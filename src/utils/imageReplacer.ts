import APIError from '@/app/api/core/exceptions/api'
import { SupabaseActions } from '@/utils/SupabaseActions'

export async function replaceImageSrc(htmlString: string, getSignedUrl: (filePath: string) => Promise<string>) {
  const imgTagRegex = /<img\s+[^>]*src="([^"]+)"[^>]*>/g
  const supabaseActions = new SupabaseActions()
  const replacements: { originalSrc: string; newUrl: string }[] = []
  let match

  // First pass: collect all replacements
  while ((match = imgTagRegex.exec(htmlString)) !== null) {
    const originalSrc = match[1]
    const filePath = await getFilePathFromUrl(originalSrc)
    if (filePath) {
      const newUrl = await getSignedUrl(filePath)
      if (newUrl) {
        try {
          console.log('try fetching', newUrl)
          await fetch(newUrl)
        } catch (err) {
          throw new APIError(404, 'Failed to prefectch image, image url not found')
        }
      }
      newUrl && replacements.push({ originalSrc, newUrl })
    }
  }

  // Second pass: apply all replacements
  for (const { originalSrc, newUrl } of replacements) {
    htmlString = htmlString.replace(originalSrc, newUrl)
  }

  return htmlString
}

async function getFilePathFromUrl(url: string) {
  try {
    if (url) {
      const parsedUrl = new URL(url)
      const pathname = parsedUrl.pathname
      const mediaIndex = pathname.indexOf('/media/')
      if (mediaIndex !== -1) {
        const filePath = pathname.substring(mediaIndex + '/media/'.length)
        return filePath
      }
    }
  } catch (error) {
    console.error('Invalid URL:', error)
    return null
  }
}

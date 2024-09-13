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
      newUrl && replacements.push({ originalSrc, newUrl })
    }
  }

  // Second pass: apply all replacements
  for (const { originalSrc, newUrl } of replacements) {
    htmlString = htmlString.replace(originalSrc, newUrl)
  }

  return htmlString
}

export function getFilePathFromUrl(url: string) {
  const parsedUrl = new URL(url)
  const pathname = parsedUrl.pathname
  const mediaIndex = pathname.indexOf('/media/')
  if (mediaIndex !== -1) {
    const filePath = pathname.substring(mediaIndex + '/media/'.length)
    return filePath
  }
}
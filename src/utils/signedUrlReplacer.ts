export async function replaceImageSrc(htmlString: string, getSignedUrl: (filePath: string) => Promise<string | undefined>) {
  const imgTagRegex = /<img\s+[^>]*src="([^"]+)"[^>]*>/g //expression used to match all img tags in provided HTML string.
  const replacements: { originalSrc: string; newUrl: string }[] = []
  let match

  // First pass: collect all replacements
  while ((match = imgTagRegex.exec(htmlString)) !== null) {
    const originalSrc = match[1] //matches the content of the first capture of regex, ie string inside the src attribute of the img tag.
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
  try {
    const parsedUrl = new URL(url)
    const pathname = parsedUrl.pathname
    const filePath = pathname.split('/media/')[1]
    return filePath
  } catch (error) {
    console.error('Invalid URL:', error)
    return null
  }
}

export function getAbsoluteFileName(filePath: string): string | null {
  try {
    const parts = filePath.split('/')
    return parts.pop() || null
  } catch (error) {
    console.error('Invalid filepath:', error)
    return null
  }
} //utility function to extract fileName from the whole filePath

export const extractImgSrcs = (body: string) => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(body, 'text/html')
  const imgs = Array.from(doc.querySelectorAll('img'))
  return imgs.map((img) => img.src) // Return an array of srcs
}

export const replaceImgSrcs = (body: string, newSrcs: string[], oldSrcs: string[]) => {
  let updatedBody = body
  newSrcs.forEach((newSrc, index) => {
    const filePath = getFilePathFromUrl(newSrc)
    if (filePath) {
      const match = oldSrcs.find((oldSrc) => oldSrc.includes(filePath))
      if (match) {
        updatedBody = updatedBody.replace(newSrc, match)
      }
    }
  })
  return updatedBody
}

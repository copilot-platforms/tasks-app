import { Prisma, PrismaClient, StateType, WorkflowState } from '@prisma/client'
import { DefaultArgs } from '@prisma/client/runtime/library'

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

export async function getFilePathFromUrl(url: string) {
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

export async function updateTaskIdOfScrapImagesAfterCreation(
  db: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
  htmlString: string,
  task_id: string,
) {
  const imgTagRegex = /<img\s+[^>]*src="([^"]+)"[^>]*>/g //expression used to match all img tags in provided HTML string.
  let match
  const filePaths: string[] = []
  while ((match = imgTagRegex.exec(htmlString)) !== null) {
    const originalSrc = match[1]
    const filePath = await getFilePathFromUrl(originalSrc)
    if (filePath) {
      filePaths.push(filePath)
    }
  }

  await db.scrapImage.updateMany({
    where: {
      filePath: {
        in: filePaths,
      },
    },
    data: {
      taskId: task_id,
    },
  })
}

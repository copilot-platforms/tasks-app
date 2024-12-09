import { JSDOM } from 'jsdom'
import { SupabaseActions } from './SupabaseActions'
import { TaskTemplate } from '@prisma/client'
import { supabaseBucket } from '@/config'
import { getSignedUrl } from './signUrl'

/**
 * Extracts the template path from a given url string
 * @param {string} url - Supabase Bucket URL string to extract template path from
 * @returns {string} - String path for url file from the given bucket
 */
const extractTemplatePath = (url: string): string | null => {
  const templatePathRegex = /media\/[^?]+templates\/([^?]+)/
  const match = url.match(templatePathRegex)
  return match ? match[0].split('media/')[1] : null
}

/**
 * Copies assets from templates folder to root of workspaceId folder (used for unsaved task assets)
 * @param {string} workspaceId - WorkspaceId for which the task belongs to, since we organize files by workspaceId
 * @param {string} body - String to extract and copy media files from its body
 * @return {string} String with template assets moved to root of workspaceId
 */
export const copyTemplateMediaToTask = async (workspaceId: string, body: string): Promise<string | null> => {
  // Regex to match template img srcs
  // Eg https://abcd.supabase.co/storage/v1/object/sign/media/{workspaceId}/templates/
  const templateUrlRegex = /^https:\/\/([^\/]+)\.supabase\.co\/storage\/v1\/object\/sign\/media\/([^\/]+)\/templates\//

  const dom = new JSDOM(body)
  const document = dom.window.document
  const images = document.querySelectorAll('img')
  const attachments = document.querySelectorAll('div[data-type="attachment"]')

  // Extract all img src with images belonging to template folder
  const imgArray = Array.from(images)
    .map((img) => img.src)
    .filter((url) => templateUrlRegex.test(url))
    .map((url) => extractTemplatePath(url))
    .filter((url): url is string => !!url)

  const attachmentsArray = Array.from(attachments)
    .map((attachmentEl) => attachmentEl.getAttribute('data-src'))
    .filter((url): url is string => !!url)
    .filter((url) => templateUrlRegex.test(url))
    .map((url) => extractTemplatePath(url))
    .filter((url): url is string => !!url)

  const srcArray = [...imgArray, ...attachmentsArray]

  // Copy assets from template folder to root of workspaceId folder
  const supabase = new SupabaseActions()
  const copyPromises = []
  for (let src of srcArray) {
    const srcSegments = src.split('/')
    const filename = srcSegments[srcSegments.length - 1]
    const newUniqueFilename = crypto.randomUUID() + filename.slice(36)
    copyPromises.push(supabase.copyAttachment(src, `${workspaceId}/${newUniqueFilename}`))
  }

  const destinations = await Promise.all(copyPromises)
  // Strip bucketName from destinations to get a 1:1 mapping of src -> destination
  const destArray = destinations.map((path) => path.replace(`${supabaseBucket}/`, ''))
  for (let i in srcArray) {
    body = body.replace(srcArray[i], destArray[i])
  }

  return body
}

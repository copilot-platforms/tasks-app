import { supabaseBucket } from '@/config'
import { SupabaseActions } from '@/utils/SupabaseActions'
import { JSDOM } from 'jsdom'
import { v4 as uuidv4 } from 'uuid'

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
  const templateUrlRegex =
    /^https?:\/\/(?:[^\/]+\.supabase\.co|127\.0\.0\.1:\d+)\/storage\/v1\/object\/sign\/media\/([^\/]+)\/templates\// //accepting local supabase urls too

  const dom = new JSDOM(body)
  const document = dom.window.document
  const images = document.querySelectorAll('img')
  const attachments = document.querySelectorAll('div[data-type="attachment"]')

  // Extract all image / attachments src belonging to template folder
  const rawSrcArray = [
    ...Array.from(images).map((el) => el.getAttribute('src')),
    ...Array.from(attachments).map((el) => el.getAttribute('data-src')),
    // Here we can safely exclude attachment-view
  ].filter(Boolean)
  const srcArray = rawSrcArray
    .filter((url): url is string => !!url)
    .filter((url) => templateUrlRegex.test(url))
    .map(extractTemplatePath)
    .filter((url): url is string => !!url)

  // Copy assets from template folder to root of workspaceId folder
  const supabase = new SupabaseActions()
  const copyPromises = []
  for (let src of srcArray) {
    const srcSegments = src.split('/')
    const filename = srcSegments[srcSegments.length - 1]
    const newUniqueFilename = uuidv4() + filename.slice(36)
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

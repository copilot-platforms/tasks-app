import { JSDOM } from 'jsdom'
import { SupabaseActions } from './SupabaseActions'

const extractTemplatePath = (url: string): string | null => {
  const templatePathRegex = /templates\/([^?]+)/
  const match = url.match(templatePathRegex)
  return match ? match[0] : null
}

export const copySupabaseMediaToTask = async (taskId: string, workspaceId: string, body: string) => {
  const templateImageRegex = /^https:\/\/([^\/]+)\.supabase\.co\/storage\/v1\/object\/sign\/media\/([^\/]+)\/templates\//

  const dom = new JSDOM(body)
  const document = dom.window.document
  const images = document.querySelectorAll('img')

  const srcArray = Array.from(images)
    .map((img) => img.src)
    .filter((url) => templateImageRegex.test(url))
    .map((url) => extractTemplatePath(url))
  const supabase = new SupabaseActions()
  const copyPromises = []

  for (let src of srcArray) {
    src && copyPromises.push(supabase.copyAttachment(src, `${workspaceId}/${taskId}`))
  }
  await Promise.all(copyPromises)
}

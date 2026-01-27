export function sanitizeHtml(html: string): string {
  let sanitized = html.replace(/<img[^>]*>/gi, '')
  sanitized = sanitized.replace(/<div[^>]*>[\s\S]*?<\/div>/gi, '')
  sanitized = sanitized.replace(/<p>\s*<\/p>/gi, '')
  return sanitized
}

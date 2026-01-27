/** A utility function that strips the attachment tags, image tags and all its content from task content or comment content. ONLY TO BE USED FOR PUBLIC API.
 *
 * @export
 * @param {string} html : takes in the description of a task or content of a comment
 * @returns {string} : returns the sanitized content removing useless tags causing pollution in the public API.
 */
export function sanitizeHtml(html: string): string {
  let sanitized = html.replace(/<img[^>]*>/gi, '')
  sanitized = sanitized.replace(/<div[^>]*>[\s\S]*?<\/div>/gi, '')
  sanitized = sanitized.replace(/<p>\s*<\/p>/gi, '')
  return sanitized
}

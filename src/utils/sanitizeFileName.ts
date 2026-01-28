/**
 * Sanitizes a Supabase stored filename back to its original format
 * Removes UUID prefix and the underscore following it. ONLY TO BE USED on attachment response for public APIs.
 *
 * @param fileName - The stored filename with UUID prefix
 * @returns The original filename
 */
export function sanitizeFileName(fileName: string): string {
  const withoutUuid = fileName.replace(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}_/i, '') //remove the initial UUID.
  return withoutUuid
}

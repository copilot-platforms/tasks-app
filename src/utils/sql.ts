/**
 * Util that escapes special characters to prevent SQL injection
 */
export const sanitize = (str: string) =>
  str
    .replace(/(\x00|\x1a)/g, '') // Remove null bytes
    .replace(/['"]/g, "''") // Escape single/double quotes by doubling them
    .replace(/;/g, '') // Remove semicolons (end of sql statement)

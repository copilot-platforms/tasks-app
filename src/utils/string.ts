/**
 * Returns the 'camelCased' transform of a given string
 */
export const toCamelCase = (str: string): string => {
  return (
    str
      // Match letters, numbers, underscores, hyphens, and spaces
      .replace(/[^a-zA-Z0-9\u00C0-\u024F\u1E00-\u1EFF -]+/g, '')
      // Remove leading non-letters, non-numbers
      .replace(/^[^a-zA-Z0-9]+/, '')
      // Split the string at spaces, underscores, or hyphens (common separtors)
      .split(/[-_\s]+/)
      .reduce((result, word, i) => {
        return result + (i === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      }, '')
  )
}

/**
 * Generates a random string (lowercase + uppercase)
 * */
export const generateRandomString = (length: number): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
  let result = ''
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length)
    result += characters[randomIndex]
  }
  return result
}

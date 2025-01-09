export const ensureHttps = (url: string) => {
  if (url.startsWith('https://')) {
    return url
  }
  if (url.startsWith('http://')) {
    return url.replace('http://', 'https://')
  }
  return `https://${url}`
}

export const extractHtml = (contents: string): string => {
  const withoutTables = contents.replace(/<table[\s\S]*?<\/table>/g, '')

  const textContent = withoutTables
    .replace(/<\/?[^>]+(>|$)/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  return textContent
}

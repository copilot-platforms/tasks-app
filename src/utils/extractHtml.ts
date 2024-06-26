// This function is used to extract the text contents from HTML rendered in the Tapwrite package based on tiptap.

export const extractHtml = (contents: string): string => {
  const withoutTables = contents.replace(/<table[\s\S]*?<\/table>/g, '') //excludes the contents/texts displayed inside table.

  const textContent = withoutTables
    .replace(/<\/?[^>]+(>|$)/g, ' ') //Removes all html tag from contents.
    .replace(/\s+/g, ' ') // Replaces multiple spaces with a single space.
    .trim() // Remove leading and trailing spaces.

  return textContent
}

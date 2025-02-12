export const isTapwriteContentEmpty = (content: string) => {
  // Regular expression to match only empty paragraphs, whitespace, or <br> tags
  const emptyContentRegex = /^(<p>(\s|(<br\s*\/?>))*<\/p>)*$/
  return emptyContentRegex.test(content)
}

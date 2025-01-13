export const trimAllTags = (htmlString: string) => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(htmlString, 'text/html')

  const elements = doc.body.querySelectorAll('*')

  elements.forEach((element) => {
    if (element.textContent) {
      element.textContent = element.textContent.trim()
    }
  })

  return doc.body.innerHTML
}

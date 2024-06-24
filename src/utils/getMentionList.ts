export const getMentionsList = (detail: string) => {
  const regex = /<span\s+class="mention"[^>]*data-id="([^"]+)"[^>]*>/g
  const extractedMentionsList = Array.from(detail.matchAll(regex), (match) => match[1])
  return extractedMentionsList
}

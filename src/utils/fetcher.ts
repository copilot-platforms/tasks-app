export const fetcher = async (url: string | null) => {
  if (!url) return

  const res = await fetch(url)

  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.')
    throw error
  }

  return res.json()
}

export const fetcher = async (url: string | null) => {
  if (!url) return

  const res = await fetch(url)

  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.')
    throw error
  }

  return res.json()
}

export async function safeFetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options)

  const text = await res.text()

  if (!res.ok) {
    console.error(`##SafeJson Request failed: ${url}`, {
      status: res.status,
      body: text.slice(0, 500), // limit size
    })
    throw new Error(`Request failed with status ${res.status}`)
  }

  try {
    return JSON.parse(text) as T
  } catch (err) {
    console.error(`[safeFetchJSON] JSON parse failed: ${url}`, {
      status: res.status,
      bodyPreview: text.slice(0, 500),
    })
    throw new Error(`Logger : Invalid JSON response from ${url}`)
  }
}

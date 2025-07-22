type FetchOptions = RequestInit & {
  next?: { tags?: string[] }
}

export async function fetchWithErrorHandler<T>(input: RequestInfo, options?: FetchOptions, retries = 3): Promise<T> {
  let lastError: any

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(input, options)

      if (res.status === 500) {
        throw new Error('Internal server error.')
      }

      if (!res.ok) {
        const text = await res.text()
        throw new Error(`Fetch failed (${res.status}): ${text}`)
      }

      const data = await res.json()
      return data
    } catch (error) {
      lastError = error
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)))
      }
    }
  }
  throw lastError
}

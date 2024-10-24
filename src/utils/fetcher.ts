export const fetcher = (url: string | null) => {
  if (url) {
    return fetch(url)
      .then((res) => res.json())
      .catch((e) => console.error('fetcher: ', e))
    // @aatbip we should have better error handling here eventually - we could force rerender this component for a fixed number of times
  }
}

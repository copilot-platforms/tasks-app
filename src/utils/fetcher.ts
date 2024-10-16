export const fetcher = (url: string | null) => {
  if (url) {
    return fetch(url)
      .then((res) => res.json())
      .catch((e) => console.log('fetcher: ', e))
  }
}

'use client'

import { SWRConfiguration } from 'swr'

export const swrConfig: SWRConfiguration = {
  onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
    if (error.status === 404 || retryCount >= 3) return
    setTimeout(() => revalidate({ retryCount }), 500)
  },
}

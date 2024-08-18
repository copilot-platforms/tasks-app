'use client'

import { CheckStaleTokenResponse } from '@/types/dto/checkStaleToken.dto'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

const TOKEN_CHECK_INTERVAL = 30 * 1000

interface CheckStaleTokenProps {
  token: string
}

export const CheckStaleToken = ({ token }: CheckStaleTokenProps) => {
  const router = useRouter()
  const checkStaleToken = async () => {
    console.log('here!')
    const response = await fetch(`/api/check-stale-token?token=${token}`)
    const isTokenStale = CheckStaleTokenResponse.parse(await response.json())
    if (isTokenStale) {
      // TODO: Use App Bridge to make iframe parent generate a new token with new data encoded
      console.error('Token is stale. Oh no!')
    }
  }

  useEffect(() => {
    const intervalId = setInterval(() => {
      checkStaleToken()
    }, TOKEN_CHECK_INTERVAL)
    return () => clearInterval(intervalId)
  }, [])

  return <></>
}

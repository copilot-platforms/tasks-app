'use client'

import { useRouter } from 'next/navigation'
import { ReactNode, useCallback } from 'react'
import { UrlObject } from 'url'
import { z } from 'zod'

export const CustomLink = ({ children, href }: { children: ReactNode; href: string | UrlObject }) => {
  const router = useRouter()

  type UrlDetails = {
    pathname?: string
    token?: string
  }

  const getUrl = useCallback((): UrlDetails => {
    if (typeof href !== 'string') {
      if ('pathname' in href && 'query' in href && href.query && typeof href.query === 'object') {
        const pathname = z.string().parse(href.pathname)
        const token = z.string().parse(href.query['token'])
        return { pathname, token }
      } else {
        console.error('Invalid UrlObject format')
        return {}
      }
    } else {
      // check if the href has token param
      let regex = /\?token=.+/
      if (regex.test(href)) {
        return { pathname: href }
      } else {
        return {}
      }
    }
  }, [href])

  const { pathname, token } = getUrl()

  const handleMouseEnter = useCallback(() => {
    router.prefetch(`${pathname}?token=${token}`)
  }, [href])

  return (
    <div onMouseEnter={handleMouseEnter} onClick={() => router.push(`${pathname}?token=${token}`)}>
      {children}
    </div>
  )
}

import Link from 'next/link'
import { CSSProperties, ReactNode, useCallback, useState } from 'react'
import { UrlObject } from 'url'
import { z } from 'zod'

export const CustomLink = ({
  children,
  href,
  style,
}: {
  children: ReactNode
  href: string | UrlObject
  style?: CSSProperties
}) => {
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

  const [shouldPrefetch, setShouldPrefetch] = useState(false)

  const handleMouseEnter = useCallback(() => {
    setShouldPrefetch(true)
  }, [href])

  return (
    <Link href={`${pathname}?token=${token}`} onMouseEnter={handleMouseEnter} style={style} prefetch={shouldPrefetch}>
      {children}
    </Link>
  )
}

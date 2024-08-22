'use client'
import { usePathname } from 'next/navigation'
import { ProgressLoader } from 'nextjs-progressloader'
import { Suspense } from 'react'

export const ProgressLoad = () => {
  const pathname = usePathname()
  if (pathname.includes('client')) return null
  return (
    <Suspense fallback={null}>
      <ProgressLoader
        color="#212B36"
        crawlSpeed={100}
        height={4}
        template='<div class="bar" role="bar"><div class="peg"></div></div>'
      />
    </Suspense>
  )
}

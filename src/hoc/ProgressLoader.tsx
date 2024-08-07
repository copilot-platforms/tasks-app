'use client'
import { ProgressLoader } from 'nextjs-progressloader'
import { Suspense } from 'react'

export const ProgressLoad = () => {
  return (
    <Suspense fallback={null}>
      <ProgressLoader
        color="#212B36"
        crawlSpeed={100}
        height={5}
        template='<div class="bar" role="bar"><div class="peg"></div></div>'
      />
    </Suspense>
  )
}

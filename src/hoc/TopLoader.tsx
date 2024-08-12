'use client'

import { ProgressLoader } from 'nextjs-progressloader'
import { Suspense } from 'react'

export const TopLoader = () => {
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

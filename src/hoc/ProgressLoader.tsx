'use client'
import { ProgressLoader } from 'nextjs-progressloader'

export const ProgressLoad = () => {
  return <ProgressLoader color="#212B36" crawlSpeed={100} height={5} showSpinner={false} />
}

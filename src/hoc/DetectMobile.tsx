'use client'

import { useWindowWidth } from '@/hooks/useWindowWidth'
import { setIsMobile } from '@/redux/features/taskBoardSlice'
import store from '@/redux/store'
import { ReactNode, useEffect } from 'react'

export const DetectMobile = ({ children }: { children: ReactNode }) => {
  const windowWidth = useWindowWidth()
  const isMobile = windowWidth < 600 && windowWidth !== 0

  useEffect(() => {
    if (isMobile) {
      store.dispatch(setIsMobile(isMobile))
    }
  }, [isMobile])

  return children
}

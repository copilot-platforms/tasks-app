'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

/**
 * A custom hook to scroll to an element based on a query parameter when the component mounts.
 * @param paramName The query parameter name to get the element ID from.
 */
const useScrollToElement = (paramName: string) => {
  const searchParams = useSearchParams()
  const elementId = searchParams.get(paramName)

  useEffect(() => {
    if (!elementId) return

    const observer = new MutationObserver(() => scrollToElement())

    const scrollToElement = () => {
      const targetElement = document.getElementById(elementId)
      if (!targetElement) return
      const commentCard = targetElement.querySelector('[data-comment-card]') as HTMLElement | null

      setTimeout(() => {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
      }, 100)

      setTimeout(() => {
        if (commentCard) {
          commentCard.classList.add('highlight-fade')
        }
      }, 600)
      observer.disconnect()
    }

    scrollToElement()

    if (!document.getElementById(elementId)) {
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
      })
    }

    return () => observer.disconnect()
  }, [elementId])
}

export default useScrollToElement

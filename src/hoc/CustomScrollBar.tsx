'use client'

import React, { useState, useCallback, ReactNode, useRef, useEffect } from 'react'

interface CustomScrollBarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  className?: string
  role?: string
}

interface ScrollHostElement extends HTMLDivElement {
  scrollTop: number
  scrollHeight: number
  offsetHeight: number
  clientHeight: number
}

const SCROLL_BOX_MIN_HEIGHT = 30

export const CustomScrollBar: React.FC<CustomScrollBarProps> = ({ children, className = '', role, ...restProps }) => {
  const [showScrollbar, setShowScrollbar] = useState<boolean>(false)
  const [scrollBoxHeight, setScrollBoxHeight] = useState<number>(SCROLL_BOX_MIN_HEIGHT)
  const [scrollBoxTop, setScrollBoxTop] = useState<number>(0)
  const [isDragging, setDragging] = useState<boolean>(false)
  const [isScrollable, setIsScrollable] = useState<boolean>(false)
  const [dragStartY, setDragStartY] = useState<number>(0)
  const [startScrollTop, setStartScrollTop] = useState<number>(0)
  const scrollTimeoutRef = useRef<NodeJS.Timeout>(undefined)
  const resizeObserverRef = useRef<ResizeObserver>(undefined)

  const scrollHostRef = useRef<ScrollHostElement>(null)

  const updateScrollThumbHeight = useCallback(() => {
    const scrollHostElement = scrollHostRef.current
    if (!scrollHostElement) return

    const { clientHeight, scrollHeight } = scrollHostElement
    const isContentScrollable = scrollHeight > clientHeight
    setIsScrollable(isContentScrollable)

    if (!isContentScrollable) {
      setShowScrollbar(false)
      return
    }

    const scrollThumbPercentage = clientHeight / scrollHeight
    const scrollThumbHeight = Math.max(scrollThumbPercentage * clientHeight, SCROLL_BOX_MIN_HEIGHT)
    setScrollBoxHeight(scrollThumbHeight)
  }, [])

  const handleDocumentMouseUp = useCallback(() => {
    if (isDragging) {
      setDragging(false)
    }
  }, [isDragging])

  const handleDocumentMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging && scrollHostRef.current) {
        e.preventDefault()
        const scrollHostElement = scrollHostRef.current
        const { scrollHeight, clientHeight } = scrollHostElement

        const deltaY = e.clientY - dragStartY

        const scrollRatio = (scrollHeight - clientHeight) / (clientHeight - scrollBoxHeight)

        const newScrollTop = Math.max(0, Math.min(startScrollTop + deltaY * scrollRatio, scrollHeight - clientHeight))
        scrollHostElement.scrollTop = newScrollTop
        const thumbPosition = (newScrollTop / (scrollHeight - clientHeight)) * (clientHeight - scrollBoxHeight)
        setScrollBoxTop(thumbPosition)
      }
    },
    [isDragging, dragStartY, startScrollTop, scrollBoxHeight],
  )

  const handleScrollThumbMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    if (scrollHostRef.current) {
      setDragStartY(e.clientY)
      setStartScrollTop(scrollHostRef.current.scrollTop)
      setDragging(true)
    }
  }, [])

  const handleScroll = useCallback(() => {
    if (!scrollHostRef.current || !isScrollable) {
      return
    }
    const scrollHostElement = scrollHostRef.current
    const { scrollTop, scrollHeight, clientHeight } = scrollHostElement

    setShowScrollbar(true)

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
    }

    scrollTimeoutRef.current = setTimeout(() => {
      setShowScrollbar(false)
    }, 500)
    const thumbPosition = (scrollTop / (scrollHeight - clientHeight)) * (clientHeight - scrollBoxHeight)
    setScrollBoxTop(thumbPosition)

    updateScrollThumbHeight()
  }, [scrollBoxHeight, updateScrollThumbHeight, isScrollable])

  useEffect(() => {
    const scrollHostElement = scrollHostRef.current
    if (!scrollHostElement) return

    updateScrollThumbHeight()

    resizeObserverRef.current = new ResizeObserver(() => {
      updateScrollThumbHeight()
    })

    resizeObserverRef.current.observe(scrollHostElement)
    Array.from(scrollHostElement.children).forEach((child) => {
      resizeObserverRef.current?.observe(child)
    })

    scrollHostElement.addEventListener('scroll', handleScroll, true)

    return () => {
      scrollHostElement.removeEventListener('scroll', handleScroll, true)
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect()
      }
    }
  }, [handleScroll, updateScrollThumbHeight])

  useEffect(() => {
    document.addEventListener('mousemove', handleDocumentMouseMove)
    document.addEventListener('mouseup', handleDocumentMouseUp)
    document.addEventListener('mouseleave', handleDocumentMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleDocumentMouseMove)
      document.removeEventListener('mouseup', handleDocumentMouseUp)
      document.removeEventListener('mouseleave', handleDocumentMouseUp)
    }
  }, [handleDocumentMouseMove, handleDocumentMouseUp])

  const [isHovered, setIsHovered] = useState(false)

  return (
    <div className="scrollhost-container">
      <div ref={scrollHostRef} role={role} className={`scrollhost ${className}`} {...restProps}>
        {children}
      </div>
      {isScrollable && (
        <div
          className="scroll-thumb"
          style={{
            height: scrollBoxHeight,
            top: scrollBoxTop,
            opacity: showScrollbar || isDragging || isHovered ? 1 : 0,
            transition: isDragging ? 'none' : 'opacity 0.5s ease-in-out',
            display: isScrollable ? 'block' : 'none',
            cursor: 'default',
          }}
          onMouseDown={handleScrollThumbMouseDown}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        />
      )}
    </div>
  )
}

export default CustomScrollBar

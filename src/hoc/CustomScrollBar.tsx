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
  const [lastScrollThumbPosition, setScrollThumbPosition] = useState<number>(0)
  const [isDragging, setDragging] = useState<boolean>(false)
  const [isScrollable, setIsScrollable] = useState<boolean>(false)
  const scrollTimeoutRef = useRef<NodeJS.Timeout>()
  const resizeObserverRef = useRef<ResizeObserver>()

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

  const handleDocumentMouseUp = useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        e.preventDefault()
        setDragging(false)
      }
    },
    [isDragging],
  )

  const handleDocumentMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging && scrollHostRef.current) {
        e.preventDefault()
        e.stopPropagation()
        const scrollHostElement = scrollHostRef.current
        const { scrollHeight, offsetHeight } = scrollHostElement

        const deltaY = e.clientY - lastScrollThumbPosition
        const percentage = deltaY * (scrollHeight / offsetHeight)

        setScrollThumbPosition(e.clientY)
        setScrollBoxTop(Math.min(Math.max(0, scrollBoxTop + deltaY), offsetHeight - scrollBoxHeight))
        scrollHostElement.scrollTop = Math.min(scrollHostElement.scrollTop + percentage, scrollHeight - offsetHeight)
      }
    },
    [isDragging, lastScrollThumbPosition, scrollBoxHeight, scrollBoxTop],
  )

  const handleScrollThumbMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setScrollThumbPosition(e.clientY)
    setDragging(true)
  }, [])

  const handleScroll = useCallback(() => {
    if (!scrollHostRef.current || !isScrollable) {
      return
    }
    const scrollHostElement = scrollHostRef.current
    const { scrollTop, scrollHeight, offsetHeight } = scrollHostElement

    setShowScrollbar(true)

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
    }

    scrollTimeoutRef.current = setTimeout(() => {
      setShowScrollbar(false)
    }, 500)

    const newTop = (parseInt(scrollTop.toString(), 10) / parseInt(scrollHeight.toString(), 10)) * offsetHeight
    setScrollBoxTop(Math.min(newTop, offsetHeight - scrollBoxHeight))

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
    const handleMouseMove = (e: MouseEvent) => handleDocumentMouseMove(e)
    const handleMouseUp = (e: MouseEvent) => handleDocumentMouseUp(e)

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('mouseleave', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('mouseleave', handleMouseUp)
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
            transition: 'opacity 0.5s ease-in-out',
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

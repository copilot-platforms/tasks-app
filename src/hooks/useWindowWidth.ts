import React from 'react'

export const useWindowWidth = () => {
  const [windowWidth, setWindowWidth] = React.useState<number>(0)

  function handleResize() {
    setWindowWidth(window.outerWidth)
  }
  React.useEffect(() => {
    window.addEventListener('resize', handleResize)

    handleResize()

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return windowWidth
}

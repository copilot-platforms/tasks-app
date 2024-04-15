import { useEffect, useRef } from 'react'

export function useFocusableInput(shouldFocus: boolean) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const setInputRef = (instance: HTMLInputElement | null) => {
    inputRef.current = instance
  }

  useEffect(() => {
    let timeout: NodeJS.Timeout
    if (shouldFocus) {
      timeout = setTimeout(() => {
        inputRef.current?.focus()
      })
    }

    return () => {
      if (timeout) {
        clearTimeout(timeout)
      }
    }
  }, [shouldFocus])

  return setInputRef
}

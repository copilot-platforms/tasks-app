// import { useRef, useEffect } from 'react'

// type Timer = ReturnType<typeof setTimeout>
// type SomeFunction = (...args: any[]) => void
// /**
//  *
//  * @param func The original, non debounced function (You can pass any number of args to it)
//  * @param delay The delay (in ms) for the function to return
//  * @returns The debounced function, which will run only if the debounced function has not been called in the last (delay) ms
//  */

// export function useDebounce<Func extends SomeFunction>(func: Func, delay = 500) {
//   const timer = useRef<Timer | null>(null)
//   useEffect(() => {
//     return () => {
//       if (!timer.current) return
//       clearTimeout(timer.current)
//     }
//   }, [])

//   const debouncedFunction = ((...args: Parameters<Func>) => {
//     const newTimer = setTimeout(() => {
//       func(...args)
//     }, delay)
//     timer.current && clearTimeout(timer.current)
//     timer.current = newTimer
//   }) as Func

//   return debouncedFunction
// }

import { useRef, useEffect, useCallback } from 'react'

type Timer = ReturnType<typeof setTimeout>
type SomeFunction = (...args: any[]) => void

/**
 *
 * @param func The original, non debounced function (You can pass any number of args to it)
 * @param delay The delay (in ms) for the function to return
 * @returns The debounced function, which will run periodically while the debounced function has been called in the last (delay) ms
 */
export function useDebounce<Func extends SomeFunction>(func: Func, delay = 500) {
  const timer = useRef<Timer | null>(null)
  const lastArgs = useRef<Parameters<Func>>()

  const debouncedFunction = useCallback(
    (...args: Parameters<Func>) => {
      lastArgs.current = args
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => {
        func(...args)
      }, delay)
    },
    [func, delay],
  )

  useEffect(() => {
    const interval = setInterval(() => {
      if (lastArgs.current) {
        func(...lastArgs.current)
      }
    }, delay)

    return () => {
      clearInterval(interval)
      if (timer.current) clearTimeout(timer.current)
    }
  }, [func, delay])

  return debouncedFunction as Func
}

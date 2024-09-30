import { Dispatch, SetStateAction } from 'react'

/**
 * Reusable util to stop a pending fetch from resolving using its timeout id
 * @param {NodeJS.Timeout | null} timeoutId ID for timeout responsible for doin the fetching
 * @param {Dispatch<SetStateAction<boolean>> | undefined} setLoadingState Loading state setter fn, if implemented
 */
export const stopPendingFetch = (timeoutId: NodeJS.Timeout | null, setLoadingState?: Dispatch<SetStateAction<boolean>>) => {
  // If new input value doesn't exist when inputChange is triggered, first clear active fetch timeout
  timeoutId && clearTimeout(timeoutId)
  setLoadingState?.(false) // If loading state is implemented, set that state to false
}

import { getAssigneeList } from '@/services/users'
import { FilterableUser } from '@/types/common'
import { Dispatch, SetStateAction } from 'react'
import { z } from 'zod'
import { addTypeToAssignee } from './addTypeToAssignee'
import { IAssigneeCombined } from '@/types/interfaces'

/**
 * Filters an array of Copilot IU / Client / Company to find keyword matching its name fields
 * @param users Array of IUs / Clients / Companies
 * @param keyword Keyword to match
 * @returns Array of matching results
 */
export const filterUsersByKeyword = (users: FilterableUser[], keyword: string): FilterableUser[] => {
  const lowerKeyword = keyword.toLowerCase()
  return users.filter(
    ({ givenName, familyName, name }) =>
      givenName?.toLowerCase().startsWith(lowerKeyword) ||
      familyName?.toLowerCase().startsWith(lowerKeyword) ||
      name?.toLowerCase().startsWith(lowerKeyword),
  )
}

export const setDebouncedFilteredAssignees = (
  activeDebounceTimeoutId: NodeJS.Timeout | null,
  setActiveDebounceTimeoutId: Dispatch<SetStateAction<NodeJS.Timeout | null>>,
  setLoading: Dispatch<SetStateAction<boolean>>,
  setAssigneeState: Dispatch<SetStateAction<IAssigneeCombined[]>>,
  token: string,
  newInputValue: string,
): void => {
  if (activeDebounceTimeoutId) {
    clearTimeout(activeDebounceTimeoutId)
  }
  const newTimeoutId = setTimeout(async () => {
    setLoading(true)
    const newAssignees = await getAssigneeList(z.string().parse(token), newInputValue)
    setAssigneeState(addTypeToAssignee(newAssignees))
    setLoading(false)
  }, 300)
  setActiveDebounceTimeoutId(newTimeoutId)
}

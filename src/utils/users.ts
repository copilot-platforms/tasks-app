import { getAssigneeList } from '@/services/users'
import { FilterableUser } from '@/types/common'
import { Dispatch, SetStateAction } from 'react'
import { z } from 'zod'
import { addTypeToAssignee } from '@/utils/addTypeToAssignee'
import { IAssigneeCombined } from '@/types/interfaces'
import { containsCaseInsensitiveSubstring, startsWithCaseInsensitiveSubstring } from '@/utils/string'

/**
 * Filters an array of Copilot IU / Client / Company to find keyword matching its name fields
 * @param users Array of IUs / Clients / Companies
 * @param keyword Keyword to match
 * @returns Array of matching results
 */
export const filterUsersByKeyword = (users: FilterableUser[], keyword: string): FilterableUser[] => {
  // Make startswith results come up first
  const startsWith = (str: string = '') => startsWithCaseInsensitiveSubstring(str, keyword)
  const contains = (str: string = '') => containsCaseInsensitiveSubstring(str, keyword)
  const usersStartingWithKeyword = users.filter(
    ({ givenName, familyName, name }) =>
      startsWith(givenName) || startsWith(familyName) || startsWith(`${givenName} ${familyName}`) || startsWith(name),
  )

  const usersContainingKeyword = users.filter(
    ({ givenName, familyName, name }) =>
      contains(givenName) || contains(familyName) || contains(`${givenName} ${familyName}`) || contains(name),
  )

  const combinedUsers = [...usersStartingWithKeyword, ...usersContainingKeyword]

  // Use a set to prevent dup records
  const addedIds = new Set<string>()
  const uniqueUsers = combinedUsers.filter((user) => {
    let isUniqueId = false
    if (!addedIds.has(user.id)) {
      addedIds.add(user.id)
      isUniqueId = true
    }

    return isUniqueId
  })

  return uniqueUsers
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
    const newAssignees = await getAssigneeList(z.string().parse(token), newInputValue, 10000, '0')
    setAssigneeState(addTypeToAssignee(newAssignees))
    setLoading(false)

    // TODO: Incremental refetching is being blocked by a fault(?) in Copilot API pagination
    // https://www.loom.com/share/3e9598dcf0de4180a255c5ce1f1173f0?sid=b6d7bb71-248e-4c36-a045-7cb5f31466be

    // First we fetch the first `CHUNK_SIZE` number of results for each of IU / client / company
    // const CHUNK_SIZE = 500
    // const MAX_DEPTH = 3000
    // const MAX_ITERATIONS = MAX_DEPTH / CHUNK_SIZE

    // Need to replace fetching logic to:
    // const newAssignees = await getAssigneeList(z.string().parse(token), newInputValue, CHUNK_SIZE, '0')

    // Then we update new data for assignee list in background incrementally until we hit max depth for each of them
    // for (let i = 1; i <= MAX_ITERATIONS; i++) {
    //   const newAssignees = await getAssigneeList(z.string().parse(token), newInputValue, CHUNK_SIZE, `${i}`)
    //   const newAssineeState = addTypeToAssignee(newAssignees)
    //   setAssigneeState((prev) => [...prev, ...newAssineeState])
    // }
  }, 200)
  setActiveDebounceTimeoutId(newTimeoutId)
}

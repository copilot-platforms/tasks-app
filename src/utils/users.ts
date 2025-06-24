import { FilterableUser } from '@/types/common'
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
